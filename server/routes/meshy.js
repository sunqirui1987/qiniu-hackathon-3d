import express from 'express'
import axios from 'axios'

const router = express.Router()

const MESHY_API_BASE_URL = 'https://api.meshy.ai'
const MESHY_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6InRRdENITW50RExBbHhVWWwiLCJ0eXAiOiJKV1QifQ.eyJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc2MTI5MTY2Nn1dLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJzdWlxaXJ1aTE5ODcyMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc2MTM4MjIzNSwiaWF0IjoxNzYxMzgxMzM1LCJpc19hbm9ueW1vdXMiOmZhbHNlLCJpc3MiOiJodHRwczovL3luZnJlY2xzeGZncW52Z2ZweGNjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJwaG9uZSI6IiIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwic2Vzc2lvbl9pZCI6IjVlMTc3NDcwLWFjYjUtNDMxYS1hMWJkLTM4OGZlMzUyNjU4MSIsInN1YiI6IjY0ODFlMzJjLTBmMWUtNDk4Yi05MWIyLWQyODc0Njc4MTc1ZiIsInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsImVtYWlsIjoic3VpcWlydWkxOTg3MjAwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi5a2Z5YW255GeIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IuWtmeWFtueRniIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tBa3p0UEszUEpZUWgwMWw5Wk1OMVlTWXd2OG82S2g1Z2FTWndWU0FHRFM2eHJwUT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4Iiwic3ViIjoiMTEyNjM4Njg0NTQzNTU5MTIxNDk4In19.xMsEhlIpi211sPbXnJnCvl4Ir7R3_5X6l37novwHRZk'

const meshyClient = axios.create({
  baseURL: MESHY_API_BASE_URL,
  headers: {
    'Authorization': MESHY_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

router.all('/:path*', async (req, res, next) => {
  try {
    const path = req.params.path
    const url = `${req.path.replace('/api/meshy/', '')}`
    
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
    }

    const response = await meshyClient.request(config)
    
    res.status(response.status).json(response.data)
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      next(error)
    }
  }
})

export const meshyRouter = router
