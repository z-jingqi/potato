# NEXTAUTH_SECRET 配置方式说明

## 简短回答

**不需要**将 `NEXTAUTH_SECRET` 配置到 `wrangler.toml` 中。

## 推荐配置方式

### ✅ 推荐：使用 Cloudflare Dashboard（Git 集成部署）

对于使用 **Cloudflare Pages Git 集成**的部署方式（PR 合并自动部署），应该在 **Cloudflare Dashboard** 中配置环境变量：

1. 登录 Cloudflare Dashboard
2. 进入项目 → **Settings** → **Environment variables**
3. 分别配置 **Production** 和 **Preview** 环境的 `NEXTAUTH_SECRET`

**优点**：
- ✅ 加密存储，更安全
- ✅ 不会提交到 Git
- ✅ 支持不同环境（Production/Preview）
- ✅ 易于管理和更新

---

### ⚠️ 可选：wrangler.toml（仅用于本地开发或 CLI 部署）

如果你使用 **Wrangler CLI** 手动部署（`wrangler pages deploy`），可以在 `wrangler.toml` 中配置，但**不推荐直接写密钥**。

#### 方式 1: 使用环境变量引用（推荐）

```toml
# apps/charts/wrangler.toml
[vars]
# 不要直接写密钥，使用环境变量
NEXTAUTH_SECRET = "${NEXTAUTH_SECRET}"  # 从系统环境变量读取
```

然后在部署前设置环境变量：
```bash
export NEXTAUTH_SECRET="your-secret-here"
wrangler pages deploy .next
```

#### 方式 2: 使用 .dev.vars 文件（本地开发）

创建 `apps/charts/.dev.vars`（已在 .gitignore 中）：
```env
NEXTAUTH_SECRET=your-local-secret
```

#### 方式 3: 直接写在 wrangler.toml（不推荐）

```toml
[vars]
NEXTAUTH_SECRET = "your-secret-here"  # ⚠️ 不推荐：会提交到 Git
```

**为什么不推荐**：
- ❌ 密钥会提交到 Git 仓库
- ❌ 安全性差
- ❌ 无法为不同环境使用不同密钥

---

## 三种环境的配置方式

### 1. Local（本地开发）

**使用 `.env.local` 文件**（推荐）：

```env
# apps/charts/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
```

**或使用 `.dev.vars`**（如果使用 wrangler dev）：
```env
# apps/charts/.dev.vars
NEXTAUTH_SECRET=your-local-secret
```

---

### 2. Dev（开发环境 - Cloudflare Pages）

**在 Cloudflare Dashboard 中配置**：

1. 项目 → **Settings** → **Environment variables**
2. 选择 **Preview** 环境
3. 添加 `NEXTAUTH_SECRET`

**不需要**在 `wrangler.toml` 中配置。

---

### 3. Production（生产环境 - Cloudflare Pages）

**在 Cloudflare Dashboard 中配置**：

1. 项目 → **Settings** → **Environment variables**
2. 选择 **Production** 环境
3. 添加 `NEXTAUTH_SECRET`

**不需要**在 `wrangler.toml` 中配置。

---

## 当前项目配置建议

### Charts App (apps/charts/wrangler.toml)

**保持当前配置**（不需要添加 NEXTAUTH_SECRET）：

```toml
# Cloudflare configuration for Charts App
name = "potato-charts"
compatibility_date = "2025-01-01"
pages_build_output_dir = ".next"

# D1 Database bindings
[[d1_databases]]
binding = "DB_USERS"
database_name = "potato-users"
database_id = ""

[[d1_databases]]
binding = "DB_CHARTS"
database_name = "potato-charts"
database_id = ""

# ✅ NEXTAUTH_SECRET 不需要在这里配置
# 应该在 Cloudflare Dashboard 中配置
```

### Diet App (apps/diet/wrangler.toml)

**保持当前配置**（已经有 [vars] 但只用于非敏感变量）：

```toml
# Environment variables (非敏感变量)
[vars]
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_DEFAULT_MODEL = "openai/gpt-oss-20b:free"
OPENROUTER_RECIPE_MODEL = "minimax/minimax-m2:free"

# ✅ NEXTAUTH_SECRET 和 OPENROUTER_API_KEY 不应该在这里配置
# 应该在 Cloudflare Dashboard 中配置（加密存储）
```

---

## 总结对比

| 配置方式 | Local | Dev | Production | 安全性 |
|---------|-------|-----|------------|--------|
| **.env.local** | ✅ 推荐 | ❌ | ❌ | ✅ 高（不提交 Git） |
| **Cloudflare Dashboard** | ❌ | ✅ 推荐 | ✅ 推荐 | ✅✅ 最高（加密） |
| **wrangler.toml [vars]** | ⚠️ 可用 | ❌ 不推荐 | ❌ 不推荐 | ❌ 低（会提交 Git） |
| **.dev.vars** | ✅ 可用 | ❌ | ❌ | ✅ 高（不提交 Git） |

---

## 最佳实践总结

1. **Local 开发**：
   - ✅ 使用 `.env.local` 文件
   - ✅ 文件已在 `.gitignore` 中，不会提交

2. **Dev/Production（Cloudflare Pages）**：
   - ✅ 在 Cloudflare Dashboard 中配置
   - ✅ 使用加密的环境变量
   - ✅ 分别配置 Production 和 Preview 环境

3. **wrangler.toml**：
   - ✅ 只用于非敏感配置（如 OPENROUTER_BASE_URL）
   - ❌ 不要放敏感信息（NEXTAUTH_SECRET, API keys）

---

## 快速检查清单

- [ ] Local: `.env.local` 文件已创建并配置
- [ ] Dev: Cloudflare Dashboard Preview 环境变量已配置
- [ ] Production: Cloudflare Dashboard Production 环境变量已配置
- [ ] `wrangler.toml` 中没有敏感信息（NEXTAUTH_SECRET, API keys）
- [ ] `.env.local` 和 `.dev.vars` 在 `.gitignore` 中

