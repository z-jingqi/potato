import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaCharts: PrismaClient | undefined
}

export const chartsDb = global.prismaCharts || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaCharts = chartsDb
}

export * from '@prisma/client'
