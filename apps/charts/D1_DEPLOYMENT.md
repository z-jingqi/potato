# Cloudflare D1 Database Deployment Guide

This guide explains how to deploy your Prisma schemas to Cloudflare D1 databases.

## Database Setup

Your project uses two D1 databases:
- **potato-users**: Shared user authentication database
- **potato-charts**: Charts/collections specific database

Both have development and production environments configured in `wrangler.toml`.

## Quick Start

### Initial Setup

1. **Create migrations** (if you haven't already):
```bash
# From project root
cd packages/database-users
pnpm db:migrate

cd ../database-charts
pnpm db:migrate
```

2. **Deploy to D1 Development**:
```bash
# From apps/charts directory
pnpm d1:setup:dev
```

3. **Deploy to D1 Production**:
```bash
# From apps/charts directory
pnpm d1:setup:prod
```

## Available Scripts

### App-Level Scripts (run from `apps/charts`)

- `pnpm db:generate` - Generate Prisma clients for both databases
- `pnpm db:migrate` - Create new migrations for both databases (local dev)
- `pnpm d1:push:dev` - Push all migrations to D1 development databases
- `pnpm d1:push:prod` - Push all migrations to D1 production databases
- `pnpm d1:setup:dev` - Full setup: generate clients + push to dev D1
- `pnpm d1:setup:prod` - Full setup: generate clients + push to prod D1

### Package-Level Scripts (run from individual database packages)

#### For `packages/database-users`:
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Create new migration (local SQLite)
- `pnpm db:migrate:create` - Create migration without applying
- `pnpm db:studio` - Open Prisma Studio
- `pnpm d1:push:dev` - Push latest migration to D1 dev
- `pnpm d1:push:prod` - Push latest migration to D1 prod
- `pnpm d1:push:all:dev` - Push all migrations to D1 dev
- `pnpm d1:push:all:prod` - Push all migrations to D1 prod

#### For `packages/database-charts`:
Same scripts as above, but for the charts database.

## Workflow Examples

### 1. Making Schema Changes

When you need to update your database schema:

```bash
# 1. Edit your schema file
# packages/database-charts/prisma/schema.prisma
# OR
# packages/database-users/prisma/schema.prisma

# 2. Create and apply migration locally
cd packages/database-charts  # or database-users
pnpm db:migrate  # This will prompt for a migration name

# 3. Test locally, then deploy to D1 development
cd ../../apps/charts
pnpm d1:push:dev

# 4. After testing, deploy to production
pnpm d1:push:prod
```

### 2. Fresh D1 Database Setup

If you're setting up D1 databases for the first time:

```bash
# 1. Ensure migrations exist
cd packages/database-users
pnpm db:migrate

cd ../database-charts
pnpm db:migrate

# 2. Deploy everything to D1
cd ../../apps/charts
pnpm d1:setup:dev   # For development
pnpm d1:setup:prod  # For production
```

### 3. Using the Helper Script

For a guided deployment process:

```bash
# From apps/charts directory
./scripts/deploy-d1.sh dev   # Deploy to development
./scripts/deploy-d1.sh prod  # Deploy to production
```

This script will:
- Generate Prisma clients
- Check for migrations
- Deploy all migrations to D1
- Show colored output for easy tracking

## Important Notes

### Migration Strategy

- **Local Development**: Use SQLite with Prisma Migrate
- **D1 Deployment**: Use wrangler to execute migration SQL files

### When to Use Each Script

- **`d1:push:dev` / `d1:push:prod`**: Pushes the latest migration only
- **`d1:push:all:dev` / `d1:push:all:prod`**: Pushes all migrations (useful for fresh databases)
- **`d1:setup:dev` / `d1:setup:prod`**: Complete setup including client generation

### Troubleshooting

**Error: "No such file or directory" when pushing migrations**
- Make sure you've created migrations first with `pnpm db:migrate`

**Error: "Database not found"**
- Check that your database IDs in `wrangler.toml` are correct
- Ensure you're logged in with `wrangler login`

**Error: "Migration already applied"**
- This is usually safe to ignore - D1 will skip already applied migrations
- Use `d1:push:all:dev` or `d1:push:all:prod` to apply all migrations in order

## Database Configuration

Your D1 databases are configured in `wrangler.toml`:

```toml
# Production
[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "f347cb96-37c2-42b8-9187-e3dd90509d35"

[[d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts"
database_id = "19bc6396-4b23-439f-b4c6-cf5a5bd57ca1"

# Development
[env.development]
[[env.development.d1_databases]]
binding = "DB_USERS"
database_name = "potato-users-dev"
database_id = "89561997-1a56-43cb-9dcc-814f700e8e6e"

[[env.development.d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts-dev"
database_id = "7b1f249e-74d8-4621-b17c-cff14e13d246"
```

## References

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Prisma with D1 Guide](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
