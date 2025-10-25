/**
 * User Model
 * 
 * Represents a user in the system
 * This is a simple data model that works with any database backend
 */

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
  
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this
    return userWithoutPassword
  }
  
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
