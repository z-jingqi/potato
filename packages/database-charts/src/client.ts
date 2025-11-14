import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import Database from 'better-sqlite3';
import * as schema from './schema';

type D1Database = any; // Cloudflare D1 database type

type ChartsDbType = BetterSQLite3Database<typeof schema> | DrizzleD1Database<typeof schema>;

let db: ChartsDbType | undefined;

export function getChartsDb(d1?: D1Database): ChartsDbType {
  if (db) return db;

  if (d1) {
    // For Cloudflare Workers with D1
    db = drizzleD1(d1, { schema });
  } else {
    // For local development
    const dbPath = process.env.DATABASE_URL_CHARTS?.replace('file:', '') || './db/dev.db';
    const sqlite = new Database(dbPath);
    db = drizzleBetterSqlite(sqlite, { schema });
  }

  return db;
}

export type ChartsDatabase = ChartsDbType;
