import express from 'express'
import axios from 'axios'
import { requireAuth } from '../middleware/security.js'

const router = express.Router()

const MESHY_API_BASE_URL = 'https://api.meshy.ai'
const MESHY_AUTH_TOKEN = 'Bearer msy_ROxBXrmi8W12joOx9wvtUdCR3NdCucihq6VW'

console.log('[Meshy] Initializing Meshy API proxy routes')
console.log('[Meshy] API Base URL:', MESHY_API_BASE_URL)

const meshyClient = axios.create({
  baseURL: MESHY_API_BASE_URL,
  headers: {
    'Authorization': MESHY_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

console.log('[Meshy] Meshy API client initialized')

// 专门处理 Meshy 资源文件的代理路由（如 .glb, .fbx 等 3D 模型文件）
// 不需要授权，因为这是公开的资源代理
router.get('/proxy-asset', async (req, res, next) => {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  console.log('[Meshy] Proxying asset request:', url)
  
  try {
    // 直接使用 axios 请求资源文件，不使用 meshyClient（因为资源 URL 是完整的）
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 60000, // 增加超时时间，因为 3D 文件可能比较大
    })
    
    // 设置正确的响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      'Content-Length': response.headers['content-length'],
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    console.log('[Meshy] Asset response headers:', {
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length']
    })
    
    // 将文件流直接传输给客户端
    response.data.pipe(res)
    
  } catch (error) {
    console.error('[Meshy] Asset proxy request failed:', error.message)
    
    if (error.response) {
      console.error('[Meshy] Asset error status:', error.response.status)
      res.status(error.response.status).json({ error: 'Failed to fetch asset' })
    } else {
      console.error('[Meshy] Asset network error:', error)
      res.status(500).json({ error: 'Network error while fetching asset' })
    }
  }
})

router.all('/*', requireAuth, async (req, res, next) => {
  console.log('[Meshy] Proxying request:', req.method, req.originalUrl)
  console.log('[Meshy] Request path:', req.path)
  console.log('[Meshy] Query params:', req.query)
  console.log('[Meshy] Content-Type:', req.headers['content-type'])
  
  try {
    const url = req.path
    console.log('[Meshy] Forwarding to Meshy API URL:', url)
    
    const config = {
      method: req.method,
      url: url,
      params: req.query,
      headers: {
        'Authorization': MESHY_AUTH_TOKEN,
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    }

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      config.data = req.body
      console.log('[Meshy] Request body:', JSON.stringify(req.body, null, 2))
    }

    console.log('[Meshy] Sending request to Meshy API...')
    console.log('[Meshy] Config:', {
      method: config.method,
      url: config.url,
      params: config.params,
      headers: {
        ...config.headers,
        'Authorization': config.headers.Authorization ? 'Bearer msy_***' : 'Not set'
      },
      data: config.data ? 'Request body included' : 'No body'
    })

    const response = await meshyClient.request(config)
    
    console.log('[Meshy] Meshy API response status:', response.status)
    console.log('[Meshy] Meshy API response data:', JSON.stringify(response.data, null, 2))
    
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('[Meshy] Proxy request failed:', error.message)
    
    if (error.response) {
      console.error('[Meshy] Meshy API error status:', error.response.status)
      console.error('[Meshy] Meshy API error data:', JSON.stringify(error.response.data, null, 2))
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error('[Meshy] Network or system error:', error)
      next(error)
    }
  }
})

export const meshyRouter = router

console.log('[Meshy] Meshy API proxy router exported')
