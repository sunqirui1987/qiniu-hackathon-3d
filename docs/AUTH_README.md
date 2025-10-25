# 生产级认证后端

## 概述

这是一个基于 PR #41 和 PR #48 构建的生产就绪认证后端，提供具有 JWT 令牌、bcrypt 密码哈希和全面安全功能的安全用户认证。

## 此实现的新功能

### 🔒 安全增强
- **Bcrypt 密码哈希**：用安全的 bcrypt 哈希（成本因子 12）替换明文密码存储
- **JWT 访问和刷新令牌**：业界标准的基于令牌的身份验证，支持令牌轮换
- **密码强度验证**：强制使用强密码（8+ 字符、大写字母、小写字母、数字）
- **令牌撤销**：支持登出和失效已泄露的令牌
- **安全头**：CORS、X-Frame-Options、CSP、XSS 保护
- **输入验证**：全面的验证和清理

### 🏗️ 架构改进
- **数据库抽象层**：轻松迁移到 PostgreSQL、MySQL 或 MongoDB
- **模块化设计**：分离关注点（路由、服务、中间件、工具）
- **错误处理**：集中式错误处理，带有适当的状态码
- **环境配置**：通过环境变量进行灵活配置
- **请求跟踪**：用于调试的唯一请求 ID

### 📚 生产就绪功能
- **完整的 API 文档**：参见 `AUTH_API.md`
- **环境配置**：参见 `.env.auth.example`
- **健康检查端点**：监控服务器状态
- **优雅关闭**：在 SIGTERM/SIGINT 时进行适当清理
- **日志记录**：全面的请求和错误日志

## 快速开始

### 1. 安装依赖

```bash
npm install
```

这将安装：
- `bcryptjs` - 密码哈希
- `jsonwebtoken` - JWT 令牌管理
- `dotenv` - 环境配置
- `better-sqlite3` - SQLite 数据库
- `express` - Web 框架（已安装）
- `cors` - CORS 中间件（已安装）

### 2. 配置环境

```bash
cp .env.auth.example .env.auth
```

编辑 `.env.auth` 并更新值（特别是生产环境的 JWT 密钥）。

### 3. 启动服务器

#### 使用 Node.js

```bash
# 开发模式
npm run auth-server:dev

# 生产模式
npm run auth-server
```

#### 使用 Bun（更快的 JavaScript 运行时）

```bash
# 开发模式
npm run auth-server:bun:dev

# 生产模式
npm run auth-server:bun
```

服务器将在 `http://localhost:3001` 上启动

## 数据库

### SQLite 存储

默认使用 SQLite 作为数据库，提供持久化存储：
- 数据库文件位置：`data/auth.db`
- 自动创建表和索引
- 支持 WAL 模式以提高并发性能
- 数据在服务器重启后保持

SQLite 特点：
- ✅ 零配置：无需额外安装数据库服务器
- ✅ 文件存储：所有数据存储在单个文件中
- ✅ ACID 兼容：保证数据一致性
- ✅ 高性能：适合中小型应用
- ✅ 轻量级：占用资源少

## API 端点

完整的 API 文档请参见 `AUTH_API.md`。

快速参考：
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify` - 令牌验证
- `GET /api/auth/user` - 获取用户信息
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新访问令牌
- `POST /api/auth/change-password` - 修改密码
- `GET /health` - 健康检查

## 测试

### 注册新用户

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

响应：
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Test User",
      "avatar": "https://ui-avatars.com/api/?name=Test+User",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 登录

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### 获取用户信息

```bash
curl http://localhost:3001/api/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 验证令牌

```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 刷新访问令牌

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 修改密码

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

### 登出

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 项目结构

```
auth-server.js                      # 主服务器入口点
server/
├── config/
│   └── env.js                      # 环境配置
├── routes/
│   └── auth.js                     # 认证路由
├── services/
│   ├── authService.js              # 核心认证逻辑
│   └── database.js                 # 数据库抽象层
├── models/
│   └── User.js                     # 用户模型
├── utils/
│   ├── jwt.js                      # JWT 令牌工具
│   ├── password.js                 # 密码哈希工具
│   └── validation.js               # 输入验证
└── middleware/
    ├── security.js                 # 安全中间件
    └── errorHandler.js             # 错误处理
