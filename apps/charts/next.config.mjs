/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  transpilePackages: ['@potato/ui'],
};

export default nextConfig;
