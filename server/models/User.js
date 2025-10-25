/**
 * 用户模型
 * 
 * 表示系统中的用户
 * 这是一个简单的数据模型，可与任何数据库后端配合使用
 */

// 用户类定义
export class User {
  constructor(data) {
    this.id = data.id
    this.email = data.email
    this.passwordHash = data.passwordHash
    this.name = data.name
    this.avatar = data.avatar || null
    this.provider = data.provider || 'local'
    this.role = data.role || 'user'
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
    this.lastLoginAt = data.lastLoginAt || null
  }
  
  // 转换为 JSON 格式（移除密码哈希）
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this
    return userWithoutPassword
  }
  
  // 转换为公开用户信息（仅包含安全字段）
  toPublic() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      provider: this.provider,
      role: this.role,
      createdAt: this.createdAt
    }
  }
}
