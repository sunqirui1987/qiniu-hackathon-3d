/**
 * 认证路由
 * 
 * 定义所有认证相关的端点
 */

import express from 'express'
import { authService } from '../services/authService.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { requireAuth } from '../middleware/security.js'

const router = express.Router()

// 用户注册端点
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    const result = await authService.register({ email, password, name })
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 用户登录端点
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    const result = await authService.login({ email, password })
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 验证令牌端点
router.post('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }
    
    const verification = verifyAccessToken(token)
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: verification.error
      })
    }
    
    await authService.verifyToken(token)
    
    res.json({
      success: true,
      valid: true,
      data: {
        userId: verification.decoded.userId,
        email: verification.decoded.email
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取用户信息端点
router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader.replace('Bearer ', '')
    
    const verification = verifyAccessToken(token)
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
    
    const user = await authService.getUserById(verification.decoded.userId)
    
    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    next(error)
  }
})

// 用户登出端点
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader.replace('Bearer ', '')
    
    const verification = verifyAccessToken(token)
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
    
    await authService.logout(verification.decoded.userId, token)
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
})

// 刷新访问令牌端点
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      })
    }
    
    const result = await authService.refreshAccessToken(refreshToken)
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 修改密码端点
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader.replace('Bearer ', '')
    
    const verification = verifyAccessToken(token)
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
    
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      })
    }
    
    await authService.changePassword(
      verification.decoded.userId,
      currentPassword,
      newPassword
    )
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
})

export const authRouter = router
