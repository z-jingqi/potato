import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { usersDb } from "@potato/database-users";

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode for detailed logs
  session: {
    strategy: "jwt",
    // Session expires after 30 days of inactivity
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    // Alternative options:
    // maxAge: 90 * 24 * 60 * 60,  // 3 months
    // maxAge: 180 * 24 * 60 * 60, // 6 months

    // Update session age on every request (rolling sessions)
    // Session will only expire after 30 days of complete inactivity
    updateAge: 24 * 60 * 60, // Throttle updates to once per day
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🚀 Authorize function called!");
        console.log("📦 Received credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Auth failed: Missing credentials");
          return null;
        }

        console.log("🔍 Looking for user:", credentials.email);

        const user = await usersDb.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ Auth failed: User not found");
          return null;
        }

        console.log("✅ User found:", user.email);

        const isPasswordValid = await compare(
          credentials.password,
          user.password!
        );

        if (!isPasswordValid) {
          console.log("❌ Auth failed: Invalid password");
          return null;
        }

        console.log("✅ Auth successful:", user.email);

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // JWT token configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // Should match session maxAge
  },
};
