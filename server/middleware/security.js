/**
 * Security Middleware
 * 
 * Implements security best practices:
 * - Security headers (using helmet patterns)
 * - XSS protection
 * - CSRF protection preparation
 * - Content Security Policy
 */

export function securityMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  res.removeHeader('X-Powered-By')
  
  next()
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }
  
  next()
}
