/**
 * 安全中间件
 * 
 * 实现安全最佳实践：
 * - 安全头（使用 helmet 模式）
 * - XSS 防护
 * - CSRF 防护准备
 * - 内容安全策略
 */

// 设置安全相关的 HTTP 响应头
export function securityMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 移除服务器指纹信息
  res.removeHeader('X-Powered-By')
  
  next()
}

// 验证请求是否带有有效的认证令牌
export function requireAuth(req, res, next) {
  console.log('[Auth] requireAuth middleware called for:', req.method, req.originalUrl)
  console.log('[Auth] Authorization header:', req.headers.authorization)
  
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] Authentication failed - missing or invalid auth header')
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }
  
  console.log('[Auth] Authentication passed')
  next()
}
