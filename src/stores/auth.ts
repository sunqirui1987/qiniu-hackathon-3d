import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, OAuthProvider } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const clearError = () => {
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
    loading.value = false
  }

  const loginWithOAuth = async (provider: OAuthProvider) => {
    try {
      loading.value = true
      clearError()
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      
      // 获取当前URL的redirect参数
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      
      // 构建OAuth URL，包含redirect参数
      let oauthUrl = `${apiBaseUrl}/auth/${provider}`
      if (redirect) {
        oauthUrl += `?redirect=${encodeURIComponent(redirect)}`
      }
      
      // 重定向到OAuth提供商
      window.location.href = oauthUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      setError(message)
      throw err
    }
  }

  const setTokens = (accessToken: string, refreshTokenValue?: string) => {
    token.value = accessToken
    localStorage.setItem('auth_token', accessToken)
    
    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      localStorage.setItem('refresh_token', refreshTokenValue)
    }
  }

  const setUser = (newUser: User) => {
    user.value = newUser
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  const logout = async () => {
    try {
      loading.value = true
      
      // 如果有token，尝试调用后端登出接口
      if (token.value) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        try {
          await fetch(`${apiBaseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (err) {
          console.warn('Failed to logout from server:', err)
        }
      }
    } finally {
      // 清除本地状态
      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null
      
      // 清除localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
      
      loading.value = false
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshToken.value
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      setTokens(data.accessToken, data.refreshToken)
      
      return data.accessToken
    } catch (err) {
      // 刷新失败，清除所有认证信息
      await logout()
      throw err
    }
  }

  const verifyToken = async () => {
    if (!token.value) {
      return false
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return true
      } else if (response.status === 401 && refreshToken.value) {
        // Token过期，尝试刷新
        try {
          await refreshAccessToken()
          return true
        } catch {
          return false
        }
      }
      
      return false
    } catch {
      return false
    }
  }

  const fetchUserInfo = async () => {
    if (!token.value) {
      throw new Error('No access token')
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401 && refreshToken.value) {
          // Token过期，尝试刷新后重试
          await refreshAccessToken()
          return fetchUserInfo()
        }
        throw new Error('Failed to fetch user info')
      }

      const data = await response.json()
      setUser(data.data.user)
      return data.data.user
    } catch (err) {
      console.error('Failed to fetch user info:', err)
      throw err
    }
  }

  const init = async () => {
    try {
      loading.value = true
      
      // 检查本地存储的用户信息
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser && token.value) {
        try {
          const parsedUser = JSON.parse(storedUser)
          user.value = parsedUser
          
          // 验证token是否仍然有效
          const isValid = await verifyToken()
          if (!isValid) {
            await logout()
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e)
          await logout()
        }
      } else if (token.value) {
        // 有token但没有用户信息，尝试获取
        try {
          await fetchUserInfo()
        } catch {
          await logout()
        }
      }
    } catch (err) {
      console.error('Auth initialization failed:', err)
      await logout()
    } finally {
      loading.value = false
    }
  }

  // 处理OAuth回调
  const handleOAuthCallback = async (accessToken: string, refreshTokenValue: string, userInfo: User) => {
    try {
      loading.value = true
      clearError()
      
      setTokens(accessToken, refreshTokenValue)
      setUser(userInfo)
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth回调处理失败'
      setError(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    
    // Actions
    loginWithOAuth,
    logout,
    init,
    clearError,
    setError,
    setTokens,
    setUser,
    refreshAccessToken,
    verifyToken,
    fetchUserInfo,
    handleOAuthCallback
  }
})
