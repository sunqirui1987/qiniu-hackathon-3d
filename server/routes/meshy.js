import express from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
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

// 缓存目录设置
const CACHE_DIR = path.join(process.cwd(), 'cache', 'assets')
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000 // 24小时

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  console.log('[Meshy] Created cache directory:', CACHE_DIR)
}

// 生成缓存文件名
const generateCacheFileName = (url) => {
  const hash = crypto.createHash('md5').update(url).digest('hex')
  const urlObj = new URL(url)
  const extension = path.extname(urlObj.pathname) || '.bin'
  return `${hash}${extension}`
}

// 检查缓存文件是否存在且有效
const isCacheValid = (filePath) => {
  if (!fs.existsSync(filePath)) return false
  const stats = fs.statSync(filePath)
  const age = Date.now() - stats.mtime.getTime()
  return age < CACHE_MAX_AGE
}

// 配置常量
const CONFIG = {
  DOWNLOAD_TIMEOUT: 60000,
  CACHE_CONTROL_MAX_AGE: 86400, // 24小时
  SERVER_BASE_URL: 'http://localhost:3001',
  ALLOWED_DOMAINS: ['meshy.ai', 'amazonaws.com'],
  SUPPORTED_EXTENSIONS: ['.glb', '.gltf', '.fbx', '.obj', '.stl'],
  CONTENT_TYPES: {
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.fbx': 'application/octet-stream',
    '.obj': 'model/obj',
    '.stl': 'application/sla'
  }
}

// 辅助函数：验证URL是否为允许的域名
const isAllowedDomain = (hostname) => {
  return CONFIG.ALLOWED_DOMAINS.some(domain => hostname.includes(domain))
}

// 辅助函数：验证文件类型
const isValidModelFile = (contentType, url) => {
  if (!contentType && !url) return false
  
  const typeChecks = [
    contentType?.includes('application/octet-stream'),
    contentType?.includes('model/'),
    contentType?.includes('application/gltf'),
    ...CONFIG.SUPPORTED_EXTENSIONS.map(ext => url?.toLowerCase().includes(ext))
  ]
  
  return typeChecks.some(Boolean)
}

// 辅助函数：构建成功响应
const buildSuccessResponse = (cachedUrl, originalUrl, cached, message) => ({
  success: true,
  cachedUrl,
  originalUrl,
  cached,
  message
})

// 辅助函数：构建错误响应
const buildErrorResponse = (error, originalUrl = null) => {
  const response = { error }
  if (originalUrl) response.originalUrl = originalUrl
  return response
}

// 辅助函数：安全的文件流处理
const saveFileStream = (response, filePath) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath)
    
    writeStream.on('error', (error) => {
      console.error('[Meshy] Write stream error:', error)
      // 清理可能的部分文件
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (cleanupError) {
          console.error('[Meshy] Failed to cleanup partial file:', cleanupError)
        }
      }
      reject(error)
    })
    
    writeStream.on('finish', () => {
      console.log('[Meshy] File saved successfully:', filePath)
      resolve()
    })
    
    response.data.pipe(writeStream)
  })
}

