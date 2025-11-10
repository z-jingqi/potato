# NEXTAUTH_SECRET 说明与多环境配置

## NEXTAUTH_SECRET 是什么？

`NEXTAUTH_SECRET` 是 **NextAuth.js** 用来加密和签名 JWT token 和 session 的密钥。

### 作用

1. **加密 JWT Token**：用于签名用户登录后生成的 JWT token
2. **保护 Session**：确保 session 数据不被篡改
3. **安全性**：如果泄露，攻击者可能伪造 session

### 要求

- ✅ **长度**：至少 32 个字符（推荐使用 `openssl rand -base64 32` 生成）
- ✅ **随机性**：必须是随机生成的，不能是简单的字符串
- ✅ **保密性**：每个环境应该使用不同的密钥
- ✅ **不要提交到 Git**：应该存储在环境变量中

### 生成方式

```bash
# 生成一个安全的密钥（32 字节，base64 编码）
openssl rand -base64 32

# 示例输出：
# 8fK3mP9qR2sT5vW7xY0zA1bC4dE6fG8hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA=
```

---

## 三个环境配置

### 环境概览

| 环境 | 部署位置 | URL 示例 | NEXTAUTH_SECRET |
|------|---------|----------|----------------|
| **Local** | 本地开发 | `http://localhost:3000` | 本地 `.env.local` |
| **Dev** | Cloudflare Pages | `https://potato-charts-dev.pages.dev` | Cloudflare Pages (Preview) |
| **Production** | Cloudflare Pages | `https://potato-charts.pages.dev` | Cloudflare Pages (Production) |

---

## 1. Local 环境配置

### 创建本地环境变量文件

**apps/charts/.env.local:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret-key-change-this
```

**apps/diet/.env.local:**
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-local-secret-key-change-this
```

### 生成本地密钥

```bash
# 生成本地开发密钥
openssl rand -base64 32

# 将结果复制到 .env.local 文件
```

### 注意事项

- ✅ `.env.local` 文件已经在 `.gitignore` 中，不会被提交
- ✅ 本地开发可以使用简单的密钥（但建议也使用随机生成的）
- ✅ 每次克隆项目后需要重新创建 `.env.local`

---

## 2. Dev 环境配置（Cloudflare Pages）

Dev 环境使用 Cloudflare Pages 的 **Preview 部署**（非 main 分支的部署）。

### 方法 1: 使用 Preview 环境变量（推荐）

在 Cloudflare Pages Dashboard 中：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加环境变量，选择 **Preview** 环境：

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | `[生成的 dev 密钥]` | **Preview** |
| `NEXTAUTH_URL` | `https://[preview-url].potato-charts.pages.dev` | **Preview** |

### 方法 2: 使用单独的 Dev 项目

创建一个专门用于开发的 Cloudflare Pages 项目：

1. **项目名称**: `potato-charts-dev`
2. **Production branch**: `develop`（或 `dev`）
3. **环境变量**（Production 环境，因为 `develop` 是生产分支）：

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | `[生成的 dev 密钥]` | **Production** |
| `NEXTAUTH_URL` | `https://potato-charts-dev.pages.dev` | **Production** |

### 生成 Dev 密钥

```bash
# 生成开发环境密钥
openssl rand -base64 32

# 保存好这个密钥，稍后在 Cloudflare Dashboard 中配置
```

---

## 3. Production 环境配置（Cloudflare Pages）

Production 环境使用 Cloudflare Pages 的 **Production 部署**（main 分支）。

### 在 Cloudflare Pages Dashboard 中配置

1. 进入项目 → **Settings** → **Environment variables**
2. 添加环境变量，选择 **Production** 环境：

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | `[生成的 production 密钥]` | **Production** |
| `NEXTAUTH_URL` | `https://potato-charts.pages.dev` | **Production** |

### 生成 Production 密钥

```bash
# 生成生产环境密钥（必须安全保存！）
openssl rand -base64 32

# ⚠️ 重要：保存好这个密钥，丢失后用户需要重新登录
```

---

## 完整配置步骤

### 步骤 1: 生成所有环境的密钥

```bash
# 生成三个不同的密钥
echo "Local NEXTAUTH_SECRET:"
openssl rand -base64 32

echo "Dev NEXTAUTH_SECRET:"
openssl rand -base64 32

echo "Production NEXTAUTH_SECRET:"
openssl rand -base64 32
```

**重要**：保存好这些密钥，特别是 Production 的密钥！

### 步骤 2: 配置本地环境

**apps/charts/.env.local:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[local-secret-from-step-1]
```

**apps/diet/.env.local:**
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=[local-secret-from-step-1]
```

