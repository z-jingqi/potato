# Potato - Full-stack Next.js Monorepo

A modern full-stack monorepo with Next.js, shadcn/ui, Prisma, and Cloudflare support.

## Project Structure

```
potato/
├── apps/
│   └── charts/          # Next.js application with AI chat, auth, and dashboard
├── packages/
│   ├── ui/              # Shared shadcn/ui components
│   ├── ai/              # AI integration (OpenRouter)
│   ├── auth/            # Authentication utilities
│   ├── database-users/  # Prisma schema for users
│   └── database-charts/ # Prisma schema for charts
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.4.1+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Development

```bash
# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run linters
pnpm lint

# Format code
pnpm format
```

## Cloudflare Deployment

This project supports deployment to Cloudflare Pages using OpenNext Cloudflare.

### Quick Start

```bash
# Navigate to the charts app
cd apps/charts

# Build for Cloudflare
pnpm build:cf

# Deploy to Cloudflare
pnpm deploy:cf
```

For detailed Cloudflare deployment instructions, see [apps/charts/CLOUDFLARE.md](apps/charts/CLOUDFLARE.md).

## Adding UI Components

To add shadcn/ui components to your app:

```bash
pnpm dlx shadcn@latest add button -c apps/charts
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using Components

Import components from the `ui` package:

```tsx
import { Button } from "@potato/ui/components/button"
import { Card } from "@potato/ui/components/card"
```

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Environment Variables

Copy `.dev.vars.example` to `.dev.vars` in `apps/charts/` and fill in your values:

```bash
cd apps/charts
cp .dev.vars.example .dev.vars
```

## License

MIT
