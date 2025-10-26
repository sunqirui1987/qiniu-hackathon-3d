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
import { oauthService } from './oauthService.js'

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
  
  // Mock OAuth 登录或创建用户 - 用于开发和测试
  async loginOrCreateUser(oauthUser) {
    let user = await db.findUserByProvider(oauthUser.provider, oauthUser.providerId)
    
    if (!user) {
      // 检查是否已有相同邮箱的用户
      const existingUser = await db.findUserByEmail(oauthUser.email)
      if (existingUser) {
        // 如果已有相同邮箱的用户，更新其OAuth信息
        user = await db.updateUser(existingUser.id, {
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          avatar: oauthUser.avatar,
          lastLoginAt: new Date().toISOString()
        })
      } else {
        // 创建新用户
        user = await db.createUser({
          email: oauthUser.email,
          name: oauthUser.name,
          avatar: oauthUser.avatar,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId
        })
      }
      
      console.log(`[Auth] New mock OAuth user created: ${user.email} (${oauthUser.provider})`)
    } else {
      await db.updateUser(user.id, {
        name: oauthUser.name,
        avatar: oauthUser.avatar,
        lastLoginAt: new Date().toISOString()
      })
      
      console.log(`[Auth] Mock OAuth user logged in: ${user.email} (${oauthUser.provider})`)
    }
    
    const jwtAccessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    return {
      user: user.toPublic(),
      accessToken: jwtAccessToken,
      refreshToken
    }
  }

  async loginWithOAuth(provider, code, state) {
    console.log(`[Auth Debug] 开始 OAuth 登录流程`)
    console.log(`[Auth Debug] Provider: ${provider}`)
    console.log(`[Auth Debug] Code: ${code?.substring(0, 20)}...`)
    console.log(`[Auth Debug] State: ${state}`)
    
    const stateVerification = oauthService.verifyState(state, provider)
    console.log(`[Auth Debug] State 验证结果:`, stateVerification)
    
    if (!stateVerification.valid) {
      console.error(`[Auth Debug] State 验证失败:`, stateVerification.error)
      throw new AppError(stateVerification.error, 400)
    }
    
    console.log(`[Auth Debug] 开始交换 code 为 access token`)
    const accessToken = await oauthService.exchangeCodeForToken(provider, code)
    console.log(`[Auth Debug] 获得 access token: ${accessToken?.substring(0, 20)}...`)
    
    console.log(`[Auth Debug] 开始获取用户信息`)
    const oauthUser = await oauthService.getUserInfo(provider, accessToken)
    console.log(`[Auth Debug] OAuth 用户信息:`, JSON.stringify(oauthUser, null, 2))
    
    console.log(`[Auth Debug] 查找现有用户: provider=${oauthUser.provider}, providerId=${oauthUser.providerId}`)
    let user = await db.findUserByProvider(oauthUser.provider, oauthUser.providerId)
    console.log(`[Auth Debug] 现有用户查找结果:`, user ? `找到用户 ID: ${user.id}` : '未找到用户')
    
    if (!user) {
      console.log(`[Auth Debug] 创建新用户，数据:`, {
        email: oauthUser.email,
        name: oauthUser.name,
        avatar: oauthUser.avatar,
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        oauthData: oauthUser.rawData
      })
      
      try {
        user = await db.createUser({
          email: oauthUser.email,
          name: oauthUser.name,
          avatar: oauthUser.avatar,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          oauthData: oauthUser.rawData
        })
        
        console.log(`[Auth Debug] 新用户创建成功:`, {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider
        })
      } catch (createError) {
        console.error(`[Auth Debug] 创建用户失败:`, createError.message)
        console.error(`[Auth Debug] Create Error Stack:`, createError.stack)
        throw createError
      }
      
      console.log(`[Auth] New OAuth user created: ${user.email} (${provider})`)
    } else {
      console.log(`[Auth Debug] 更新现有用户信息`)
      await db.updateUser(user.id, {
        email: oauthUser.email,  // 更新邮箱为真实的GitHub邮箱
        name: oauthUser.name,
        avatar: oauthUser.avatar,
        lastLoginAt: new Date().toISOString()
      })
      console.log(`[Auth Debug] 用户信息更新完成，邮箱已更新为: ${oauthUser.email}`)
      
      // 重新获取更新后的用户信息
      user = await db.findUserById(user.id)
      
      console.log(`[Auth] OAuth user logged in: ${user.email} (${provider})`)
    }
    
    const jwtAccessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    return {
      user: user.toPublic(),
      accessToken: jwtAccessToken,
      refreshToken
    }
  }
}

export const authService = new AuthService()
