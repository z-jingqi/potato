import { getUsersDb } from '@potato/database-users/client';
import { getChartsDb } from '@potato/database-charts/client';

// Get D1 database bindings from Cloudflare Workers environment
// For local development, these will be undefined and Prisma will use DATABASE_URL
function getD1Binding(name: string): D1Database | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return (process.env as any)[name] as D1Database | undefined;
  }
  return undefined;
}

export function getUsersDatabase() {
  const d1 = getD1Binding('DB_USERS');
  return getUsersDb(d1);
}

export function getChartsDatabase() {
  const d1 = getD1Binding('DB_CHARTS');
  return getChartsDb(d1);
}
