import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getUsersDb } from '@potato/database-users/client';
import { getChartsDb } from '@potato/database-charts/client';

// Get D1 database bindings from Cloudflare Workers environment
// For local development, these will be undefined and Drizzle will use DATABASE_URL
function getD1Binding(name: string): D1Database | undefined {
  // Prefer the Cloudflare context so we can access real D1 bindings in Workers.
  try {
    const context = getCloudflareContext();
    const binding = context?.env?.[name as keyof CloudflareEnv];
    if (binding && typeof binding === 'object') {
      return binding as D1Database;
    }
  } catch {
    // getCloudflareContext throws during local builds / tests where no context exists.
  }

  // Fallback for local development where Drizzle uses DATABASE_URL_* SQLite files.
  if (typeof process !== 'undefined' && process.env) {
    return (process.env as unknown as Record<string, D1Database | undefined>)[name];
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
