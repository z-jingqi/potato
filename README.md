# 🥔 Potato Monorepo

A monorepo containing Diet and Charts applications with shared authentication and database packages.

## 📁 Project Structure

```
potato/
├── apps/
│   ├── diet/          # Diet AI app (food tracking, recipes, AI chat)
│   └── charts/        # Charts app (data tracking & visualization)
├── packages/
│   ├── database-users/    # Shared users database (Prisma)
│   ├── database-diet/     # Diet-specific database (Prisma)
│   ├── database-charts/   # Charts-specific database (Prisma)
│   ├── auth/              # Shared NextAuth configuration
│   ├── ui/                # Shared UI utilities
│   └── config/            # Shared configuration
└── package.json           # Root package (workspace manager)
```

## 🗄️ Database Architecture

Each app uses **multiple Prisma databases**:

- **`potato-users`**: Shared authentication (User, Account, Session)
- **`potato-diet`**: Diet app data (Conversation, Message, Recipe)
- **`potato-charts`**: Charts app data (Category, Chart, DataPoint)

**Benefits:**
- ✅ Shared user authentication across both apps
- ✅ Isolated app data (no interference)
- ✅ Each app independently deployable to Cloudflare

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install all dependencies (from root)
pnpm install

# Generate Prisma clients
pnpm db:generate

# Push database schemas
pnpm db:push
```

### Development

```bash
# Run diet app (http://localhost:3000)
pnpm dev:diet

# Run charts app (http://localhost:3001)
pnpm dev:charts
```

## 📜 Available Scripts

### Development
```bash
pnpm dev:diet            # Start diet app dev server
pnpm dev:charts          # Start charts app dev server
```

### Building
```bash
pnpm build:diet          # Build diet app
pnpm build:charts        # Build charts app
pnpm build:all           # Build all apps
```

### Linting
```bash
pnpm lint                # Lint all projects
pnpm lint:diet           # Lint diet app only
pnpm lint:charts         # Lint charts app only
```

### Database
```bash
pnpm db:generate         # Generate all Prisma clients
pnpm db:push             # Push all schemas to databases
pnpm db:studio:users     # Open Prisma Studio for users DB
pnpm db:studio:diet      # Open Prisma Studio for diet DB
pnpm db:studio:charts    # Open Prisma Studio for charts DB
```

### Cloudflare Preview (Local)
```bash
pnpm preview:diet        # Preview diet app with Cloudflare Pages
pnpm preview:charts      # Preview charts app with Cloudflare Pages
```

### Cloudflare Deployment
```bash
pnpm pages:build:diet    # Build diet for Cloudflare Pages
pnpm pages:build:charts  # Build charts for Cloudflare Pages
pnpm deploy:diet         # Deploy diet to Cloudflare Pages
pnpm deploy:charts       # Deploy charts to Cloudflare Pages
```

### Cleanup
```bash
pnpm clean               # Remove all node_modules and build artifacts
```

## 🔧 Environment Variables

### Diet App (`apps/diet/.env.local`)
```env
# Database URLs
DATABASE_URL_USERS="file:../../packages/database-users/prisma/users.db"
DATABASE_URL_DIET="file:../../packages/database-diet/prisma/diet.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OpenRouter AI
OPENROUTER_API_KEY="your-api-key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

### Charts App (`apps/charts/.env.local`)
```env
# Database URLs
DATABASE_URL_USERS="file:../../packages/database-users/prisma/users.db"
DATABASE_URL_CHARTS="file:../../packages/database-charts/prisma/charts.db"

# NextAuth (different port!)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-here"
```

## 📦 Shared Packages

### `@potato/auth`
Shared authentication logic using NextAuth.js

```typescript
import { authOptions, getSession, getCurrentUserId, requireAuth } from '@potato/auth'
```

### `@potato/database-users`
Shared users database (Prisma client)

```typescript
import { usersDb } from '@potato/database-users'

const user = await usersDb.user.findUnique({ where: { id } })
```

### `@potato/database-diet`
Diet app database (Prisma client)

```typescript
import { dietDb } from '@potato/database-diet'

const conversations = await dietDb.conversation.findMany()
```

### `@potato/database-charts`
Charts app database (Prisma client)

```typescript
import { chartsDb } from '@potato/database-charts'

const charts = await chartsDb.chart.findMany()
```

### `@potato/ui`
Shared UI utilities

```typescript
import { cn } from '@potato/ui'
```

## ☁️ Cloudflare Deployment

Both apps can be deployed to Cloudflare Pages with D1 databases using **two different methods**:

### Method 1: Git Integration (Recommended for Production)

**Automatic deployments** when you push to GitHub/GitLab.

**📚 See [DEPLOYMENT-GIT.md](./DEPLOYMENT-GIT.md)** for:
- Connecting your repository to Cloudflare Pages
- Automatic deployments on git push
- Preview deployments for Pull Requests
- Build configuration for monorepo
- Managing multiple apps from one repository

**Best for:**
- ✅ Production deployments
- ✅ Team collaboration
- ✅ PR previews
- ✅ Automated CI/CD

### Method 2: Manual (Wrangler CLI)

**Manual deployments** using the command line.

**📚 See [DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Database setup and migrations
- Environment variables configuration
- Step-by-step deployment guides
- Wrangler CLI commands
- Troubleshooting tips

**Best for:**
- ✅ Quick testing
- ✅ Local development
- ✅ One-off deployments

### Quick Start

```bash
# 1. Create D1 databases (required for both methods)
wrangler d1 create potato-users
wrangler d1 create potato-diet
wrangler d1 create potato-charts

# 2. Choose your deployment method:

# Option A: Git Integration (see DEPLOYMENT-GIT.md)
# - Connect repo in Cloudflare dashboard
# - Configure build settings
# - Push to deploy

# Option B: Manual Deployment (see DEPLOYMENT.md)
pnpm deploy:diet     # Deploy diet app
pnpm deploy:charts   # Deploy charts app
```

## 🏗️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: Prisma + SQLite (local) / Cloudflare D1 (production)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (shadcn/ui)
- **AI**: OpenRouter (diet app)
- **Charts**: Recharts (charts app)
- **Monorepo**: pnpm workspaces
- **Deployment**: Cloudflare Pages

## 📝 Development Notes

### Adding Dependencies

```bash
# Add to diet app
pnpm --filter diet add package-name

# Add to charts app
pnpm --filter charts add package-name

# Add to shared package
pnpm --filter @potato/auth add package-name
```

### Database Changes

```bash
# Update schema in packages/database-*/prisma/schema.prisma
# Then run:
pnpm db:generate  # Regenerate Prisma clients
pnpm db:push      # Push changes to database
```

### Independent Deployment

Each app can be deployed independently:
- Diet app: Food tracking, recipes, AI chat
- Charts app: Data tracking & visualization
- Both apps share the same user accounts via `potato-users` database

## 🤝 Contributing

1. Make changes in respective app or package folders
2. Test locally with `pnpm dev:diet` or `pnpm dev:charts`
3. Ensure types are correct: `pnpm lint`
4. Commit changes (all apps in single repo)

## 📄 License

Private project
