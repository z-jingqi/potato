# Cloudflare Pages - Multiple Environments Setup

This guide covers setting up **separate development and production environments** for your apps on Cloudflare Pages.

## Table of Contents

- [Overview](#overview)
- [Strategy 1: Branch-Based Environments](#strategy-1-branch-based-environments-recommended)
- [Strategy 2: Separate Projects](#strategy-2-separate-projects)
- [Strategy 3: Environment Variables Only](#strategy-3-environment-variables-only)
- [Database Strategy](#database-strategy)
- [Complete Setup Example](#complete-setup-example)
- [Best Practices](#best-practices)

---

## Overview

Cloudflare Pages supports multiple environments through:

1. **Production vs Preview** deployments (built-in)
2. **Branch-based** deployments
3. **Environment-specific** variables
4. **Separate D1 databases** per environment

### Built-in Environment Types

Cloudflare automatically provides two environment types:

| Environment | Trigger | URL Pattern |
|-------------|---------|-------------|
| **Production** | Merge to production branch (e.g., `main`) | `https://your-app.pages.dev` |
| **Preview** | Push to any other branch | `https://abc123.your-app.pages.dev` |

---

## Strategy 1: Branch-Based Environments (Recommended)

This is the **most common and recommended** approach.

### Architecture

```
Repository Structure:
├── main (production)
├── develop (development)
└── feature/* (feature branches)

Cloudflare Deployments:
├── Production: main → https://potato-charts.pages.dev
├── Development: develop → https://abc123.potato-charts.pages.dev
└── Features: feature/* → https://xyz789.potato-charts.pages.dev
```

### Step 1: Create Development Branch

```bash
# Create and push develop branch
git checkout -b develop
git push origin develop

# Set develop as the default branch for development work
git branch --set-upstream-to=origin/develop develop
```

### Step 2: Configure Cloudflare Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project → **Settings**
3. Go to **Builds & deployments**

**Configure:**
- **Production branch**: `main`
- **Preview deployments**: Enable for all branches
- **Branch patterns** (optional): `develop`, `feature/*`, `staging`

### Step 3: Set Environment-Specific Variables

Go to **Settings** → **Environment variables**

#### For Production (main branch):

| Variable | Value | Type |
|----------|-------|------|
| `NEXTAUTH_SECRET` | `[prod secret]` | Encrypted |
| `NEXTAUTH_URL` | `https://potato-charts.pages.dev` | Public |
| `NODE_ENV` | `production` | Public |
| `ENVIRONMENT` | `production` | Public |

#### For Preview (all other branches including develop):

| Variable | Value | Type |
|----------|-------|------|
| `NEXTAUTH_SECRET` | `[dev secret]` | Encrypted |
| `NEXTAUTH_URL` | `https://dev.potato-charts.pages.dev` (or preview URL) | Public |
| `NODE_ENV` | `development` | Public |
| `ENVIRONMENT` | `development` | Public |

### Step 4: Create Separate D1 Databases

Create development databases:

```bash
# Production databases (already created)
wrangler d1 create potato-users          # Already exists
wrangler d1 create potato-charts         # Already exists
wrangler d1 create potato-diet          # Already exists

# Development databases
wrangler d1 create potato-users-dev
wrangler d1 create potato-charts-dev
wrangler d1 create potato-diet-dev
```

### Step 5: Configure Environment-Specific D1 Bindings

This is the **tricky part** - Cloudflare doesn't support environment-specific D1 bindings through the UI. You need to use **Wrangler configuration**.

**Option A: Use wrangler.toml with environments**

Create environment-specific configurations:

**`apps/charts/wrangler.toml`:**
```toml
name = "potato-charts"
compatibility_date = "2025-01-01"
pages_build_output_dir = ".vercel/output/static"

# Default (Production) bindings
[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts"
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"

# Development environment
[env.development]
[[env.development.d1_databases]]
binding = "DB_USERS"
database_name = "potato-users-dev"
database_id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

[[env.development.d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts-dev"
database_id = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
```

**Option B: Manual configuration via Cloudflare API**

Unfortunately, Cloudflare Pages UI doesn't support preview-specific D1 bindings yet. You have two workarounds:

**Workaround 1: Share databases** (use same databases for dev/prod but add environment column)
**Workaround 2: Use separate projects** (see Strategy 2)

### Step 6: Workflow

```bash
# Development workflow
git checkout develop
# ... make changes ...
git add .
git commit -m "Add feature"
git push origin develop
# → Automatically deploys to preview URL with DEVELOPMENT env vars

# Production workflow
git checkout main
git merge develop
git push origin main
# → Automatically deploys to production URL with PRODUCTION env vars
```

### Step 7: Get Preview URL for Develop Branch

After pushing to `develop`, get the preview URL:

1. Go to **Deployments** tab
2. Find the `develop` branch deployment
3. Copy the preview URL (e.g., `https://abc123.potato-charts.pages.dev`)
4. Optionally, set up a **custom preview domain** for consistency

### Step 8: Custom Preview Domains (Optional)

Set up consistent URLs for your development environment:

1. Go to **Custom domains** → **Set up a custom domain**
2. Add development subdomain:
   - `dev.charts.yourdomain.com` → Points to develop branch
   - Configure DNS: CNAME to `abc123.potato-charts.pages.dev`

3. Update Preview `NEXTAUTH_URL`:
   - Go to **Settings** → **Environment variables**
   - Set Preview `NEXTAUTH_URL` to `https://dev.charts.yourdomain.com`

---

## Strategy 2: Separate Projects

Create **completely separate Cloudflare Pages projects** for each environment.

### Architecture

```
Projects:
├── potato-charts (production)
│   └── Branch: main
│   └── URL: https://potato-charts.pages.dev
│
└── potato-charts-dev (development)
    └── Branch: develop
    └── URL: https://potato-charts-dev.pages.dev
```

### Step 1: Create Two Cloudflare Projects

#### Production Project:
- **Name**: `potato-charts`
- **Production branch**: `main`
- **Build command**: `cd apps/charts && npx @cloudflare/next-on-pages@latest`
- **Output directory**: `apps/charts/.vercel/output/static`

#### Development Project:
- **Name**: `potato-charts-dev`
- **Production branch**: `develop`
- **Build command**: `cd apps/charts && npx @cloudflare/next-on-pages@latest`
- **Output directory**: `apps/charts/.vercel/output/static`

### Step 2: Configure Separate Databases

**Production project** uses:
- `potato-users` (production)
- `potato-charts` (production)

**Development project** uses:
- `potato-users-dev`
- `potato-charts-dev`

Set D1 bindings separately in each project.

### Step 3: Set Environment Variables

**Production project (`potato-charts`):**
```env
NEXTAUTH_SECRET=[prod-secret]
NEXTAUTH_URL=https://potato-charts.pages.dev
NODE_ENV=production
ENVIRONMENT=production
```

**Development project (`potato-charts-dev`):**
```env
NEXTAUTH_SECRET=[dev-secret]
NEXTAUTH_URL=https://potato-charts-dev.pages.dev
NODE_ENV=development
ENVIRONMENT=development
```

### Step 4: Workflow

```bash
# Deploy to development
git checkout develop
git push origin develop
# → Triggers potato-charts-dev deployment

# Deploy to production
git checkout main
git merge develop
git push origin main
# → Triggers potato-charts deployment
```

### Pros and Cons

**Pros:**
✅ Complete isolation between environments
✅ Separate D1 bindings per environment (easier to configure)
✅ Independent deployments
✅ Clear separation in Cloudflare dashboard

**Cons:**
❌ More complex to manage (2x projects per app = 4 total projects)
❌ More expensive (counts toward project limits)
❌ Duplicate configuration

---

## Strategy 3: Environment Variables Only

Use the **same databases** for both environments, but distinguish data using environment flags.

### Setup

**Add environment column to tables:**

```sql
-- Migration for all tables
ALTER TABLE User ADD COLUMN environment TEXT DEFAULT 'production';
ALTER TABLE Conversation ADD COLUMN environment TEXT DEFAULT 'production';
ALTER TABLE Chart ADD COLUMN environment TEXT DEFAULT 'production';
```

**Update Prisma schemas:**

```prisma
model User {
  id          String   @id @default(uuid())
  username    String   @unique
  email       String?  @unique
  password    String?
  name        String?
  environment String   @default("production") // Add this
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Filter queries by environment:**

```typescript
// In your API routes
const environment = process.env.ENVIRONMENT || 'production';

const users = await usersDb.user.findMany({
  where: {
    environment: environment, // Filter by environment
  },
});
```

### Pros and Cons

**Pros:**
✅ Simple setup
✅ Single database to manage
✅ No need for separate D1 databases

**Cons:**
❌ Risk of mixing dev/prod data
❌ More complex queries
❌ Not true isolation
❌ Not recommended for production use

---

## Database Strategy

### Recommended Approach

Create **separate D1 databases** for each environment:

```
Production:
├── potato-users (shared by charts & diet)
├── potato-charts
└── potato-diet

Development:
├── potato-users-dev (shared by charts & diet)
├── potato-charts-dev
└── potato-diet-dev

Staging (optional):
├── potato-users-staging
├── potato-charts-staging
└── potato-diet-staging
```

### Creating Development Databases

```bash
# Create development databases
wrangler d1 create potato-users-dev
wrangler d1 create potato-charts-dev
wrangler d1 create potato-diet-dev

# Save the database IDs
# Add to wrangler.toml or configure in Cloudflare dashboard
```

### Applying Migrations

Apply the same migrations to development databases:

```bash
# Generate migration SQL
cd packages/database-users
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# Apply to DEVELOPMENT database
wrangler d1 execute potato-users-dev --remote --file=migration.sql

# Repeat for other databases
cd ../database-charts
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
wrangler d1 execute potato-charts-dev --remote --file=migration.sql

cd ../database-diet
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
wrangler d1 execute potato-diet-dev --remote --file=migration.sql
```

### Syncing Production Data to Development (Optional)

```bash
# Export from production
wrangler d1 export potato-users --remote --output=users-prod.sql
wrangler d1 export potato-charts --remote --output=charts-prod.sql

# Import to development
wrangler d1 execute potato-users-dev --remote --file=users-prod.sql
wrangler d1 execute potato-charts-dev --remote --file=charts-prod.sql
```

**⚠️ Warning**: Never sync FROM development TO production!

---

## Complete Setup Example

Let's set up **Charts app** with both development and production environments using **Strategy 1** (Branch-Based).

### Step 1: Create Branches

```bash
# Create development branch
git checkout -b develop
git push origin develop

# Keep main for production
git checkout main
```

### Step 2: Create Development Databases

```bash
wrangler d1 create potato-users-dev
wrangler d1 create potato-charts-dev

# Output:
# Database ID for potato-users-dev: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
# Database ID for potato-charts-dev: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
```

### Step 3: Configure Cloudflare Project

1. **Connect repository**: Workers & Pages → Connect to Git → Select repo
2. **Configure build**:
   - Project name: `potato-charts`
   - Production branch: `main`
   - Build command: `cd apps/charts && npx @cloudflare/next-on-pages@latest`
   - Build output: `apps/charts/.vercel/output/static`

### Step 4: Configure D1 Bindings

**Production (main branch):**
- Go to **Settings** → **Functions** → **D1 database bindings**
- Add bindings:
  - `DB_USERS` → `potato-users` (prod database ID)
  - `DB_CHARTS` → `potato-charts` (prod database ID)

**Preview (develop and other branches):**

Unfortunately, Cloudflare doesn't yet support preview-specific D1 bindings in the UI.

**Workaround**: Use **separate projects** (Strategy 2) for true environment isolation with D1.

### Step 5: Configure Environment Variables

**Production variables:**
| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `[generated-prod-secret]` |
| `NEXTAUTH_URL` | `https://potato-charts.pages.dev` |
| `NODE_ENV` | `production` |

**Preview variables:**
| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `[generated-dev-secret]` |
| `NEXTAUTH_URL` | `https://dev.potato-charts.pages.dev` |
| `NODE_ENV` | `development` |

### Step 6: Deploy

```bash
# Deploy to development (preview)
git checkout develop
git push origin develop
# → Creates preview deployment with preview environment variables

# Deploy to production
git checkout main
git merge develop
git push origin main
# → Deploys to production with production environment variables
```

### Step 7: Access Your Environments

- **Production**: `https://potato-charts.pages.dev`
- **Development**: `https://abc123.potato-charts.pages.dev` (check Deployments tab for URL)

---

## Best Practices

### 1. Branch Protection

Protect production branches:

**On GitHub:**
1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution

### 2. Environment Naming

Use consistent naming:

```bash
# Branches
main          # Production
develop       # Development
staging       # Staging (optional)
feature/*     # Feature branches

# Databases
potato-*              # Production
potato-*-dev          # Development
potato-*-staging      # Staging

# Cloudflare Projects
potato-charts         # Production
potato-charts-dev     # Development (if using Strategy 2)
```

### 3. Git Workflow

```bash
# Feature development
git checkout develop
git checkout -b feature/new-feature
# ... work ...
git push origin feature/new-feature
# Create PR to develop

# Development → Production
git checkout develop
# Test in preview environment
git checkout main
git merge develop --no-ff
git push origin main
```

### 4. Database Migrations

Always test migrations in development first:

```bash
# 1. Apply to development database
wrangler d1 execute potato-charts-dev --remote --file=migration.sql

# 2. Test in development environment
# ... verify everything works ...

# 3. Apply to production database
wrangler d1 execute potato-charts --remote --file=migration.sql
```

### 5. Environment-Specific Code

Use environment variables in your code:

```typescript
// lib/config.ts
export const config = {
  environment: process.env.ENVIRONMENT || 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.NEXT_PUBLIC_API_URL,

  // Feature flags
  features: {
    enableDebugMode: process.env.ENVIRONMENT !== 'production',
    enableAnalytics: process.env.ENVIRONMENT === 'production',
  }
};

// Usage
if (config.isDevelopment) {
  console.log('Debug info:', data);
}
```

### 6. Secrets Management

**Never share secrets** between environments:

```bash
# Generate separate secrets
openssl rand -base64 32  # Production NEXTAUTH_SECRET
openssl rand -base64 32  # Development NEXTAUTH_SECRET
openssl rand -base64 32  # Production OPENROUTER_API_KEY (if needed)
openssl rand -base64 32  # Development OPENROUTER_API_KEY (if needed)
```

### 7. Database Backups

Regular backups for each environment:

```bash
# Backup production
wrangler d1 export potato-users --remote --output=backups/users-prod-$(date +%Y%m%d).sql
wrangler d1 export potato-charts --remote --output=backups/charts-prod-$(date +%Y%m%d).sql

# Backup development (less frequent)
wrangler d1 export potato-users-dev --remote --output=backups/users-dev-$(date +%Y%m%d).sql
```

---

## Recommendation

For **your monorepo**, here's the recommended setup:

### Use Strategy 2 (Separate Projects) if:
- ✅ You need **true environment isolation**
- ✅ You want **separate D1 databases** per environment
- ✅ You don't mind managing **4 total projects** (2 apps × 2 environments)

### Use Strategy 1 (Branch-Based) if:
- ✅ You're okay **sharing databases** between environments
- ✅ You want **simpler configuration**
- ✅ Preview deployments are mainly for **UI/UX testing**

**My recommendation**: Start with **Strategy 1** (simpler), and upgrade to **Strategy 2** if you need true database isolation.

---

## Quick Setup Checklist

- [ ] Create `develop` branch
- [ ] Create development D1 databases (`*-dev`)
- [ ] Configure Cloudflare project with `main` as production branch
- [ ] Set production environment variables
- [ ] Set preview environment variables (with different values)
- [ ] Configure D1 bindings (production)
- [ ] *(Optional)* Create separate development project for D1 isolation
- [ ] Apply migrations to development databases
- [ ] Test deployment to `develop` branch
- [ ] Test deployment to `main` branch
- [ ] Set up branch protection on `main`
- [ ] Document environment URLs for team

---

## Additional Resources

- [Cloudflare Preview Deployments](https://developers.cloudflare.com/pages/platform/preview-deployments/)
- [Branch Build Controls](https://developers.cloudflare.com/pages/platform/branch-build-controls/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [D1 Database Bindings](https://developers.cloudflare.com/pages/platform/functions/bindings/#d1-databases)

---

## Summary

Cloudflare Pages supports multiple environments through:

1. **Branch-based deployments** (main = production, others = preview)
2. **Environment-specific variables** (production vs preview values)
3. **Separate D1 databases** (create `-dev` versions)
4. **Separate projects** (for complete isolation)

Choose the strategy that best fits your team's workflow and security requirements! 🚀
