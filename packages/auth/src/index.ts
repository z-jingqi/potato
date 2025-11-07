import { getServerSession } from "next-auth"
import type { NextAuthOptions, User, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { usersDb } from "@potato/database-users"

// Extend next-auth types
declare module "next-auth" {
  interface User {
    username?: string
  }

  interface Session {
    user: {
      id?: string
      username?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await usersDb.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          username: user.username ?? undefined,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username
      }
      return session
    },
  },
}

/**
 * Get the current server session
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current authenticated user's ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id ?? null
}

/**
 * Require authentication
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error("Unauthorized")
  }
  return userId
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Register a new user
 * Username and password are required
 */
export async function registerUser(data: {
  username: string
  password: string
  email?: string
  name?: string
}) {
  // Check if username already exists
  const existingUser = await usersDb.user.findUnique({
    where: { username: data.username },
  })

  if (existingUser) {
    throw new Error("Username already exists")
  }

  // Check if email already exists (if provided)
  if (data.email) {
    const existingEmail = await usersDb.user.findUnique({
      where: { email: data.email },
    })

    if (existingEmail) {
      throw new Error("Email already exists")
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await usersDb.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })

  return user
}

// Export types
export type { NextAuthOptions, Session } from "next-auth"

// Export validation schemas
export * from "./validations"
