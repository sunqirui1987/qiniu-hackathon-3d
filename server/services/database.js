/**
 * 数据库服务（内存实现）
 * 
 * 这是一个抽象层，可以轻松替换为真实数据库
 * （PostgreSQL、MySQL、MongoDB 等）
 * 
 * 生产环境下，请替换为适当的数据库实现：
 * - PostgreSQL：使用 pg 或 Sequelize
 * - MySQL：使用 mysql2 或 Sequelize
 * - MongoDB：使用 mongoose
 */

import crypto from 'crypto'
import { User } from '../models/User.js'

class DatabaseService {
  constructor() {
    // 使用 Map 存储用户数据（仅用于开发）
    this.users = new Map()
    // 存储刷新令牌
    this.refreshTokens = new Map()
    // 存储已撤销的令牌
    this.revokedTokens = new Set()
    
    this._seedTestUsers()
  }
  
  // 种子测试用户（仅用于开发）
  _seedTestUsers() {
    console.log('🌱 Seeding test users (development only)...')
  }
  
  // 创建用户
  async createUser(userData) {
    const id = crypto.randomUUID()
    const user = new User({
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    this.users.set(id, user)
    return user
  }
  
  // 根据ID查找用户
  async findUserById(id) {
    return this.users.get(id) || null
  }
  
  // 根据邮箱查找用户
  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }
  
  // 更新用户信息
  async updateUser(id, updates) {
    const user = this.users.get(id)
    if (!user) return null
    
    Object.assign(user, updates, { updatedAt: new Date().toISOString() })
    this.users.set(id, user)
    return user
  }
  
  // 删除用户
  async deleteUser(id) {
    return this.users.delete(id)
  }
  
  // 保存刷新令牌
  async saveRefreshToken(userId, token, expiresAt) {
    if (!this.refreshTokens.has(userId)) {
      this.refreshTokens.set(userId, [])
    }
    
    this.refreshTokens.get(userId).push({
      token,
      expiresAt,
      createdAt: Date.now()
    })
    
    // 清理过期令牌
    this._cleanupExpiredTokens(userId)
  }
  
  // 查找刷新令牌
  async findRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId) || []
    return tokens.find(t => t.token === token && t.expiresAt > Date.now())
  }
  
  // 撤销单个刷新令牌
  async revokeRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId) || []
    const filtered = tokens.filter(t => t.token !== token)
    this.refreshTokens.set(userId, filtered)
  }
  
  // 撤销用户的所有刷新令牌
  async revokeAllRefreshTokens(userId) {
    this.refreshTokens.delete(userId)
  }
  
  // 撤销访问令牌
  async revokeAccessToken(token) {
    this.revokedTokens.add(token)
  }
  
  // 检查令牌是否已被撤销
  async isTokenRevoked(token) {
    return this.revokedTokens.has(token)
  }
  
  // 清理过期的刷新令牌
  _cleanupExpiredTokens(userId) {
    const tokens = this.refreshTokens.get(userId) || []
    const now = Date.now()
    const valid = tokens.filter(t => t.expiresAt > now)
    this.refreshTokens.set(userId, valid)
  }
  
  // 获取所有用户
  async getAllUsers() {
    return Array.from(this.users.values())
  }
  
  // 获取用户总数
  async getUserCount() {
    return this.users.size
  }
}

export const db = new DatabaseService()
