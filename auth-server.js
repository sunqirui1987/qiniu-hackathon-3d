/**
 * Production-Ready Authentication Server
 * 
 * A secure, production-grade authentication backend with:
 * - Bcrypt password hashing
 * - JWT token management with access & refresh tokens
 * - Input validation and sanitization
 * - Rate limiting support
 * - Database abstraction layer
 * - Comprehensive error handling
 * - Security best practices
 * 
 * Usage:
 *   1. Install dependencies: npm install bcryptjs jsonwebtoken express-validator helmet dotenv
 *   2. Configure .env file (see .env.example)
 *   3. Run: node auth-server.js
 */

import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { config } from './server/config/env.js'
import { authRouter } from './server/routes/auth.js'
import { errorHandler } from './server/middleware/errorHandler.js'
import { securityMiddleware } from './server/middleware/security.js'

const app = express()
const PORT = config.port

app.use(securityMiddleware)

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req, res, next) => {
  const requestId = crypto.randomUUID()
  req.id = requestId
  res.setHeader('X-Request-ID', requestId)
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`)
  next()
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Production Authentication Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

app.use('/api/auth', authRouter)

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

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
