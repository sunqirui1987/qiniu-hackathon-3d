/**
 * 环境配置
 * 
 * 集中管理所有环境变量及其默认值
 * 支持开发和生产环境
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.auth') })

// 导出配置对象
export const config = {
  // 环境和端口配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.AUTH_PORT || '3001', 10),
  
  // CORS 源配置
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // JWT 令牌配置
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-this-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  // Bcrypt 密码哈希配置
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  // 数据库配置
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'auth_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  
  // 速率限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
}

// 验证配置是否有效
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
