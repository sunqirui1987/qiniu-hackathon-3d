/**
 * Mock OAuth Server for Development Testing
 * 
 * This is a simple mock server for testing OAuth login flow during development.
 * It simulates the OAuth authorization process without requiring actual OAuth apps.
 * 
 * IMPORTANT: This is for DEVELOPMENT ONLY. Do not use in production!
 * 
 * Usage:
 *   1. Install dependencies: npm install express cors
 *   2. Run: node mock-oauth-server.js
 *   3. The server will start on http://localhost:3000
 */

import express from 'express'
import cors from 'cors'
import crypto from 'crypto'

const app = express()
const PORT = 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

const users = new Map()
const tokens = new Map()

const mockUserDatabase = {
  'test@example.com': {
    id: 'user_test_001',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    avatar: 'https://ui-avatars.com/api/?name=Test+User',
    provider: 'local',
    createdAt: new Date().toISOString()
  },
  'admin@example.com': {
    id: 'user_admin_001',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User',
    provider: 'local',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
}

function generateToken(userId, provider = 'local') {
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
  
  tokens.set(token, {
    userId,
    provider,
    exp: expiry,
    createdAt: Date.now()
  })
  
  return token
}

function validateToken(token) {
  const tokenData = tokens.get(token)
  
  if (!tokenData) {
    return { valid: false, error: 'Invalid token' }
  }
  
  if (tokenData.exp < Date.now()) {
    tokens.delete(token)
    return { valid: false, error: 'Token expired' }
  }
  
  return { valid: true, data: tokenData }
}

app.get('/auth/:provider', (req, res) => {
  const { provider } = req.params
  
  console.log(`[Mock OAuth] Simulating ${provider} login...`)
  
  const mockUsers = {
    github: {
      id: 'github_123456',
      email: 'developer@example.com',
      name: 'GitHub Developer',
      avatar: 'https://avatars.githubusercontent.com/u/123456?v=4',
      provider: 'github',
      createdAt: new Date().toISOString()
    },
    google: {
      id: 'google_987654',
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google',
      createdAt: new Date().toISOString()
    }
  }
  
  const user = mockUsers[provider] || mockUsers.github
  
  const mockToken = Buffer.from(JSON.stringify({
    userId: user.id,
    provider: user.provider,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString('base64')
  
  const frontendUrl = 'http://localhost:5173'
  const redirectUrl = `${frontendUrl}/auth/callback?token=${mockToken}&user=${encodeURIComponent(JSON.stringify(user))}`
  
  console.log(`[Mock OAuth] Redirecting to: ${redirectUrl}`)
  
  setTimeout(() => {
    res.redirect(redirectUrl)
  }, 500)
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  console.log(`[Auth] Login attempt for: ${email}`)
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    })
  }
  
  const user = mockUserDatabase[email]
  
  if (!user) {
    console.log(`[Auth] User not found: ${email}`)
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    })
  }
  
  if (user.password !== password) {
    console.log(`[Auth] Invalid password for: ${email}`)
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    })
  }
  
  const token = generateToken(user.id, user.provider)
  
  const { password: _, ...userWithoutPassword } = user
  
  console.log(`[Auth] Login successful for: ${email}`)
  
  res.json({
    success: true,
    token,
    user: userWithoutPassword
  })
})

app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    })
  }
  
  const validation = validateToken(token)
  
  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      error: validation.error
    })
  }
  
  console.log(`[Auth] Token verified for user: ${validation.data.userId}`)
  
  res.json({
    success: true,
    valid: true,
    userId: validation.data.userId,
    provider: validation.data.provider
  })
})

app.get('/api/auth/user', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    })
  }
  
  const validation = validateToken(token)
  
  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      error: validation.error
    })
  }
  
  const userId = validation.data.userId
  let user = null
  
  for (const userData of Object.values(mockUserDatabase)) {
    if (userData.id === userId) {
      const { password, ...userWithoutPassword } = userData
      user = userWithoutPassword
      break
    }
  }
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }
  
  console.log(`[Auth] User info retrieved for: ${user.email}`)
  
  res.json({
    success: true,
    user
  })
})

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    const validation = validateToken(token)
    if (validation.valid) {
      console.log(`[Auth] User logged out: ${validation.data.userId}`)
      tokens.delete(token)
    }
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock OAuth Server is running' })
})

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║       Mock OAuth Server for Development Testing       ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log(`║  Server running on: http://localhost:${PORT}           ║`)
  console.log('║  Frontend URL:      http://localhost:5173              ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  OAuth endpoints:                                      ║')
  console.log('║    GET  /auth/github       - Mock GitHub login         ║')
  console.log('║    GET  /auth/google       - Mock Google login         ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Auth API endpoints:                                   ║')
  console.log('║    POST /api/auth/login    - User login                ║')
  console.log('║    POST /api/auth/verify   - Token verification        ║')
  console.log('║    GET  /api/auth/user     - Get user info             ║')
  console.log('║    POST /api/auth/logout   - User logout               ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Test users:                                           ║')
  console.log('║    test@example.com / password123                      ║')
  console.log('║    admin@example.com / admin123                        ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  Other:                                                ║')
  console.log('║    GET  /health            - Health check              ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║  ⚠️  WARNING: This is for DEVELOPMENT ONLY!            ║')
  console.log('║  Do not use in production!                            ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('💡 Tip: Set VITE_API_BASE_URL=http://localhost:3000 in your .env file')
  console.log('')
})

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock OAuth server...')
  process.exit(0)
})
