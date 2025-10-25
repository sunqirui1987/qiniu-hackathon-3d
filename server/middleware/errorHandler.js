/**
 * Global Error Handler Middleware
 * 
 * Centralized error handling with proper logging and response formatting
 */

export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] Request ID: ${req.id}`)
  console.error(`[ERROR] ${err.stack}`)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details || err.message
    })
  }
  
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    })
  }
  
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}
