import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { createAuthConfig } from '@potato/auth/config';
import { getUsersDatabase } from './db';

export const authOptions: NextAuthOptions = {
  ...createAuthConfig({
    db: getUsersDatabase(),
  }),
  secret: process.env.AUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
