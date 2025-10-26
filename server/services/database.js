/**
 * 数据库服务（SQLite 实现）
 *
 * 使用 SQLite 作为持久化存储
 * 支持 Node.js 运行时（使用 better-sqlite3）
 *
 * 生产环境建议：
 * - PostgreSQL：使用 pg 或 Sequelize
 * - MySQL：使用 mysql2 或 Sequelize
 * - MongoDB：使用 mongoose
 */

import Database from 'better-sqlite3'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { User } from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class DatabaseService {
  constructor() {
    // 创建数据目录
    const dataDir = join(__dirname, '../../data')
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }

    // 初始化 SQLite 数据库
    const dbPath = join(dataDir, 'auth.db')
    this.db = new Database(dbPath)

    // 启用 WAL 模式以提高并发性能
    this.db.exec('PRAGMA journal_mode = WAL')

    // 初始化数据库表
    this._initTables()

    console.log(`📦 SQLite database initialized at: ${dbPath}`)
  }

  // 初始化数据库表
  _initTables() {
    // 创建用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT NOT NULL,
        avatar TEXT,
        provider TEXT NOT NULL DEFAULT 'local',
        provider_id TEXT,
        oauth_data TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT
      )
    `)

    // 创建刷新令牌表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 创建已撤销令牌表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        revoked_at TEXT NOT NULL
      )
    `)

    // 创建索引以提高查询性能
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);
    `)
  }

  // 创建用户
  async createUser(userData) {
    // console.log(`[Database Debug] 开始创建用户`)
    // console.log(`[Database Debug] 用户数据:`, JSON.stringify(userData, null, 2))

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    console.log(`[Database Debug] 生成用户 ID: ${id}`)
    // console.log(`[Database Debug] 创建时间: ${now}`)

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, avatar, provider, provider_id, oauth_data, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertData = [
      id,
      userData.email,
      userData.passwordHash || null,
      userData.name,
      userData.avatar || null,
      userData.provider || 'local',
      userData.providerId || null,
      userData.oauthData ? JSON.stringify(userData.oauthData) : null,
      userData.role || 'user',
      now,
      now
    ]

    // console.log(`[Database Debug] 插入数据:`, insertData)

    try {
      stmt.run(...insertData)
      console.log(`[Database Debug] 用户创建成功，ID: ${id}`)
    } catch (dbError) {
      console.error(`[Database Debug] 数据库插入失败:`, dbError.message)
      console.error(`[Database Debug] SQL Error Code:`, dbError.code)
      console.error(`[Database Debug] SQL Error Stack:`, dbError.stack)
      throw dbError
    }

    return new User({
      id,
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      avatar: userData.avatar,
      provider: userData.provider || 'local',
      providerId: userData.providerId,
      role: userData.role || 'user',
      createdAt: now,
      updatedAt: now
    })
  }

  // 根据ID查找用户
  async findUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    const row = stmt.get(id)

    if (!row) return null

    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      avatar: row.avatar,
      provider: row.provider,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    })
  }

  // 根据邮箱查找用户
  async findUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    const row = stmt.get(email)

    if (!row) return null

    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      avatar: row.avatar,
      provider: row.provider,
      providerId: row.provider_id,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    })
  }

  async findUserByProvider(provider, providerId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?')
    const row = stmt.get(provider, providerId)

    if (!row) return null

    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      avatar: row.avatar,
      provider: row.provider,
      providerId: row.provider_id,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    })
  }

  // 更新用户信息
  async updateUser(id, updates) {
    const user = await this.findUserById(id)
    if (!user) return null

    const now = new Date().toISOString()
    const fields = []
    const values = []

    if (updates.email !== undefined) {
      fields.push('email = ?')
      values.push(updates.email)
    }
    if (updates.passwordHash !== undefined) {
      fields.push('password_hash = ?')
      values.push(updates.passwordHash)
    }
    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?')
      values.push(updates.avatar)
    }
    if (updates.lastLoginAt !== undefined) {
      fields.push('last_login_at = ?')
      values.push(updates.lastLoginAt)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)

    return this.findUserById(id)
  }

  // 删除用户
  async deleteUser(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // 保存刷新令牌
  async saveRefreshToken(userId, token, expiresAt) {
    const id = crypto.randomUUID()
    const now = Date.now()

    const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(id, userId, token, expiresAt, now)

    // 清理过期令牌
    this._cleanupExpiredTokens(userId)
  }

  // 查找刷新令牌
  async findRefreshToken(userId, token) {
    const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? AND token = ? AND expires_at > ?
    `)

    const row = stmt.get(userId, token, Date.now())

    if (!row) return null

    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    }
  }

  // 撤销单个刷新令牌
  async revokeRefreshToken(userId, token) {
    const stmt = this.db.prepare(`
      DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?
    `)

    stmt.run(userId, token)
  }

  // 撤销用户的所有刷新令牌
  async revokeAllRefreshTokens(userId) {
    const stmt = this.db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?')
    stmt.run(userId)
  }

  // 撤销访问令牌
  async revokeAccessToken(token) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO revoked_tokens (id, token, revoked_at)
      VALUES (?, ?, ?)
    `)

    stmt.run(id, token, now)
  }

  // 检查令牌是否已被撤销
  async isTokenRevoked(token) {
    const stmt = this.db.prepare('SELECT 1 FROM revoked_tokens WHERE token = ?')
    const row = stmt.get(token)
    return row !== undefined
  }

  // 清理过期的刷新令牌
  _cleanupExpiredTokens(userId) {
    const stmt = this.db.prepare(`
      DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at <= ?
    `)

    stmt.run(userId, Date.now())
  }

  // 获取所有用户
  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users')
    const rows = stmt.all()

    return rows.map(
      (row) =>
        new User({
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash,
          name: row.name,
          avatar: row.avatar,
          provider: row.provider,
          role: row.role,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          lastLoginAt: row.last_login_at
        })
    )
  }

  // 获取用户总数
  async getUserCount() {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users')
    const row = stmt.get()
    return row.count
  }

  // 关闭数据库连接（用于优雅关闭）
  close() {
    this.db.close()
  }
}

export const db = new DatabaseService()
