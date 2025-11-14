import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV !== "production") {
  // Makes the Cloudflare context (D1, KV, etc.) available during `next dev`.
  initOpenNextCloudflareForDev();
}

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