```

## 迁移到生产数据库

当前实现使用内存数据库。要迁移到生产环境：

### PostgreSQL 示例

1. 安装 PostgreSQL 客户端：
```bash
npm install pg
```

2. 更新 `server/services/database.js`：
```javascript
import pg from 'pg'
import { config } from '../config/env.js'

const pool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password
})

// 用 SQL 查询替换基于 Map 的操作
export async function createUser(userData) {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name, avatar, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userData.email, userData.passwordHash, userData.name, userData.avatar, userData.provider]
  )
  return result.rows[0]
}
```

3. 创建数据库架构：
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  provider VARCHAR(50) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. 在 `.env.auth` 中更新环境变量：
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## 安全最佳实践

### 开发环境
- ✅ 使用 `.env.auth` 进行配置
- ✅ 永远不要将密钥提交到 git
- ✅ 使用 mkcert 在本地测试 HTTPS

### 生产环境
- ✅ 设置强 JWT 密钥（64+ 字符）
- ✅ 使用生产数据库（PostgreSQL/MySQL/MongoDB）
- ✅ 启用 HTTPS（使用 nginx/Apache 反向代理）
- ✅ 实现速率限制
- ✅ 设置监控和日志
- ✅ 使用进程管理器（PM2、systemd）
- ✅ 定期安全更新

## 与 mock-oauth-server.js 的差异

| 功能 | mock-oauth-server.js | auth-server.js |
|---------|---------------------|----------------|
| 密码存储 | 明文 ⚠️ | Bcrypt 哈希 ✅ |
| 令牌类型 | 简单随机字节 | 带过期的 JWT ✅ |
| 令牌刷新 | 不支持 ❌ | 支持 ✅ |
| 密码验证 | 无 ❌ | 强验证 ✅ |
| 数据库 | 仅内存 | 抽象层 ✅ |
| 输入验证 | 最小 ⚠️ | 全面 ✅ |
| 安全头 | 无 ❌ | 完整集 ✅ |
| 错误处理 | 基本 ⚠️ | 集中式 ✅ |
| 环境配置 | 硬编码 ❌ | .env 文件 ✅ |
| API 文档 | 无 ❌ | 完整 ✅ |
| 生产就绪 | 否 ❌ | 是 ✅ |

## 部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动服务器
pm2 start auth-server.js --name auth-server

# 监控
pm2 logs auth-server
pm2 monit

# 服务器重启时自动重启
pm2 startup
pm2 save
```

### 使用 Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "auth-server.js"]
```

```bash
docker build -t auth-server .
docker run -p 3001:3001 --env-file .env.auth auth-server
```

### 使用 systemd

```ini
[Unit]
Description=Authentication Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/auth-server
EnvironmentFile=/var/www/auth-server/.env.auth
ExecStart=/usr/bin/node auth-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 故障排除

### 服务器无法启动
- 检查端口 3001 是否可用
- 验证 `.env.auth` 配置
- 检查 Node.js 版本（需要 18+）

### 令牌验证失败
- 检查 JWT 密钥在注册和验证之间是否匹配
- 验证令牌是否未过期
- 检查令牌格式（应为 `Bearer <token>`）

### 密码验证失败
- 确保密码满足要求（8+ 字符、大写字母、小写字母、数字）
- 检查前导/尾随空格

## 贡献

扩展此认证后端时：

1. 遵循现有的模块化结构
2. 添加适当的验证和错误处理
3. 更新文档
4. 为新功能编写测试
5. 遵循安全最佳实践

## 许可证

ISC

## 相关文件

- `mock-oauth-server.js` - 原始 OAuth 模拟服务器（仅开发）
- `AUTH_API.md` - 完整 API 文档
- `.env.auth.example` - 环境配置模板
- `OAUTH_SETUP.md` - OAuth 提供商设置指南
