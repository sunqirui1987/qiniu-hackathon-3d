/**
 * 认证服务
 * 
 * 用户认证的核心业务逻辑
 */

import { db } from './database.js'
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation.js'
import { AppError } from '../middleware/errorHandler.js'

export class AuthService {
  // 用户注册
  async register({ email, password, name }) {
    // 清理输入
    email = sanitizeInput(email)
    name = sanitizeInput(name)
    
    // 验证邮箱
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new AppError(emailValidation.error, 400)
    }
    
    // 验证密码基本要求
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.error, 400)
    }
    
    // 验证姓名
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      throw new AppError(nameValidation.error, 400)
    }
    
    // 验证密码强度
    const strengthValidation = validatePasswordStrength(password)
    if (!strengthValidation.valid) {
      throw new AppError(strengthValidation.errors.join(', '), 400)
    }
    
    // 检查用户是否已存在
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }
    
    // 哈希密码
    const passwordHash = await hashPassword(password)
    
    // 创建用户
    const user = await db.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      provider: 'local'
    })
    
    // 生成访问令牌和刷新令牌
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    // 保存刷新令牌
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    console.log(`[Auth] User registered: ${user.email} (ID: ${user.id})`)
    
    return {
      user: user.toPublic(),
      accessToken,
      refreshToken
    }
  }
  
  // 用户登录
  async login({ email, password }) {
    // 清理输入
    email = sanitizeInput(email)
    
    // 验证邮箱格式
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new AppError('Invalid credentials', 401)
    }
    
    // 查找用户
    const user = await db.findUserByEmail(email)
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }
    
    // 检查是否为本地账户
    if (user.provider !== 'local') {
      throw new AppError(`This account uses ${user.provider} login`, 400)
    }
    
    // 验证密码
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }
    
    // 更新最后登录时间
    await db.updateUser(user.id, {
      lastLoginAt: new Date().toISOString()
    })
    
    // 生成令牌
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    // 保存刷新令牌
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    console.log(`[Auth] User logged in: ${user.email} (ID: ${user.id})`)
    
    return {
      user: user.toPublic(),
      accessToken,
      refreshToken
    }
  }
  
  // 验证令牌是否被撤销
  async verifyToken(token) {
    const isRevoked = await db.isTokenRevoked(token)
    if (isRevoked) {
      throw new AppError('Token has been revoked', 401)
    }
    
    return { valid: true }
  }
  
  // 根据ID获取用户
  async getUserById(userId) {
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    return user.toPublic()
  }
  
  // 用户登出
  async logout(userId, token) {
    // 撤销访问令牌
    await db.revokeAccessToken(token)
    
    console.log(`[Auth] User logged out: ${userId}`)
    
    return { success: true }
  }
  
  // 刷新访问令牌
  async refreshAccessToken(refreshToken) {
    // 验证刷新令牌
    const verification = verifyRefreshToken(refreshToken)
    
    if (!verification.valid) {
      throw new AppError('Invalid or expired refresh token', 401)
    }
    
    const { userId, email } = verification.decoded
    
    // 检查刷新令牌是否存储在数据库中
    const storedToken = await db.findRefreshToken(userId, refreshToken)
    if (!storedToken) {
      throw new AppError('Refresh token not found or expired', 401)
    }
    
    // 获取用户信息
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    // 生成新的访问令牌
    const newAccessToken = generateAccessToken(userId, email)
    
    console.log(`[Auth] Access token refreshed for user: ${userId}`)
    
    return {
      accessToken: newAccessToken,
      user: user.toPublic()
    }
  }
  
  // 修改密码
  async changePassword(userId, currentPassword, newPassword) {
    // 查找用户
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    // 检查是否为本地账户
    if (user.provider !== 'local') {
      throw new AppError('Cannot change password for OAuth accounts', 400)
    }
    
    // 验证当前密码
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401)
    }
    
    // 验证新密码
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.error, 400)
    }
    
    // 验证新密码强度
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.valid) {
      throw new AppError(strengthValidation.errors.join(', '), 400)
    }
    
    // 哈希新密码
    const newPasswordHash = await hashPassword(newPassword)
    
    // 更新密码
    await db.updateUser(userId, {
      passwordHash: newPasswordHash
    })
    
    // 撤销所有刷新令牌
    await db.revokeAllRefreshTokens(userId)
    
    console.log(`[Auth] Password changed for user: ${userId}`)
    
    return { success: true }
  }
}

export const authService = new AuthService()
