/**
 * 密码哈希工具
 * 
 * 使用 bcrypt 进行安全的密码哈希
 */

import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'

// 哈希密码
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

// 比较密码与哈希值
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error comparing password:', error)
    throw new Error('Failed to verify password')
  }
}

// 验证密码强度
export function validatePasswordStrength(password) {
  const errors = []
  
  // 检查密码长度
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  // 检查是否包含大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // 检查是否包含小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // 检查是否包含数字
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
