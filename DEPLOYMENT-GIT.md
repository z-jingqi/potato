# Cloudflare Pages - Git Integration Deployment

This guide covers deploying Diet AI and Charts apps using **Cloudflare Pages Git integration** for automatic deployments when PRs are merged.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deploying Charts App](#deploying-charts-app)
- [Deploying Diet App](#deploying-diet-app)
- [Managing Multiple Apps](#managing-multiple-apps)
- [Branch Deployments](#branch-deployments)
- [Preview Deployments](#preview-deployments)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Git Integration vs Manual Deployment

| Feature | Git Integration | Manual (Wrangler) |
|---------|----------------|-------------------|
| **Trigger** | Automatic on git push | Manual command |
| **Setup** | One-time via dashboard | Configure wrangler.toml |
| **CI/CD** | Built-in | Custom |
| **Preview Deploys** | Automatic for PRs | Not available |
| **Rollback** | Easy via dashboard | Redeploy previous build |
| **Best For** | Production workflow | Testing, quick deploys |

### Monorepo Considerations

Since both apps live in the same repository, you'll need to:
1. Create **two separate Cloudflare Pages projects** (one for each app)
2. Configure **build paths** to target specific app directories
3. Set different **environment variables** for each project

---

## Prerequisites

### 1. GitHub/GitLab Account
Your code must be in a Git repository on:
- GitHub (recommended)
- GitLab

### 2. Cloudflare Account
- Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)
- No payment required for Pages free tier

### 3. D1 Databases Created
You still need to manually create D1 databases:

```bash
wrangler d1 create potato-users
wrangler d1 create potato-charts
wrangler d1 create potato-diet
```

Save the database IDs for later configuration.

### 4. Commit Your Code
Ensure all changes are committed and pushed to your repository:

```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push origin main
```

---

## Initial Setup

### Step 1: Update wrangler.toml Files

Make sure your `wrangler.toml` files have the correct database IDs:

**apps/charts/wrangler.toml:**
```toml
name = "potato-charts"
compatibility_date = "2025-01-01"
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "your-users-db-id"

[[d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts"
database_id = "your-charts-db-id"
```

**apps/diet/wrangler.toml:**
```toml
name = "potato-diet"
compatibility_date = "2025-01-01"
pages_build_output_dir = ".vercel/output/static"

[vars]
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_DEFAULT_MODEL = "openai/gpt-oss-20b:free"
OPENROUTER_RECIPE_MODEL = "minimax/minimax-m2:free"

[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = "your-users-db-id"

[[d1_databases]]
binding = "DB_DIET"
database_name = "potato-diet"
database_id = "your-diet-db-id"
```

### Step 2: Commit Configuration

```bash
git add apps/*/wrangler.toml
git commit -m "Configure Cloudflare databases"
git push origin main
```

---

## Deploying Charts App

### Step 1: Create Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create application**
3. Select **Pages** tab → **Connect to Git**
4. Authorize Cloudflare to access your repository
5. Select your **potato** repository

### Step 2: Configure Build Settings

Fill in the project configuration:

| Setting | Value |
|---------|-------|
| **Project name** | `potato-charts` |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `cd apps/charts && npx @cloudflare/next-on-pages@latest` |
| **Build output directory** | `apps/charts/.vercel/output/static` |
| **Root directory** | `/` (leave blank or set to root) |

**Important**: The build command must:
- `cd` into the charts app directory
- Run the Cloudflare Pages adapter

### Step 3: Configure Environment Variables

Before deploying, click **Add environment variable** and add:

| Variable | Value | Type |
|----------|-------|------|
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Secret |
| `NEXTAUTH_URL` | `https://potato-charts.pages.dev` | Public |
| `NODE_VERSION` | `20` | Public |

**Note**: The `NEXTAUTH_URL` will be your actual deployment URL. You can update it later.

### Step 4: Add D1 Bindings

1. After creating the project (or in Settings → Functions)
2. Scroll to **D1 database bindings**
3. Click **Add binding**
4. Add two bindings:

   | Variable name | D1 Database |
   |---------------|-------------|
   | `DB_USERS` | potato-users |
   | `DB_CHARTS` | potato-charts |

### Step 5: Deploy

Click **Save and Deploy**

Cloudflare will:
1. Clone your repository
2. Install dependencies
3. Build the app
4. Deploy to Pages
5. Provide a deployment URL

### Step 6: Apply Database Migrations

After first deployment, apply migrations:

```bash
# Generate migration SQL
cd packages/database-users
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration-users.sql

cd ../database-charts
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration-charts.sql

# Apply to D1
wrangler d1 execute potato-users --remote --file=packages/database-users/migration-users.sql
wrangler d1 execute potato-charts --remote --file=packages/database-charts/migration-charts.sql
```

### Step 7: Update NEXTAUTH_URL

1. Get your deployment URL from the dashboard (e.g., `https://potato-charts.pages.dev`)
2. Go to **Settings** → **Environment variables**
3. Update `NEXTAUTH_URL` to match your deployment URL
4. Click **Save** and **Redeploy**

---

## Deploying Diet App

### Step 1: Create Pages Project

1. Go to **Workers & Pages** → **Create application**
2. Select **Pages** → **Connect to Git**
3. Select your **potato** repository again

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `potato-diet` |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `cd apps/diet && npx @cloudflare/next-on-pages@latest` |
| **Build output directory** | `apps/diet/.vercel/output/static` |
| **Root directory** | `/` (leave blank or set to root) |

### Step 3: Configure Environment Variables

Add the following environment variables:

| Variable | Value | Type |
|----------|-------|------|
| `NEXTAUTH_SECRET` | Same or different from charts | Secret |
| `NEXTAUTH_URL` | `https://potato-diet.pages.dev` | Public |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Secret |
| `NODE_VERSION` | `20` | Public |

**Optional** (already in wrangler.toml but can override):
- `OPENROUTER_BASE_URL`
- `OPENROUTER_DEFAULT_MODEL`
- `OPENROUTER_RECIPE_MODEL`

### Step 4: Add D1 Bindings

Add D1 database bindings:

| Variable name | D1 Database |
|---------------|-------------|
| `DB_USERS` | potato-users |
| `DB_DIET` | potato-diet |

### Step 5: Deploy

Click **Save and Deploy**

### Step 6: Apply Database Migrations

```bash
# Generate migration SQL
cd packages/database-diet
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration-diet.sql

# Apply to D1 (users DB already migrated from charts setup)
wrangler d1 execute potato-diet --remote --file=packages/database-diet/migration-diet.sql
```

### Step 7: Update NEXTAUTH_URL

Update `NEXTAUTH_URL` with your actual deployment URL and redeploy.

---

## Managing Multiple Apps

### Understanding the Setup

Your repository structure:
```
potato/ (one repo)
├── apps/
│   ├── charts/  → Cloudflare Project: potato-charts
│   └── diet/    → Cloudflare Project: potato-diet
```

Each Cloudflare Pages project:
- Watches the **same repository**
- Has **different build commands** and output directories
- Has **independent deployments**
- Can have **different environment variables**

### Deployment Behavior

When you push to `main`:
1. **Both projects** will trigger a build
2. Each builds only its respective app
3. Deployments are independent (one can succeed while the other fails)

### Preventing Unnecessary Builds

To prevent both apps from building on every commit, use **build filters**:

#### Option 1: Cloudflare Ignore Builds

Create `apps/charts/.cpignore`:
```
apps/diet/**
packages/database-diet/**
```

Create `apps/diet/.cpignore`:
```
apps/charts/**
packages/database-charts/**
```

**Note**: `.cpignore` is not officially supported. Better to use build scripts.

#### Option 2: Custom Build Script

Update build commands to check for changes:

**Charts build command:**
```bash
cd apps/charts && if git diff --quiet HEAD~1 apps/charts packages/; then echo "No changes"; exit 0; fi && npx @cloudflare/next-on-pages@latest
```

#### Option 3: Separate Branches (Recommended for larger teams)

- `main-charts` branch → Charts deployments
- `main-diet` branch → Diet deployments
- Use branch protection and merge workflows

---

## Branch Deployments

### Production Branch

The **Production branch** (usually `main`) deploys to:
- `https://potato-charts.pages.dev`
- `https://potato-diet.pages.dev`

### Preview Branches

Other branches create **preview deployments**:
- Branch: `feature/new-chart-type`
- Preview URL: `https://abc123.potato-charts.pages.dev`

### Configuring Preview Branches

1. Go to **Settings** → **Builds & deployments**
2. Configure **Preview deployments**:
   - **All branches**: Deploy every branch (can be expensive)
   - **None**: No preview deployments
   - **Custom branches**: Specify patterns (e.g., `develop`, `staging/*`)

### Branch-Specific Environment Variables

Set different variables for production vs preview:

1. Go to **Settings** → **Environment variables**
2. Each variable can have values for:
   - **Production**: Used for `main` branch
   - **Preview**: Used for all preview branches

Example:
- Production `NEXTAUTH_URL`: `https://potato-charts.pages.dev`
- Preview `NEXTAUTH_URL`: `https://preview.potato-charts.pages.dev`

---

## Preview Deployments

### How PR Previews Work

When you create a Pull Request:

1. Cloudflare automatically creates a **preview deployment**
2. A unique URL is generated (e.g., `https://abc123.potato-charts.pages.dev`)
3. Cloudflare bot comments on the PR with the preview link
4. Every commit to the PR updates the preview
5. Preview is deleted when PR is closed/merged

### Testing Preview Deployments

```bash
# Create a feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR on GitHub
# Cloudflare will automatically deploy a preview
```

### Preview Deployment Limitations

- Shares the **same D1 databases** as production (be careful!)
- Can set different environment variables
- Perfect for UI/UX review
- **Not recommended** for testing database changes

### Using Preview Databases (Advanced)

To use separate databases for previews:

1. Create preview databases:
   ```bash
   wrangler d1 create potato-users-preview
   wrangler d1 create potato-charts-preview
   ```

2. Set preview-specific bindings in **Settings** → **Functions** → **Preview**

3. Add preview migrations as needed

---

## Automatic Deployment Workflow

### Typical Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/improve-charts
git push origin feature/improve-charts

# 2. Cloudflare creates preview deployment
# Preview URL: https://abc123.potato-charts.pages.dev

# 3. Test preview and create PR on GitHub
# Review changes in the preview

# 4. Merge PR to main
git checkout main
git merge feature/improve-charts
git push origin main

# 5. Cloudflare automatically deploys to production
# Production URL: https://potato-charts.pages.dev
```

### Deployment Notifications

Enable notifications for deployments:

1. Go to **Settings** → **Notifications**
2. Configure webhooks for:
   - **Deployment success**
   - **Deployment failure**
   - **Preview deployments ready**

Integrations available:
- **Slack**: Post deployment status
- **Email**: Send notifications
- **Webhooks**: Custom integrations
- **GitHub Checks**: Status on PRs

---

## Build Configuration

### Monorepo Build Setup

#### Root package.json Scripts

Ensure these scripts exist (already configured):

```json
{
  "scripts": {
    "build:charts": "pnpm --filter charts build",
    "build:diet": "pnpm --filter diet build",
    "pages:build:charts": "pnpm --filter charts pages:build",
    "pages:build:diet": "pnpm --filter diet pages:build"
  }
}
```

#### Custom Build Configuration (Advanced)

If needed, create `.pages.yaml` in app directories:

**apps/charts/.pages.yaml:**
```yaml
build:
  command: cd ../.. && pnpm install && cd apps/charts && pnpm pages:build
  output_directory: .vercel/output/static

env:
  NODE_VERSION: 20
```

### Build Performance Tips

1. **Enable build caching**: Cloudflare caches `node_modules` by default
2. **Use pnpm**: Faster than npm/yarn (already configured)
3. **Minimize dependencies**: Keep production dependencies lean
4. **Use turbo cache**: Already configured in monorepo

---

## Rollback Procedures

### Rolling Back a Deployment

If a deployment breaks production:

1. Go to **Deployments** tab
2. Find the last working deployment
3. Click **⋯** (three dots) → **Rollback to this deployment**
4. Confirm rollback

The rollback is **instant** - no rebuild required.

### Rolling Back Database Changes

D1 databases are **not automatically rolled back**. To rollback:

```bash
# Export current database
wrangler d1 export potato-charts --remote --output=broken.sql

# Restore from backup
wrangler d1 execute potato-charts --remote --file=backup.sql
```

**Best Practice**: Always backup databases before migrations.

---

## Custom Domains

### Adding a Custom Domain

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `charts.yourdomain.com`)
4. Add DNS records as instructed:
   - **CNAME**: `charts.yourdomain.com` → `potato-charts.pages.dev`
5. Wait for DNS propagation (5-60 minutes)

### SSL Certificates

Cloudflare automatically provisions **free SSL certificates** for custom domains.

### Multiple Domains

You can add multiple domains per project:
- `charts.yourdomain.com` (primary)
- `www.charts.yourdomain.com`
- `tracking.yourdomain.com`

### Update Environment Variables

After adding a custom domain, update:
- `NEXTAUTH_URL` → Your custom domain
- Redeploy the project

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with "command not found"

**Solution**:
- Verify build command is correct
- Ensure `cd apps/[app-name]` is included
- Check `NODE_VERSION` is set to `20`

---

**Issue**: Build fails with "workspace not found"

**Solution**:
- Build command must run from **repository root**
- Use: `cd apps/charts && npx @cloudflare/next-on-pages@latest`
- Not: `npx @cloudflare/next-on-pages@latest` (from charts directory)

---

**Issue**: Build succeeds but deployment fails

**Solution**:
- Check **Functions** logs in Cloudflare dashboard
- Verify D1 bindings are correctly configured
- Ensure database IDs in `wrangler.toml` are correct

---

### Database Connection Issues

**Issue**: "D1_ERROR: Database not found"

**Solution**:
1. Verify D1 bindings in **Settings** → **Functions**
2. Ensure binding names match code (`DB_USERS`, `DB_CHARTS`, `DB_DIET`)
3. Check database IDs in `wrangler.toml` match created databases

---

### Environment Variables

**Issue**: Environment variable changes not taking effect

**Solution**:
- After changing environment variables, you must **redeploy**
- Go to **Deployments** → **Retry deployment**
- Or push a new commit

---

**Issue**: Secrets visible in build logs

**Solution**:
- Use **encrypted variables** (toggle encryption when adding)
- Don't use `console.log()` for secrets
- Secrets are automatically encrypted in Cloudflare

---

### Preview Deployments Not Working

**Issue**: PRs don't trigger preview deployments

**Solution**:
1. Check **Settings** → **Builds & deployments**
2. Ensure **Preview deployments** is enabled
3. Verify GitHub app has correct permissions
4. Check branch patterns if using custom branches

---

### Monorepo-Specific Issues

**Issue**: Both apps deploy on every commit

**Solution**:
- Use separate production branches
- Or configure build filters (see [Managing Multiple Apps](#managing-multiple-apps))
- Consider using path-based triggers (requires custom CI)

---

**Issue**: Builds timeout (>20 minutes)

**Solution**:
- Split build into smaller steps
- Use build caching
- Contact Cloudflare support for limits increase

---

## Comparison: Git vs Wrangler Deployment

### When to Use Git Integration

✅ **Use Git Integration when:**
- You want automatic deployments on every push
- You need preview deployments for PRs
- Multiple team members are deploying
- You want built-in CI/CD
- You prefer GUI-based configuration

### When to Use Wrangler CLI

✅ **Use Wrangler CLI when:**
- You need quick one-off deployments
- Testing configuration changes locally
- Deploying from CI/CD pipelines
- You prefer command-line workflows
- Git integration is unavailable

### Hybrid Approach (Recommended)

Use both:
- **Git integration** for production deploys (main branch)
- **Wrangler CLI** for testing and development

---

## GitHub Actions Integration (Advanced)

For more control over builds, use GitHub Actions with Wrangler:

**.github/workflows/deploy-charts.yml:**
```yaml
name: Deploy Charts

on:
  push:
    branches: [main]
    paths:
      - 'apps/charts/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm build:charts

      - run: pnpm pages:build:charts

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: potato-charts
          directory: apps/charts/.vercel/output/static
```

---

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Git Integration Guide](https://developers.cloudflare.com/pages/platform/git-integration/)
- [Preview Deployments](https://developers.cloudflare.com/pages/platform/preview-deployments/)
- [Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)
- [D1 Database Bindings](https://developers.cloudflare.com/pages/platform/functions/bindings/#d1-databases)

---

## Quick Reference

### Git Workflow Commands

```bash
# Create feature branch
git checkout -b feature/name
git push origin feature/name

# Merge to main (triggers production deploy)
git checkout main
git merge feature/name
git push origin main

# View deployment status
# Go to Cloudflare dashboard → Workers & Pages → Your project → Deployments
```

### Cloudflare Dashboard Quick Links

- **Deployments**: View deployment history and logs
- **Settings** → **Environment variables**: Manage secrets
- **Settings** → **Functions**: Configure D1 bindings
- **Settings** → **Builds & deployments**: Configure build settings
- **Custom domains**: Add custom domains

---

## Next Steps

After setting up Git integration:

1. ✅ Test a deployment by pushing to main
2. ✅ Create a test PR to verify preview deployments
3. ✅ Configure custom domains (optional)
4. ✅ Set up deployment notifications (optional)
5. ✅ Document your workflow for team members

Happy deploying! 🚀
