import express from 'express'
import axios from 'axios'
import { requireAuth } from '../middleware/security.js'

const router = express.Router()

const MESHY_API_BASE_URL = 'https://api.meshy.ai'
const MESHY_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6InRRdENITW50RExBbHhVWWwiLCJ0eXAiOiJKV1QifQ.eyJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc2MTI5MTY2Nn1dLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJzdWlxaXJ1aTE5ODcyMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc2MTM4MjIzNSwiaWF0IjoxNzYxMzgxMzM1LCJpc19hbm9ueW1vdXMiOmZhbHNlLCJpc3MiOiJodHRwczovL3luZnJlY2xzeGZncW52Z2ZweGNjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJwaG9uZSI6IiIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwic2Vzc2lvbl9pZCI6IjVlMTc3NDcwLWFjYjUtNDMxYS1hMWJkLTM4OGZlMzUyNjU4MSIsInN1YiI6IjY0ODFlMzJjLTBmMWUtNDk4Yi05MWIyLWQyODc0Njc4MTc1ZiIsInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsImVtYWlsIjoic3VpcWlydWkxOTg3MjAwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi5a2Z5YW255GeIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IuWtmeWFtueRniIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4Iiwic3ViIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4In19.xMsEhlIpi211sPbXnJnCvl4Ir7R3_5X6l37novwHRZk'

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
        'Authorization': '[HIDDEN]'
      }
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