// 专门处理 Meshy 资源文件的代理路由（如 .glb, .fbx 等 3D 模型文件）
// 不需要授权，因为这是公开的资源代理
router.get('/proxy-asset', async (req, res, next) => {
  const { url } = req.query
  
  // 参数验证
  if (!url) {
    return res.status(400).json(buildErrorResponse('Missing url parameter'))
  }

  console.log('[Meshy] Caching asset request:', url)
  
  try {
    // URL格式验证
    let targetUrl
    try {
      targetUrl = new URL(url)
    } catch (urlError) {
      console.error('[Meshy] Invalid URL format:', url, urlError.message)
      return res.status(400).json(buildErrorResponse('Invalid URL format'))
    }

    // 域名安全验证
    if (!isAllowedDomain(targetUrl.hostname)) {
      console.error('[Meshy] Unauthorized domain:', targetUrl.hostname)
      return res.status(403).json(buildErrorResponse('Unauthorized domain'))
    }
    
    // 生成缓存文件路径
    const cacheFileName = generateCacheFileName(url)
    const cacheFilePath = path.join(CACHE_DIR, cacheFileName)
    
    // 检查缓存
    if (isCacheValid(cacheFilePath)) {
      console.log('[Meshy] Serving from cache:', cacheFileName)
      const cachedUrl = `${CONFIG.SERVER_BASE_URL}/api/meshy/proxy-asset/${cacheFileName}`
      return res.json(buildSuccessResponse(
        cachedUrl,
        url,
        true,
        'Asset served from cache'
      ))
    }
    
    console.log('[Meshy] Downloading and caching asset:', url)
    
    // 下载文件
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: CONFIG.DOWNLOAD_TIMEOUT,
      validateStatus: (status) => status < 400,
    })
    
    // 内容类型验证
    const contentType = response.headers['content-type']
    if (!isValidModelFile(contentType, url)) {
      console.error('[Meshy] Invalid content type for 3D model:', contentType)
      return res.status(415).json(buildErrorResponse('Unsupported media type for 3D model'))
    }
    
    // 保存文件到缓存
    await saveFileStream(response, cacheFilePath)
    
    console.log('[Meshy] Asset cached successfully:', cacheFileName)
    
    // 返回缓存URL
    const cachedUrl = `${CONFIG.SERVER_BASE_URL}/api/meshy/proxy-asset/${cacheFileName}`
    res.json(buildSuccessResponse(
      cachedUrl,
      url,
      false,
      'Asset downloaded and cached successfully'
    ))
    
  } catch (error) {
    console.error('[Meshy] Asset caching failed:', error.message)
    
    // 统一错误处理
    if (error.response) {
      const statusCode = error.response.status
      console.error('[Meshy] Asset error status:', statusCode)
      res.status(statusCode).json(buildErrorResponse(
        `Failed to fetch 3D model: HTTP ${statusCode}`,
        url
      ))
    } else if (error.code === 'ECONNABORTED') {
      console.error('[Meshy] Asset request timeout')
      res.status(408).json(buildErrorResponse(
        'Request timeout while fetching 3D model',
        url
      ))
    } else {
      console.error('[Meshy] Asset network error:', error)
      res.status(500).json(buildErrorResponse(
        'Network error while fetching 3D model',
        url
      ))
    }
  }
})

// 提供缓存文件的路由
router.get('/proxy-asset/:filename', (req, res, next) => {
  const { filename } = req.params
  const filePath = path.join(CACHE_DIR, filename)
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error('[Meshy] Cached file not found:', filename)
      return res.status(404).json(buildErrorResponse('Cached file not found'))
    }
    
    // 检查缓存是否仍然有效
    if (!isCacheValid(filePath)) {
      console.log('[Meshy] Cached file expired, removing:', filename)
      try {
        fs.unlinkSync(filePath)
      } catch (unlinkError) {
        console.error('[Meshy] Failed to remove expired cache file:', unlinkError)
      }
      return res.status(410).json(buildErrorResponse('Cached file expired'))
    }
    
    console.log('[Meshy] Serving cached file:', filename)
    
    // 获取文件扩展名和对应的Content-Type
    const ext = path.extname(filename).toLowerCase()
    const contentType = CONFIG.CONTENT_TYPES[ext] || 'application/octet-stream'
    
    // 设置响应头
    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': `public, max-age=${CONFIG.CACHE_CONTROL_MAX_AGE}`,
    })
    
    // 发送文件
    res.sendFile(filePath, (error) => {
      if (error) {
        console.error('[Meshy] Error sending cached file:', error)
        if (!res.headersSent) {
          res.status(500).json(buildErrorResponse('Failed to serve cached file'))
        }
      }
    })
    
  } catch (error) {
    console.error('[Meshy] Unexpected error in cached asset route:', error)
    if (!res.headersSent) {
      res.status(500).json(buildErrorResponse('Internal server error'))
    }
  }
})


