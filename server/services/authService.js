/**
 * Authentication Service
 * 
 * Core business logic for user authentication
 */

import { db } from './database.js'
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation.js'
import { AppError } from '../middleware/errorHandler.js'

export class AuthService {
  async register({ email, password, name }) {
    email = sanitizeInput(email)
    name = sanitizeInput(name)
    
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new AppError(emailValidation.error, 400)
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.error, 400)
    }
    
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      throw new AppError(nameValidation.error, 400)
    }
    
    const strengthValidation = validatePasswordStrength(password)
    if (!strengthValidation.valid) {
      throw new AppError(strengthValidation.errors.join(', '), 400)
    }
    
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }
    
    const passwordHash = await hashPassword(password)
    
    const user = await db.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      provider: 'local'
    })
    
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    console.log(`[Auth] User registered: ${user.email} (ID: ${user.id})`)
    
    return {
      user: user.toPublic(),
      accessToken,
      refreshToken
    }
  }
  
  async login({ email, password }) {
    email = sanitizeInput(email)
    
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new AppError('Invalid credentials', 401)
    }
    
    const user = await db.findUserByEmail(email)
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }
    
    if (user.provider !== 'local') {
      throw new AppError(`This account uses ${user.provider} login`, 400)
    }
    
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }
    
    await db.updateUser(user.id, {
      lastLoginAt: new Date().toISOString()
    })
    
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)
    
    const refreshExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    await db.saveRefreshToken(user.id, refreshToken, refreshExpiry)
    
    console.log(`[Auth] User logged in: ${user.email} (ID: ${user.id})`)
    
    return {
      user: user.toPublic(),
      accessToken,
      refreshToken
    }
  }
  
  async verifyToken(token) {
    const isRevoked = await db.isTokenRevoked(token)
    if (isRevoked) {
      throw new AppError('Token has been revoked', 401)
    }
    
    return { valid: true }
  }
  
  async getUserById(userId) {
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    return user.toPublic()
  }
  
  async logout(userId, token) {
    await db.revokeAccessToken(token)
    
    console.log(`[Auth] User logged out: ${userId}`)
    
    return { success: true }
  }
  
  async refreshAccessToken(refreshToken) {
    const verification = verifyRefreshToken(refreshToken)
    
    if (!verification.valid) {
      throw new AppError('Invalid or expired refresh token', 401)
    }
    
    const { userId, email } = verification.decoded
    
    const storedToken = await db.findRefreshToken(userId, refreshToken)
    if (!storedToken) {
      throw new AppError('Refresh token not found or expired', 401)
    }
    
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    const newAccessToken = generateAccessToken(userId, email)
    
    console.log(`[Auth] Access token refreshed for user: ${userId}`)
    
    return {
      accessToken: newAccessToken,
      user: user.toPublic()
    }
  }
  
  async changePassword(userId, currentPassword, newPassword) {
    const user = await db.findUserById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    if (user.provider !== 'local') {
      throw new AppError('Cannot change password for OAuth accounts', 400)
    }
    
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401)
    }
    
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.error, 400)
    }
    
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.valid) {
      throw new AppError(strengthValidation.errors.join(', '), 400)
    }
    
    const newPasswordHash = await hashPassword(newPassword)
    
    await db.updateUser(userId, {
      passwordHash: newPasswordHash
    })
    
    await db.revokeAllRefreshTokens(userId)
    
    console.log(`[Auth] Password changed for user: ${userId}`)
    
    return { success: true }
  }
}

export const authService = new AuthService()
