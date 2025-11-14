import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from './utils';
import type { UsersDatabase } from '@potato/database-users';
import { eq } from 'drizzle-orm';
import { users } from '@potato/database-users';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
  interface DefaultSession {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export interface AuthContext {
  db: UsersDatabase;
}

export function createAuthConfig(context: AuthContext): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const [user] = await context.db
            .select()
            .from(users)
            .where(eq(users.username, credentials.username))
            .limit(1);

          if (!user) {
            return null;
          }

          const isValidPassword = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.username,
            email: null,
          };
        },
      }),
    ],
    pages: {
      signIn: '/login',
    },
    callbacks: {
      async jwt({ token, user }) {
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
    session: {
      strategy: 'jwt',
    },
  };
}
