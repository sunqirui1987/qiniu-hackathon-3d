/**
 * Database Service (In-Memory Implementation)
 * 
 * This is an abstraction layer that can be easily replaced with
 * a real database (PostgreSQL, MySQL, MongoDB, etc.)
 * 
 * For production, replace this with a proper database implementation:
 * - PostgreSQL with pg or Sequelize
 * - MySQL with mysql2 or Sequelize
 * - MongoDB with mongoose
 */

import crypto from 'crypto'
import { User } from '../models/User.js'

class DatabaseService {
  constructor() {
    this.users = new Map()
    this.refreshTokens = new Map()
    this.revokedTokens = new Set()
    
    this._seedTestUsers()
  }
  
  _seedTestUsers() {
    console.log('🌱 Seeding test users (development only)...')
  }
  
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
  
  async findUserById(id) {
    return this.users.get(id) || null
  }
  
  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }
  
  async updateUser(id, updates) {
    const user = this.users.get(id)
    if (!user) return null
    
    Object.assign(user, updates, { updatedAt: new Date().toISOString() })
    this.users.set(id, user)
    return user
  }
  
  async deleteUser(id) {
    return this.users.delete(id)
  }
  
  async saveRefreshToken(userId, token, expiresAt) {
    if (!this.refreshTokens.has(userId)) {
      this.refreshTokens.set(userId, [])
    }
    
    this.refreshTokens.get(userId).push({
      token,
      expiresAt,
      createdAt: Date.now()
    })
    
    this._cleanupExpiredTokens(userId)
  }
  
  async findRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId) || []
    return tokens.find(t => t.token === token && t.expiresAt > Date.now())
  }
  
  async revokeRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId) || []
    const filtered = tokens.filter(t => t.token !== token)
    this.refreshTokens.set(userId, filtered)
  }
  
  async revokeAllRefreshTokens(userId) {
    this.refreshTokens.delete(userId)
  }
  
  async revokeAccessToken(token) {
    this.revokedTokens.add(token)
  }
  
  async isTokenRevoked(token) {
    return this.revokedTokens.has(token)
  }
  
  _cleanupExpiredTokens(userId) {
    const tokens = this.refreshTokens.get(userId) || []
    const now = Date.now()
    const valid = tokens.filter(t => t.expiresAt > now)
    this.refreshTokens.set(userId, valid)
  }
  
  async getAllUsers() {
    return Array.from(this.users.values())
  }
  
  async getUserCount() {
    return this.users.size
  }
}

export const db = new DatabaseService()