### 步骤 3: 配置 Dev 环境（Cloudflare Pages）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → `potato-charts-dev`（或使用 Preview 环境）
3. **Settings** → **Environment variables**
4. 添加：
   - `NEXTAUTH_SECRET` = `[dev-secret-from-step-1]` (Preview 环境)
   - `NEXTAUTH_URL` = `https://potato-charts-dev.pages.dev` (Preview 环境)

### 步骤 4: 配置 Production 环境（Cloudflare Pages）

1. 进入 **Workers & Pages** → `potato-charts`
2. **Settings** → **Environment variables**
3. 添加：
   - `NEXTAUTH_SECRET` = `[production-secret-from-step-1]` (Production 环境)
   - `NEXTAUTH_URL` = `https://potato-charts.pages.dev` (Production 环境)

---

## 环境变量优先级

在 Cloudflare Pages 中，环境变量的优先级：

1. **Production** 环境变量：用于 `main` 分支的部署
2. **Preview** 环境变量：用于其他分支的部署

### 示例配置

```
Production (main 分支):
├── NEXTAUTH_SECRET = prod-secret-123
└── NEXTAUTH_URL = https://potato-charts.pages.dev

Preview (其他分支):
├── NEXTAUTH_SECRET = dev-secret-456
└── NEXTAUTH_URL = https://abc123.potato-charts.pages.dev
```

---

## 验证配置

### 本地验证

```bash
# 启动开发服务器
cd apps/charts
pnpm dev

# 检查环境变量是否加载
# 访问 http://localhost:3000/api/auth/signin
# 应该能看到登录页面
```

### Dev 环境验证

1. 推送到 `develop` 分支（或创建 PR）
2. Cloudflare 会自动创建 Preview 部署
3. 访问 Preview URL，测试登录功能

### Production 环境验证

1. 合并 PR 到 `main` 分支
2. Cloudflare 会自动部署到 Production
3. 访问 Production URL，测试登录功能

---

## 安全最佳实践

### ✅ 应该做的

- ✅ 每个环境使用不同的 `NEXTAUTH_SECRET`
- ✅ 使用 `openssl rand -base64 32` 生成随机密钥
- ✅ 将密钥存储在环境变量中，不要硬编码
- ✅ 定期轮换 Production 密钥（需要用户重新登录）
- ✅ 使用 Cloudflare 的加密环境变量功能

### ❌ 不应该做的

- ❌ 不要在代码中硬编码密钥
- ❌ 不要将密钥提交到 Git
- ❌ 不要在多个环境共享同一个密钥
- ❌ 不要使用简单的字符串作为密钥（如 "secret123"）

---

## 密钥轮换（如果需要）

如果 Production 密钥泄露，需要轮换：

1. **生成新密钥**：
   ```bash
   openssl rand -base64 32
   ```

2. **更新 Cloudflare Pages 环境变量**：
   - 进入项目 → Settings → Environment variables
   - 更新 `NEXTAUTH_SECRET`

3. **重新部署**：
   - 推送到 main 分支触发重新部署
   - 或手动触发重新部署

4. **影响**：
   - ⚠️ 所有用户需要重新登录
   - ⚠️ 现有的 session 会失效

---

## 故障排查

### 问题：登录后立即退出

**原因**：`NEXTAUTH_SECRET` 不匹配或未设置

**解决**：
1. 检查环境变量是否正确设置
2. 确保 Production 和 Preview 使用不同的密钥
3. 重新部署应用

### 问题：本地开发无法登录

**原因**：`.env.local` 文件不存在或配置错误

**解决**：
1. 检查 `apps/charts/.env.local` 是否存在
2. 确认 `NEXTAUTH_SECRET` 已设置
3. 重启开发服务器

### 问题：Dev 和 Production 环境 session 冲突

**原因**：两个环境使用了相同的 `NEXTAUTH_SECRET`

**解决**：
- 确保 Dev（Preview）和 Production 使用不同的密钥

---

## 快速参考

### 生成密钥命令

```bash
# 一次性生成三个环境的密钥
echo "=== Local ===" && openssl rand -base64 32 && \
echo "=== Dev ===" && openssl rand -base64 32 && \
echo "=== Production ===" && openssl rand -base64 32
```

### 环境变量检查清单

- [ ] Local: `.env.local` 文件已创建
- [ ] Dev: Cloudflare Pages Preview 环境变量已配置
- [ ] Production: Cloudflare Pages Production 环境变量已配置
- [ ] 三个环境使用不同的 `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL` 匹配对应的部署 URL

