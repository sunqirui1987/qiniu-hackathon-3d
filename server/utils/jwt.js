/**
 * JWT 令牌管理工具
 * 
 * 处理访问令牌和刷新令牌的创建和验证
 */

import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

// 生成访问令牌
export function generateAccessToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'access'
    },
    config.jwt.accessSecret,
    { 
      expiresIn: config.jwt.accessExpiry,
      issuer: 'auth-server',
      audience: 'api'
    }
  )
}

// 生成刷新令牌
export function generateRefreshToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'refresh'
    },
    config.jwt.refreshSecret,
    { 
      expiresIn: config.jwt.refreshExpiry,
      issuer: 'auth-server',
      audience: 'api'
    }
  )
}

// 验证访问令牌
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'auth-server',
      audience: 'api'
    })
    
    // 确保令牌类型正确
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type')
    }
    
    return { valid: true, decoded }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// 验证刷新令牌
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'auth-server',
      audience: 'api'
    })
    
    // 确保令牌类型正确
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }
    
    return { valid: true, decoded }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// 解码令牌（不验证签名）
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}
