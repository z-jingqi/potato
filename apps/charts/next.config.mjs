/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@potato/ui",
    "@potato/database-users",
    "@potato/database-charts",
    "@potato/auth",
    "@potato/ai"
  ],
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-d1'],
};

export default nextConfig;
