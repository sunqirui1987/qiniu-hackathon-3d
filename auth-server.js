/**
 * 生产就绪的认证服务器
 * 
 * 一个安全的、生产级认证后端，具有以下功能：
 * - Bcrypt 密码哈希
 * - JWT 令牌管理（访问令牌和刷新令牌）
 * - 输入验证和清理
 * - 速率限制支持
 * - 数据库抽象层
 * - 全面的错误处理
 * - 安全最佳实践
 * 
 * 使用方法：
 *   1. 安装依赖：npm install bcryptjs jsonwebtoken express-validator helmet dotenv
 *   2. 配置 .env 文件（参见 .env.example）
 *   3. 运行：node auth-server.js
 */

import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { config } from './server/config/env.js'
import { authRouter } from './server/routes/auth.js'
import { meshyRouter } from './server/routes/meshy.js'
import { errorHandler } from './server/middleware/errorHandler.js'
import { securityMiddleware } from './server/middleware/security.js'

const app = express()
const PORT = config.port

// 应用安全中间件
app.use(securityMiddleware)

// 配置 CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 解析 JSON 和 URL 编码的请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 为每个请求添加唯一 ID 用于跟踪和调试
app.use((req, res, next) => {
  const requestId = crypto.randomUUID()
  req.id = requestId
  res.setHeader('X-Request-ID', requestId)
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`)
  next()
})

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Production Authentication Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 挂载认证路由
app.use('/api/auth', authRouter)

// 挂载 Meshy API 代理路由
console.log('[Server] 注册 Meshy API 代理路由到 /api/meshy')
app.use('/api/meshy', (req, res, next) => {
  console.log('[Server] Meshy 路由中间件被调用:', req.method, req.originalUrl)
  console.log('[Server] 请求路径:', req.path)
  next()
}, meshyRouter)

// OAuth路由 - 重定向到真正的OAuth授权端点
app.get('/auth/:provider', (req, res) => {
  const { provider } = req.params
  
  if (!['github', 'google'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported OAuth provider'
    })
  }
  
  // 重定向到真正的OAuth授权端点
  res.redirect(`/api/auth/${provider}`)
})

// 处理 404 错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

// 全局错误处理中间件
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║    Production Authentication Server v1.0.0            ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log(`║  Server running on: http://localhost:${PORT}           ║`)
  console.log(`║  Environment:       ${config.nodeEnv}                     ║`)
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Authentication API Endpoints:                         ║')
  console.log('║    POST /api/auth/register     - User registration     ║')
  console.log('║    POST /api/auth/login        - User login            ║')
  console.log('║    POST /api/auth/verify       - Token verification    ║')
  console.log('║    GET  /api/auth/user         - Get user info         ║')
  console.log('║    POST /api/auth/logout       - User logout           ║')
  console.log('║    POST /api/auth/refresh      - Refresh access token  ║')
  console.log('║    POST /api/auth/change-pass  - Change password       ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Health Check:                                         ║')
  console.log('║    GET  /health                - Health check          ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Security Features:                                    ║')
  console.log('║    ✓ Bcrypt password hashing (cost factor 12)          ║')
  console.log('║    ✓ JWT access & refresh tokens                       ║')
  console.log('║    ✓ Input validation & sanitization                   ║')
  console.log('║    ✓ Security headers (Helmet)                         ║')
  console.log('║    ✓ CORS protection                                   ║')
  console.log('║    ✓ Request ID tracking                               ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Database:                                             ║')
  console.log('║    Currently: In-Memory (Development)                  ║')
  console.log('║    Production: PostgreSQL/MySQL/MongoDB ready          ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('💡 Configure your environment in .env file')
  console.log('📚 API Documentation: See AUTH_API.md')
  console.log('')
})

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down authentication server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

export default app
