import { PrismaClient } from '../node_modules/.prisma/client-users'

declare global {
  // eslint-disable-next-line no-var
  var prismaUsers: PrismaClient | undefined
}

export const usersDb = global.prismaUsers || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaUsers = usersDb
}

export * from '../node_modules/.prisma/client-users'
