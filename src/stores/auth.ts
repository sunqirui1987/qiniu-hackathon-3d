import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, OAuthProvider } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const loginWithOAuth = (provider: OAuthProvider) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    window.location.href = `${apiBaseUrl}/auth/${provider}`
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  const init = () => {
    if (token.value) {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Failed to parse stored user:', e)
          logout()
        }
      }
    }
  }

  const saveUser = (newUser: User) => {
    user.value = newUser
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    loginWithOAuth,
    setToken,
    setUser,
    saveUser,
    logout,
    init
  }
})
