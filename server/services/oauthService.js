/**
 * OAuth 服务
 * 
 * 处理 OAuth 授权流程
 */

import crypto from 'crypto'
import { getOAuthConfig } from '../config/oauth.js'

const stateStore = new Map()

const OAUTH_STATE_TTL = 10 * 60 * 1000

export const oauthService = {
  generateAuthorizationUrl(provider) {
    const config = getOAuthConfig(provider)
    
    const state = crypto.randomBytes(16).toString('hex')
    stateStore.set(state, { timestamp: Date.now(), provider })
    
    this.cleanupExpiredStates()
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: Array.isArray(config.scope) ? config.scope.join(' ') : config.scope,
      state,
      response_type: 'code'
    })
    
    return {
      url: `${config.authorizationUrl}?${params.toString()}`,
      state
    }
  },
  
  verifyState(state, provider) {
    const storedData = stateStore.get(state)
    
    if (!storedData) {
      return { valid: false, error: '无效的 state 参数' }
    }
    
    if (storedData.provider !== provider) {
      return { valid: false, error: 'provider 不匹配' }
    }
    
    const now = Date.now()
    if (now - storedData.timestamp > OAUTH_STATE_TTL) {
      stateStore.delete(state)
      return { valid: false, error: 'state 已过期' }
    }
    
    stateStore.delete(state)
    return { valid: true }
  },
  
  async exchangeCodeForToken(provider, code) {
    const config = getOAuthConfig(provider)
    
    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error_description || '获取 access token 失败')
      }
      
      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error(`[OAuth] ${provider} token exchange 失败:`, error.message)
      throw new Error('OAuth 授权失败')
    }
  },
  
  async getUserInfo(provider, accessToken) {
    const config = getOAuthConfig(provider)
    
    try {
      const response = await fetch(config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }
      
      const rawData = await response.json()
      return this.normalizeUserInfo(provider, rawData)
    } catch (error) {
      console.error(`[OAuth] ${provider} 获取用户信息失败:`, error.message)
      throw new Error('获取用户信息失败')
    }
  },
  
  normalizeUserInfo(provider, rawData) {
    switch (provider) {
      case 'github':
        return {
          providerId: String(rawData.id),
          provider: 'github',
          email: rawData.email,
          name: rawData.name || rawData.login,
          avatar: rawData.avatar_url,
          rawData
        }
      
      case 'google':
        return {
          providerId: rawData.id,
          provider: 'google',
          email: rawData.email,
          name: rawData.name,
          avatar: rawData.picture,
          rawData
        }
      
      default:
        throw new Error(`不支持的提供商: ${provider}`)
    }
  },
  
  cleanupExpiredStates() {
    const now = Date.now()
    for (const [key, value] of stateStore.entries()) {
      if (now - value.timestamp > OAUTH_STATE_TTL) {
        stateStore.delete(key)
      }
    }
  }
}