// 获取所有任务的聚合接口
router.get('/tasks/all', async (req, res, next) => {
  console.log('[Meshy] Getting all tasks list')
  
  try {
    const { page_size = 100 } = req.query
    const pageSize = Math.floor(parseInt(page_size) / 4) || 3 // 平均分配给四种任务类型
    
    console.log('[Meshy] Requesting all task types with page_size:', pageSize)
    
    // 并发请求所有四种任务类型
    const [textTo3dResponse, imageTo3dResponse, remeshResponse, retextureResponse] = await Promise.allSettled([
      meshyClient.get('/openapi/v2/text-to-3d', { params: { page_size: pageSize } }),
      meshyClient.get('/openapi/v1/image-to-3d', { params: { page_size: pageSize } }),
      meshyClient.get('/openapi/v1/remesh', { params: { page_size: pageSize } }),
      meshyClient.get('/openapi/v1/retexture', { params: { page_size: pageSize } })
    ])
    
    const allTasks = []
    
    // 处理 text-to-3d 任务
    if (textTo3dResponse.status === 'fulfilled') {
      const textTo3dTasks = textTo3dResponse.value.data.map(task => ({
        ...task,
        hasTexture: task.texture_urls && task.texture_urls.length > 0,
        taskType: 'text-to-3d'
      }))
      allTasks.push(...textTo3dTasks)
      console.log('[Meshy] Added', textTo3dTasks.length, 'text-to-3d tasks')
    } else {
      console.error('[Meshy] Failed to get text-to-3d tasks:', textTo3dResponse.reason?.message)
    }
    
    // 处理 image-to-3d 任务
    if (imageTo3dResponse.status === 'fulfilled') {
      const imageTo3dTasks = imageTo3dResponse.value.data.map(task => ({
        ...task,
        hasTexture: task.texture_urls && task.texture_urls.length > 0,
        taskType: 'image-to-3d'
      }))
      allTasks.push(...imageTo3dTasks)
      console.log('[Meshy] Added', imageTo3dTasks.length, 'image-to-3d tasks')
    } else {
      console.error('[Meshy] Failed to get image-to-3d tasks:', imageTo3dResponse.reason?.message)
    }
    
    // 处理 remesh 任务
    if (remeshResponse.status === 'fulfilled') {
      const remeshTasks = remeshResponse.value.data.map(task => ({
        ...task,
        hasTexture: false,
        taskType: 'remesh'
      }))
      allTasks.push(...remeshTasks)
      console.log('[Meshy] Added', remeshTasks.length, 'remesh tasks')
    } else {
      console.error('[Meshy] Failed to get remesh tasks:', remeshResponse.reason?.message)
    }
    
    // 处理 retexture 任务
    if (retextureResponse.status === 'fulfilled') {
      const retextureTasks = retextureResponse.value.data.map(task => ({
        ...task,
        hasTexture: task.texture_urls && task.texture_urls.length > 0,
        taskType: 'retexture'
      }))
      allTasks.push(...retextureTasks)
      console.log('[Meshy] Added', retextureTasks.length, 'retexture tasks')
    } else {
      console.error('[Meshy] Failed to get retexture tasks:', retextureResponse.reason?.message)
    }
    
    // 按创建时间排序（最新的在前）
    allTasks.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return timeB - timeA
    })
    
    // 限制返回数量
    const limitedTasks = allTasks.slice(0, parseInt(page_size))
    
    console.log('[Meshy] Returning', limitedTasks.length, 'total tasks')
    
    res.json({
      tasks: limitedTasks,
      total: limitedTasks.length,
      summary: {
        textTo3d: allTasks.filter(t => t.taskType === 'text-to-3d').length,
        imageTo3d: allTasks.filter(t => t.taskType === 'image-to-3d').length,
        remesh: allTasks.filter(t => t.taskType === 'remesh').length,
        retexture: allTasks.filter(t => t.taskType === 'retexture').length,
        withTexture: allTasks.filter(t => t.hasTexture).length,
        withoutTexture: allTasks.filter(t => !t.hasTexture).length
      }
    })
  } catch (error) {
    console.error('[Meshy] Failed to get all tasks:', error.message)
    next(error)
  }
})

// 通用代理路由 - 处理所有其他请求
router.use(requireAuth)
router.use(async (req, res, next) => {
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
