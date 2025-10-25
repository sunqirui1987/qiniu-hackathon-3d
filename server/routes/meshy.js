/**
 * Meshy API 代理路由
 * 
 * 功能说明：
 * - 代理前端请求到 Meshy AI API
 * - 添加认证中间件保护 API 访问
 * - 使用硬编码的 Meshy API Token 进行后端认证
 * - 支持所有 HTTP 方法的代理转发
 */

import express from 'express'
import axios from 'axios'
import { requireAuth } from '../middleware/security.js'

const router = express.Router()

// Meshy AI API 基础配置
const MESHY_API_BASE_URL = 'https://api.meshy.ai'
// 硬编码的 Meshy API 认证令牌（生产环境应从环境变量读取）
//const MESHY_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6InRRdENITW50RExBbHhVWWwiLCJ0eXAiOiJKV1QifQ.eyJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc2MTI5MTY2Nn1dLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJzdWlxaXJ1aTE5ODcyMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc2MTM4MjIzNSwiaWF0IjoxNzYxMzgxMzM1LCJpc19hbm9ueW1vdXMiOmZhbHNlLCJpc3MiOiJodHRwczovL3luZnJlY2xzeGZncW52Z2ZweGNjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJwaG9uZSI6IiIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwic2Vzc2lvbl9pZCI6IjVlMTc3NDcwLWFjYjUtNDMxYS1hMWJkLTM4OGZlMzUyNjU4MSIsInN1YiI6IjY0ODFlMzJjLTBmMWUtNDk4Yi05MWIyLWQyODc0Njc4MTc1ZiIsInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsImVtYWlsIjoic3VpcWlydWkxOTg3MjAwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi5a2Z5YW255GeIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IuWtmeWFtueRniIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4Iiwic3ViIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4In19.xMsEhlIpi211sPbXnJnCvl4Ir7R3_5X6l37novwHRZk'
const MESHY_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6InRRdENITW50RExBbHhVWWwiLCJ0eXAiOiJKV1QifQ.eyJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc2MTI5MTY2Nn1dLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJzdWlxaXJ1aTE5ODcyMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc2MTM4MjIzNSwiaWF0IjoxNzYxMzgxMzM1LCJpc19hbm9ueW1vdXMiOmZhbHNlLCJpc3MiOiJodHRwczovL3luZnJlY2xzeGZncW52Z2ZweGNjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJwaG9uZSI6IiIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwic2Vzc2lvbl9pZCI6IjVlMTc3NDcwLWFjYjUtNDMxYS1hMWJkLTM4OGZlMzUyNjU4MSIsInN1YiI6IjY0ODFlMzJjLTBmMWUtNDk4Yi05MWIyLWQyODc0Njc4MTc1ZiIsInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsImVtYWlsIjoic3VpcWlydWkxOTg3MjAwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi5a2Z5YW255GeIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IuWtmeWFtueRniIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4Iiwic3ViIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4In19.xMsEhlIpi211sPbXnJnCvl4Ir7R3_5X6l37novwHRZk'

console.log('[Meshy] 初始化 Meshy API 代理路由')
console.log('[Meshy] API 基础地址:', MESHY_API_BASE_URL)

// 创建 Meshy API 客户端
const meshyClient = axios.create({
  baseURL: MESHY_API_BASE_URL,
  headers: {
    'Authorization': MESHY_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒超时
})

console.log('[Meshy] Meshy API 客户端创建完成')

// 代理所有请求到 Meshy API，需要通过认证中间件
router.all('/*', requireAuth, async (req, res, next) => {
  console.log('[Meshy] 收到代理请求:', req.method, req.originalUrl)
  console.log('[Meshy] 请求路径:', req.path)
  console.log('[Meshy] 查询参数:', req.query)
  console.log('[Meshy] 请求头 Content-Type:', req.headers['content-type'])
  
  try {
    // 构建转发到 Meshy API 的 URL
    const url = req.path
    console.log('[Meshy] 转发到 Meshy API 的 URL:', url)
    
    // 配置代理请求
    const config = {
      method: req.method,
      url: url,
      params: req.query,
      headers: {
        'Authorization': MESHY_AUTH_TOKEN, // 使用服务端的 Meshy API Token
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    }

    // 对于有请求体的方法，添加请求数据
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      config.data = req.body
      console.log('[Meshy] 请求体数据:', JSON.stringify(req.body, null, 2))
    }

    console.log('[Meshy] 发送请求到 Meshy API...')
    console.log('[Meshy] 请求配置:', {
      method: config.method,
      url: config.url,
      params: config.params,
      headers: {
        ...config.headers,
        'Authorization': '[HIDDEN]' // 隐藏敏感信息
      }
    })

    // 发送请求到 Meshy API
    const response = await meshyClient.request(config)
    
    console.log('[Meshy] Meshy API 响应状态:', response.status)
    console.log('[Meshy] Meshy API 响应数据:', JSON.stringify(response.data, null, 2))
    
    // 返回 Meshy API 的响应
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('[Meshy] 代理请求失败:', error.message)
    
    if (error.response) {
      // Meshy API 返回的错误
      console.error('[Meshy] Meshy API 错误状态:', error.response.status)
      console.error('[Meshy] Meshy API 错误数据:', JSON.stringify(error.response.data, null, 2))
      res.status(error.response.status).json(error.response.data)
    } else {
      // 网络或其他错误
      console.error('[Meshy] 网络或系统错误:', error)
      next(error)
    }
  }
})

// 导出 Meshy API 代理路由器
export const meshyRouter = router

console.log('[Meshy] Meshy API 代理路由器导出完成')
