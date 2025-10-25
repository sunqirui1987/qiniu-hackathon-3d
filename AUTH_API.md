# 认证 API 文档

## 概述

这是一个生产就绪的认证后端，具有基于 JWT 的身份验证、安全密码哈希和全面的安全功能。

## 基础 URL

```
http://localhost:3001
```

## 身份验证

大多数端点需要 JWT 访问令牌。在 Authorization 头中包含它：

```
Authorization: Bearer <access_token>
```

## API 端点

### 1. 注册用户

创建一个新的用户账户。

**端点：** `POST /api/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**密码要求：**
- 至少 8 个字符长
- 包含至少一个大写字母
- 包含至少一个小写字母
- 包含至少一个数字

**成功响应 (201 Created)：**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**错误响应：**
- `400` - 验证错误（弱密码、无效邮箱等）
- `409` - 用户已存在

---

### 2. 登录

验证用户并接收令牌。

**端点：** `POST /api/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**错误响应：**
- `401` - 无效的凭据
- `400` - 账户使用 OAuth 登录

---

### 3. 验证令牌

验证访问令牌是否有效。

**端点：** `POST /api/auth/verify`

**请求头：**
```
Authorization: Bearer <access_token>
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com"
  }
}
```

**错误响应：**
- `401` - 无效或过期的令牌

---

### 4. 获取用户信息

获取已认证用户的信息。

**端点：** `GET /api/auth/user`

**请求头：**
```
Authorization: Bearer <access_token>
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应：**
- `401` - 需要身份验证
- `404` - 用户未找到

---

### 5. 登出

登出用户并撤销访问令牌。

**端点：** `POST /api/auth/logout`

**请求头：**
```
Authorization: Bearer <access_token>
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 6. 刷新访问令牌

使用刷新令牌获取新的访问令牌。

**端点：** `POST /api/auth/refresh`

**请求体：**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应：**
- `401` - 无效或过期的刷新令牌

---

### 7. 修改密码

修改用户的密码。

**端点：** `POST /api/auth/change-password`

**请求头：**
```
Authorization: Bearer <access_token>
```

**请求体：**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**成功响应 (200 OK)：**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**错误响应：**
- `400` - 验证错误或 OAuth 账户
- `401` - 当前密码不正确

---

### 8. 健康检查

检查服务器是否正在运行。

**端点：** `GET /health`

**成功响应 (200 OK)：**
```json
{
  "status": "healthy",
  "message": "Production Authentication Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 安全功能

### 密码安全
- **Bcrypt 哈希**：密码使用 bcrypt 哈希，成本因子为 12
- **密码强度验证**：强制最少 8 个字符，大写字母、小写字母和数字
- **无明文存储**：密码从不以明文形式存储

### 令牌安全
- **JWT 令牌**：业界标准的 JSON Web Tokens
- **访问令牌**：短期有效（默认 15 分钟）
- **刷新令牌**：长期有效（默认 7 天）
- **令牌撤销**：支持登出和令牌失效
- **令牌类型验证**：防止使用刷新令牌作为访问令牌

### HTTP 安全
- **CORS 保护**：可配置的 CORS 和凭据支持
- **安全头**：包括 X-Content-Type-Options、X-Frame-Options 等
- **HTTPS 就绪**：为 HTTPS 部署做好准备
- **请求 ID 跟踪**：每个请求获得唯一 ID 用于调试

### 输入验证
- **邮箱验证**：验证邮箱格式和长度
- **输入清理**：移除潜在危险字符
- **SQL 注入防护**：为参数化查询做好准备
- **XSS 保护**：输入清理和安全头

---

## 错误处理

所有错误遵循此格式：

```json
{
  "success": false,
  "error": "Error message here"
}
```

常见 HTTP 状态码：
- `200` - 成功
- `201` - 已创建
- `400` - 错误请求（验证错误）
- `401` - 未授权（需要或失败的身份验证）
- `404` - 未找到
- `409` - 冲突（例如，用户已存在）
- `500` - 内部服务器错误

---

## 令牌生命周期

1. **注册/登录**：用户接收访问令牌（15 分钟）和刷新令牌（7 天）
2. **API 请求**：在 Authorization 头中包含访问令牌
3. **令牌过期**：当访问令牌过期时，使用刷新令牌获取新的访问令牌
4. **登出**：两个令牌都被撤销
5. **安全性**：刷新令牌存储在服务器端，可以被撤销

---

## 迁移到生产数据库

当前实现使用内存数据库进行开发。要迁移到生产环境：

1. **PostgreSQL 示例：**
   ```javascript
   import pg from 'pg'
   
   const pool = new pg.Pool({
     host: config.database.host,
     port: config.database.port,
     database: config.database.name,
     user: config.database.user,
     password: config.database.password
   })
   ```

2. **更新数据库服务**：用 SQL 查询替换基于 Map 的存储
3. **创建数据库架构**：users、refresh_tokens、revoked_tokens 表
4. **更新环境变量**：设置 DB_TYPE、DB_HOST 等

---

## 速率限制

服务器已为速率限制做好准备。要实现：

1. 安装 `express-rate-limit`
2. 在中间件中配置：
   ```javascript
   import rateLimit from 'express-rate-limit'
   
   const limiter = rateLimit({
     windowMs: config.rateLimit.windowMs,
     max: config.rateLimit.maxRequests
   })
   
   app.use('/api/', limiter)
   ```

---

## 环境变量

所有可用的配置选项请参见 `.env.auth.example`。

**生产环境关键配置：**
- 设置强 `JWT_ACCESS_SECRET` 和 `JWT_REFRESH_SECRET`
- 配置适当的数据库（非内存）
- 设置适当的 CORS 来源
- 在生产环境中使用 HTTPS
- 配置速率限制

---

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install bcryptjs jsonwebtoken dotenv

# 复制环境文件
cp .env.auth.example .env.auth

# 启动服务器
node auth-server.js
```

### 生产环境

```bash
# 设置生产环境
export NODE_ENV=production

# 在 .env.auth 中配置密钥
# 设置生产数据库
# 配置 HTTPS 反向代理（nginx/Apache）

# 使用进程管理器启动
pm2 start auth-server.js --name auth-server
```

---

## 使用 cURL 测试

### 注册
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'
```

### 登录
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### 验证令牌
```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 获取用户
```bash
curl http://localhost:3001/api/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 支持

有关问题和疑问，请参阅项目文档或联系开发团队。
