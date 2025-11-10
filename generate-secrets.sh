#!/bin/bash

echo "🔐 生成三个环境的 NEXTAUTH_SECRET"
echo ""
echo "=== Local (本地开发) ==="
LOCAL_SECRET=$(openssl rand -base64 32)
echo "$LOCAL_SECRET"
echo ""
echo "=== Dev (开发环境) ==="
DEV_SECRET=$(openssl rand -base64 32)
echo "$DEV_SECRET"
echo ""
echo "=== Production (生产环境) ==="
PROD_SECRET=$(openssl rand -base64 32)
echo "$PROD_SECRET"
echo ""
echo "✅ 请保存这些密钥："
echo "   - Local: 用于 apps/charts/.env.local 和 apps/diet/.env.local"
echo "   - Dev: 用于 Cloudflare Pages Preview 环境"
echo "   - Production: 用于 Cloudflare Pages Production 环境"
