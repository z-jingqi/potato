import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaDiet: PrismaClient | undefined
}

export const dietDb = global.prismaDiet || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaDiet = dietDb
}

export * from '@prisma/client'
