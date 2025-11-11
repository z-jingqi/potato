import { PrismaClient } from './generated/client-charts';
import { PrismaD1 } from '@prisma/adapter-d1';

let prisma: PrismaClient | undefined;

export function getChartsDb(d1?: D1Database) {
  if (prisma) return prisma;

  if (d1) {
    // For Cloudflare Workers with D1
    const adapter = new PrismaD1(d1);
    prisma = new PrismaClient({ adapter });
  } else {
    // For local development
    prisma = new PrismaClient();
  }

  return prisma;
}

export type ChartsDatabase = ReturnType<typeof getChartsDb>;
