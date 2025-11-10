# Cloudflare Pages Deployment Guide (Manual with Wrangler CLI)

This guide covers **manual deployment** using the Wrangler CLI for both Diet AI and Charts apps to Cloudflare Pages with D1 databases.

> **💡 Looking for automatic Git-based deployments?** See [DEPLOYMENT-GIT.md](./DEPLOYMENT-GIT.md) for automatic deployments when PRs are merged.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Overview](#overview)
- [Database Setup](#database-setup)
- [Deploying Charts App](#deploying-charts-app)
- [Deploying Diet App](#deploying-diet-app)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

1. **Wrangler CLI** (Cloudflare's command-line tool)
   ```bash
   npm install -g wrangler
   # or
   pnpm add -g wrangler
   ```

2. **Cloudflare Account**
   - Create a free account at [cloudflare.com](https://cloudflare.com)
   - Note your Account ID from the dashboard

3. **Authenticate Wrangler**
   ```bash
   wrangler login
   ```
   This will open a browser window for authentication.

### Verify Authentication
```bash
wrangler whoami
```

---

## Overview

### Choosing a Deployment Method

| Feature | Wrangler CLI (This Guide) | Git Integration ([DEPLOYMENT-GIT.md](./DEPLOYMENT-GIT.md)) |
|---------|---------------------------|-----------------------------------------------------------|
| **Trigger** | Manual command | Automatic on git push |
| **Setup** | Configure wrangler.toml | One-time via dashboard |
| **CI/CD** | Custom scripts needed | Built-in |
| **Preview Deploys** | Not available | Automatic for PRs |
| **Speed** | Fast (build locally) | Depends on Cloudflare build queue |
| **Control** | Full control | Limited to Cloudflare build system |
| **Best For** | Testing, quick deploys | Production, team workflows |

Choose **Wrangler CLI** (this guide) if you want manual control and quick deployments.

Choose **Git Integration** if you want automatic deployments and PR previews.

### Application Overview

The monorepo contains two deployable applications:

- **Diet AI** (`apps/diet`) - AI recipe generator with conversation history
- **Charts** (`apps/charts`) - Personal data tracking and visualization

Both apps share a common **Users database** (`potato-users`) for authentication, and each has its own application-specific database.

### Database Structure

```
┌─────────────────────────────┐
│     potato-users (shared)   │
│  - User accounts            │
│  - Authentication           │
└─────────────────────────────┘
         ↓            ↓
    ┌────────┐   ┌──────────┐
    │ Charts │   │   Diet   │
    │   DB   │   │    DB    │
    └────────┘   └──────────┘
```

---

## Database Setup

### Step 1: Create D1 Databases

Create all three D1 databases (run these commands from the monorepo root):

```bash
# Shared users database (create only once)
wrangler d1 create potato-users

# Charts app database
wrangler d1 create potato-charts

# Diet app database
wrangler d1 create potato-diet
```

**Save the database IDs** from the output. Each command will return something like:

```
✅ Successfully created DB 'potato-users' in region WEUR
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "potato-users"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: Update Configuration Files

Update the `database_id` fields in the wrangler.toml files:

#### Charts App: `apps/charts/wrangler.toml`

```toml
[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "your-users-database-id-here"

[[d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts"
database_id = "your-charts-database-id-here"
```

#### Diet App: `apps/diet/wrangler.toml`

```toml
[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "your-users-database-id-here"  # Same ID as charts

[[d1_databases]]
binding = "DB_DIET"
database_name = "potato-diet"
database_id = "your-diet-database-id-here"
```

### Step 3: Generate and Apply Migrations

#### Generate SQL Migration Files

```bash
# From monorepo root
pnpm db:generate
```

This generates Prisma clients and SQL migration files.

#### Apply Migrations to D1 Databases

You'll need to manually create SQL migration files from your Prisma schemas. For each database:

**Users Database:**
```bash
cd packages/database-users
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# Apply to remote D1
wrangler d1 execute potato-users --remote --file=migration.sql
```

**Charts Database:**
```bash
cd packages/database-charts
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

wrangler d1 execute potato-charts --remote --file=migration.sql
```

**Diet Database:**
```bash
cd packages/database-diet
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

wrangler d1 execute potato-diet --remote --file=migration.sql
```

### Step 4: Verify Database Creation

```bash
# List all D1 databases
wrangler d1 list

# Query a database to verify tables
wrangler d1 execute potato-users --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## Deploying Charts App

### Step 1: Environment Variables

The Charts app needs a `NEXTAUTH_SECRET` for authentication.

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 2: Build the App

```bash
# From monorepo root
pnpm build:charts

# Generate Cloudflare Pages adapter output
pnpm pages:build:charts
```

This creates the `.next` directory with the Next.js build output.

### Step 3: Deploy to Cloudflare Pages

```bash
# From monorepo root
pnpm deploy:charts

# Or manually from the charts directory
cd apps/charts
pnpm pages:deploy
```

### Step 4: Configure Environment Variables in Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **potato-charts** → **Settings** → **Environment Variables**
3. Add the following variables:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `NEXTAUTH_SECRET` | Your generated secret | Required for authentication |
   | `NEXTAUTH_URL` | `https://your-deployment-url.pages.dev` | Your actual deployment URL |

4. Click **Save** and **Redeploy** the project

### Step 5: Verify Deployment

Visit your deployment URL and test:
- [ ] Homepage loads
- [ ] Can create an account
- [ ] Can log in
- [ ] Can create a chart
- [ ] Can add data points

---

## Deploying Diet App

### Step 1: Environment Variables

The Diet app requires OpenRouter API configuration.

#### Get OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create an API key from the dashboard
3. Save the key securely

### Step 2: Build the App

```bash
# From monorepo root
pnpm build:diet

# Generate Cloudflare Pages adapter output
pnpm pages:build:diet
```

### Step 3: Deploy to Cloudflare Pages

```bash
# From monorepo root
pnpm deploy:diet

# Or manually from the diet directory
cd apps/diet
pnpm pages:deploy
```

### Step 4: Configure Environment Variables in Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **potato-diet** → **Settings** → **Environment Variables**
3. Add the following variables:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `NEXTAUTH_SECRET` | Your generated secret | Required for authentication |
   | `NEXTAUTH_URL` | `https://your-deployment-url.pages.dev` | Your actual deployment URL |
   | `OPENROUTER_API_KEY` | Your OpenRouter API key | Required for AI features |

   **Optional variables** (already set in `wrangler.toml`, but can be overridden):
   - `OPENROUTER_BASE_URL` (default: `https://openrouter.ai/api/v1`)
   - `OPENROUTER_DEFAULT_MODEL` (default: `openai/gpt-oss-20b:free`)
   - `OPENROUTER_RECIPE_MODEL` (default: `minimax/minimax-m2:free`)

4. Click **Save** and **Redeploy** the project

### Step 5: Configure Secrets (Alternative Method)

Instead of using the dashboard, you can set secrets via Wrangler:

```bash
cd apps/diet
wrangler pages secret put NEXTAUTH_SECRET
wrangler pages secret put OPENROUTER_API_KEY
```

You'll be prompted to enter the values interactively.

### Step 6: Verify Deployment

Visit your deployment URL and test:
- [ ] Homepage loads
- [ ] Can create an account
- [ ] Can log in
- [ ] Can start a chat
- [ ] AI generates responses
- [ ] Conversation history persists

---

## Post-Deployment

### Custom Domains

To use a custom domain:

1. Go to **Workers & Pages** → Your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` environment variable to match your custom domain

### Monitoring

Monitor your deployments:

```bash
# View deployment logs
wrangler pages deployment list --project-name=potato-charts
wrangler pages deployment list --project-name=potato-diet

# View live logs
wrangler pages deployment tail --project-name=potato-charts
```

### Database Backups

Regularly backup your D1 databases:

```bash
# Export database to SQL file
wrangler d1 export potato-users --remote --output=users-backup.sql
wrangler d1 export potato-charts --remote --output=charts-backup.sql
wrangler d1 export potato-diet --remote --output=diet-backup.sql
```

### Rollback

If you need to rollback to a previous deployment:

1. Go to **Workers & Pages** → Your project → **Deployments**
2. Find the working deployment
3. Click **⋯** (three dots) → **Rollback to this deployment**

---

## Troubleshooting

### Build Errors

**Issue**: `Module not found` errors during build

**Solution**:
```bash
# Clean build artifacts
pnpm clean

# Regenerate Prisma clients
pnpm db:generate

# Rebuild
pnpm install
pnpm build:charts  # or build:diet
```

### Database Connection Errors

**Issue**: `D1_ERROR: Database not found`

**Solution**:
- Verify database IDs in `wrangler.toml` are correct
- Ensure databases exist: `wrangler d1 list`
- Check binding names match your code

### Authentication Errors

**Issue**: NextAuth errors or infinite redirect loops

**Solution**:
- Verify `NEXTAUTH_URL` matches your deployment URL exactly (including protocol)
- Ensure `NEXTAUTH_SECRET` is set and at least 32 characters
- Clear browser cookies and try again

### API Key Errors (Diet App)

**Issue**: OpenRouter API returns 401 Unauthorized

**Solution**:
- Verify `OPENROUTER_API_KEY` is set correctly
- Check API key is valid at [openrouter.ai](https://openrouter.ai)
- Ensure you have credits in your OpenRouter account

### Build is Successful but App Doesn't Work

**Issue**: Deployment succeeds but app shows errors

**Solution**:
1. Check the **Functions** tab in Cloudflare dashboard for error logs
2. Verify all environment variables are set
3. Test database connections:
   ```bash
   wrangler d1 execute potato-users --remote --command="SELECT COUNT(*) FROM User"
   ```
4. Check compatibility date in `wrangler.toml` is recent

### Migration Errors

**Issue**: Migrations fail to apply

**Solution**:
```bash
# Check current database schema
wrangler d1 execute potato-users --remote --command=".schema"

# Drop and recreate tables (⚠️ destroys data)
wrangler d1 execute potato-users --remote --command="DROP TABLE IF EXISTS User"

# Reapply migration
wrangler d1 execute potato-users --remote --file=migration.sql
```

---

## Useful Commands Reference

### Database Management

```bash
# List all databases
wrangler d1 list

# Create database
wrangler d1 create <database-name>

# Delete database (⚠️ irreversible)
wrangler d1 delete <database-name>

# Execute SQL command
wrangler d1 execute <database-name> --remote --command="<SQL>"

# Execute SQL file
wrangler d1 execute <database-name> --remote --file=<path-to-sql>

# Export database
wrangler d1 export <database-name> --remote --output=<filename>

# Query database
wrangler d1 execute <database-name> --remote --command="SELECT * FROM User LIMIT 5"
```

### Deployment Commands

```bash
# From monorepo root

# Build
pnpm build:charts
pnpm build:diet

# Deploy
pnpm deploy:charts
pnpm deploy:diet

# Preview (local)
pnpm preview:charts
pnpm preview:diet
```

### Development Commands

```bash
# Run dev server
pnpm dev:charts
pnpm dev:diet

# Lint
pnpm lint:charts
pnpm lint:diet

# Generate Prisma clients
pnpm db:generate

# Open Prisma Studio
pnpm db:studio:users
pnpm db:studio:charts
pnpm db:studio:diet
```

---

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Next.js Cloudflare Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [OpenRouter Documentation](https://openrouter.ai/docs)

---

## Support

If you encounter issues not covered in this guide:

1. Check Cloudflare's [Community Forums](https://community.cloudflare.com/)
2. Review [Cloudflare Status](https://www.cloudflarestatus.com/)
3. Check the project's issue tracker
4. Review application logs in Cloudflare dashboard
