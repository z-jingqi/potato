import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  transpilePackages: ['@potato/ui'],
};

export default nextConfig;
