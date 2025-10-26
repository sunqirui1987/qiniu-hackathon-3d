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

    console.log(`[OAuth Debug] 开始交换 ${provider} code 为 access token`)
    console.log(`[OAuth Debug] Token URL: ${config.tokenUrl}`)
    console.log(`[OAuth Debug] Client ID: ${config.clientId}`)
    console.log(`[OAuth Debug] Redirect URI: ${config.redirectUri}`)
    console.log(`[OAuth Debug] Code: ${code}`)

    const requestBody = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    }

    console.log(`[OAuth Debug] Request Body:`, JSON.stringify(requestBody, null, 2))

    let lastError = null

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log(`[OAuth Debug] Token Response Status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()

        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (parseError) {
          console.error(`[OAuth Debug] 无法解析错误响应为JSON:`, parseError.message)
        }

        throw new Error(
          errorData.error_description || errorData.error || `HTTP ${response.status}: ${errorText}`
        )
      }

      const responseText = await response.text()

      let data = {}
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error('Token响应格式错误')
      }

      console.log(`[OAuth Debug] Token Response Data:`, JSON.stringify(data, null, 2))

      if (!data.access_token) {
        throw new Error('响应中缺少 access_token')
      }

      return data.access_token
    } catch (error) {
      lastError = error

      // 如果是网络错误，提供更详细的信息
      if (
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message.includes('fetch failed')
      ) {
        console.error(`[OAuth Debug] 网络连接错误，可能的原因:`)
        console.error(`[OAuth Debug] 1. 网络连接问题`)
        console.error(`[OAuth Debug] 2. GitHub API 不可访问`)
        console.error(`[OAuth Debug] 3. 防火墙或代理设置`)
        console.error(`[OAuth Debug] 4. DNS 解析问题`)
      }
    }

    throw new Error('OAuth 授权失败')
  },

  async getUserInfo(provider, accessToken) {
    const config = getOAuthConfig(provider)

    try {
      const response = await fetch(config.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error('获取用户信息失败')
      }

      const rawData = await response.json()
      console.log(`[OAuth Debug] Raw User Data:`, JSON.stringify(rawData, null, 2))

      // 对于GitHub，如果邮箱为空，尝试从 /user/emails 获取
      if (provider === 'github' && !rawData.email) {
        try {
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json'
            }
          })

          console.log(`[OAuth Debug] Emails Response Status: ${emailResponse.status}`)
          console.log(
            `[OAuth Debug] Emails Response Headers:`,
            Object.fromEntries(emailResponse.headers.entries())
          )

          if (emailResponse.ok) {
            const emails = await emailResponse.json()
            console.log(`[OAuth Debug] User Emails:`, JSON.stringify(emails, null, 2))

            // 查找主邮箱
            const primaryEmail = emails.find((email) => email.primary && email.verified)
            if (primaryEmail) {
              console.log(`[OAuth Debug] 找到主邮箱: ${primaryEmail.email}`)
              rawData.email = primaryEmail.email
            } else {
              console.log(`[OAuth Debug] 未找到主邮箱，查找第一个验证邮箱`)
              const verifiedEmail = emails.find((email) => email.verified)
              if (verifiedEmail) {
                console.log(`[OAuth Debug] 使用验证邮箱: ${verifiedEmail.email}`)
                rawData.email = verifiedEmail.email
              }
            }
          } else {
            const emailErrorText = await emailResponse.text()
            console.error(`[OAuth Debug] Emails Error Response:`, emailErrorText)
          }
        } catch (emailError) {
          console.error(`[OAuth Debug] GitHub 获取邮箱失败:`, emailError.message)
          console.error(`[OAuth Debug] Email Error Stack:`, emailError.stack)
          // 继续使用原有的占位符逻辑
        }
      }

      const normalizedData = this.normalizeUserInfo(provider, rawData, accessToken)
      console.log(`[OAuth Debug] Normalized User Data:`, JSON.stringify(normalizedData, null, 2))

      return normalizedData
    } catch (error) {
      console.error(`[OAuth Debug] ${provider} 获取用户信息失败:`, error.message)
      console.error(`[OAuth Debug] Error Stack:`, error.stack)
      throw new Error('获取用户信息失败')
    }
  },

  normalizeUserInfo(provider, rawData, accessToken = null) {
    switch (provider) {
      case 'github':
        if (!rawData.email) {
          throw new Error('GitHub用户必须有邮箱才能登录')
        }

        console.log(`[OAuth Debug] 使用 GitHub 真实邮箱: ${rawData.email}`)

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
