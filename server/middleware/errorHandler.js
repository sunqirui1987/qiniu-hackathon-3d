/**
 * 全局错误处理中间件
 * 
 * 集中式错误处理，包含适当的日志记录和响应格式化
 */

// 全局错误处理函数
export function errorHandler(err, req, res, next) {
  // 记录错误信息
  console.error(`[ERROR] Request ID: ${req.id}`)
  console.error(`[ERROR] ${err.stack}`)
  
  // 处理验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details || err.message
    })
  }
  
  // 处理未授权和 JWT 错误
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
  
  // 处理令牌过期错误
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    })
  }
  
  // 处理其他错误
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 自定义应用错误类
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}
