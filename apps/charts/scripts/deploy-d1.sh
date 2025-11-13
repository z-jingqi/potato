#!/bin/bash

# Deploy D1 Migrations Script
# This script helps you deploy Prisma migrations to Cloudflare D1

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cloudflare D1 Migration Deployment ===${NC}\n"

# Check if environment is specified
ENV=${1:-dev}

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo -e "${RED}Error: Environment must be 'dev' or 'prod'${NC}"
    echo "Usage: ./scripts/deploy-d1.sh [dev|prod]"
    exit 1
fi

echo -e "${YELLOW}Environment: $ENV${NC}\n"

# Get the project root directory (3 levels up from script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Step 1: Generate Prisma clients
echo -e "${BLUE}Step 1: Generating Prisma clients...${NC}"
cd "$PROJECT_ROOT/packages/database-users"
pnpm db:generate
cd "$PROJECT_ROOT/packages/database-charts"
pnpm db:generate

echo -e "${GREEN}✓ Prisma clients generated${NC}\n"

# Step 2: Check for migrations
echo -e "${BLUE}Step 2: Checking for migrations...${NC}"

USERS_MIGRATIONS=$(ls -1 "$PROJECT_ROOT/packages/database-users/prisma/migrations" 2>/dev/null | wc -l || echo "0")
CHARTS_MIGRATIONS=$(ls -1 "$PROJECT_ROOT/packages/database-charts/prisma/migrations" 2>/dev/null | wc -l || echo "0")

echo "Users migrations found: $USERS_MIGRATIONS"
echo "Charts migrations found: $CHARTS_MIGRATIONS"

if [[ "$USERS_MIGRATIONS" -eq 0 && "$CHARTS_MIGRATIONS" -eq 0 ]]; then
    echo -e "${YELLOW}No migrations found. Create migrations first with:${NC}"
    echo "  cd packages/database-users && pnpm db:migrate"
    echo "  cd packages/database-charts && pnpm db:migrate"
    exit 1
fi

echo -e "${GREEN}✓ Migrations found${NC}\n"

# Step 3: Deploy to D1
echo -e "${BLUE}Step 3: Deploying migrations to D1...${NC}"

if [[ "$USERS_MIGRATIONS" -gt 0 ]]; then
    echo -e "${YELLOW}Deploying users database migrations...${NC}"
    cd "$PROJECT_ROOT/packages/database-users"
    if [[ "$ENV" == "dev" ]]; then
        pnpm d1:push:all:dev
    else
        pnpm d1:push:all:prod
    fi
    echo -e "${GREEN}✓ Users database deployed${NC}"
fi

if [[ "$CHARTS_MIGRATIONS" -gt 0 ]]; then
    echo -e "${YELLOW}Deploying charts database migrations...${NC}"
    cd "$PROJECT_ROOT/packages/database-charts"
    if [[ "$ENV" == "dev" ]]; then
        pnpm d1:push:all:dev
    else
        pnpm d1:push:all:prod
    fi
    echo -e "${GREEN}✓ Charts database deployed${NC}"
fi

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "${BLUE}Your databases have been deployed to Cloudflare D1 ($ENV)${NC}"
