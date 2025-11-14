# Potato Setup Guide

## What Was Fixed

### TypeScript Path Mappings
Added path mappings in `apps/charts/tsconfig.json` for all `@potato/*` packages:
- `@potato/database-users`
- `@potato/database-charts`
- `@potato/auth`
- `@potato/ai`

### Next.js Configuration
Updated `apps/charts/next.config.mjs`:
- Added all `@potato/*` packages to `transpilePackages`
- Added Drizzle packages to `serverComponentsExternalPackages`

## Package Structure

```
packages/
├── database-users/     → @potato/database-users
├── database-charts/    → @potato/database-charts
├── auth/               → @potato/auth
├── ai/                 → @potato/ai
└── ui/                 → @potato/ui
```

## Import Examples

```typescript
// Database
import { getUsersDb } from '@potato/database-users/client';
import { getChartsDb } from '@potato/database-charts/client';

// Auth
import { createAuthConfig } from '@potato/auth/config';
import { hashPassword } from '@potato/auth/utils';

// AI
import { createAIClient, AI_MODELS } from '@potato/ai';

// UI Components
import { Button } from '@potato/ui/components/button';
```

## Running the App

```bash
# Start development server
pnpm dev

# The app will be available at:
# http://localhost:3000
```

## Database Files

Local SQLite databases are stored at:
- `packages/database-users/db/dev.db` (users & authentication)
- `packages/database-charts/db/dev.db` (collections, records & AI analysis)

The project uses **Drizzle ORM** with support for both:
- Local development: SQLite via better-sqlite3
- Production: Cloudflare D1

## Environment Variables

See `apps/charts/.env.local` for configuration.
