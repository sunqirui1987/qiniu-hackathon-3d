/**
 * Environment Configuration
 * 
 * Centralizes all environment variables with defaults
 * Supports development and production environments
 */

import dotenv from 'dotenv'

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.AUTH_PORT || '3001', 10),
  
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-this-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  database: {
    type: process.env.DB_TYPE || 'memory',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'auth_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
}

export function validateConfig() {
  const errors = []
  
  if (config.nodeEnv === 'production') {
    if (config.jwt.accessSecret.includes('change-this')) {
      errors.push('JWT_ACCESS_SECRET must be set in production')
    }
    if (config.jwt.refreshSecret.includes('change-this')) {
      errors.push('JWT_REFRESH_SECRET must be set in production')
    }
    if (config.database.type === 'memory') {
      console.warn('⚠️  WARNING: Using in-memory database in production!')
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:')
    errors.forEach(err => console.error(`   - ${err}`))
    process.exit(1)
  }
  
  return true
}

validateConfig()
