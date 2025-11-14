/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@potato/ui",
    "@potato/database-users",
    "@potato/database-charts",
    "@potato/auth",
    "@potato/ai"
  ],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
