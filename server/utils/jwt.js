/**
 * JWT Token Management Utilities
 * 
 * Handles creation and verification of access and refresh tokens
 */

import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

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

export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'auth-server',
      audience: 'api'
    })
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type')
    }
    
    return { valid: true, decoded }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'auth-server',
      audience: 'api'
    })
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }
    
    return { valid: true, decoded }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}
