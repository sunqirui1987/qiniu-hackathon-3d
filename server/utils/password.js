/**
 * Password Hashing Utilities
 * 
 * Secure password hashing using bcrypt
 */

import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'

export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error comparing password:', error)
    throw new Error('Failed to verify password')
  }
}

export function validatePasswordStrength(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
