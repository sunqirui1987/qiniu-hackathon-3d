/**
 * Input Validation Utilities
 * 
 * Validates and sanitizes user inputs
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' }
  }
  
  return { valid: true }
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }
  
  return { valid: true }
}

export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' }
  }
  
  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' }
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'Name is too long' }
  }
  
  return { valid: true }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '')
}
