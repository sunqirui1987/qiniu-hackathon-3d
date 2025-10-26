<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center max-w-md mx-auto px-4">
      <div
        v-if="loading"
        class="space-y-6"
      >
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
          <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            正在登录
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            请稍候，我们正在验证您的身份...
          </p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="space-y-6"
      >
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            登录失败
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ error }}
          </p>
          <button 
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            @click="router.push('/login')"
          >
            返回登录页
          </button>
        </div>
      </div>

      <div
        v-else-if="success"
        class="space-y-6"
      >
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            登录成功
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            正在跳转到应用...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    // 检查是否是GitHub OAuth回调（从前端路由接收）
    const code = route.query.code as string
    const state = route.query.state as string
    const errorParam = route.query.error as string
    
    if (code && state) {
      // 这是从GitHub直接回调到前端的情况
      // 需要将code和state转发到后端处理
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001'
      const backendCallbackUrl = `${apiBaseUrl}/api/auth/github/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
      
      // 重定向到后端处理OAuth回调
      window.location.href = backendCallbackUrl
      return
    }
    
    // 原有的处理逻辑（从后端重定向回来的情况）
    const token = route.query.token as string
    const refreshToken = route.query.refreshToken as string
    const userData = route.query.user as string
    const errorMsg = route.query.error as string

    if (errorMsg) {
      error.value = decodeURIComponent(errorMsg)
      loading.value = false
      return
    }

    if (!token) {
      error.value = '未收到认证令牌，请重新登录'
      loading.value = false
      return
    }

    // 解析用户数据
    let user = null
    if (userData) {
      try {
        user = JSON.parse(decodeURIComponent(userData))
      } catch (e) {
        console.error('Failed to parse user data:', e)
        error.value = '用户数据解析失败'
        loading.value = false
        return
      }
    }

    if (!user) {
      error.value = '未收到用户信息'
      loading.value = false
      return
    }

    // 使用新的认证store方法处理OAuth回调
    const result = await authStore.handleOAuthCallback(token, refreshToken, user)
    
    if (result) {
      success.value = true
      
      // 延迟跳转以显示成功状态
      setTimeout(() => {
        const redirect = route.query.redirect as string
        router.push(redirect || '/studio')
      }, 1500)
    } else {
      error.value = authStore.error || '登录处理失败'
    }
  } catch (e: unknown) {
    console.error('OAuth callback error:', e)
    error.value = (e instanceof Error ? e.message : String(e)) || '登录过程中发生未知错误'
  } finally {
    loading.value = false
  }
})
</script>
