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

const app = express()
const PORT = 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

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
  console.log('║  Available endpoints:                                  ║')
  console.log('║    GET /auth/github  - Mock GitHub login               ║')
  console.log('║    GET /auth/google  - Mock Google login               ║')
  console.log('║    GET /health       - Health check                    ║')
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
