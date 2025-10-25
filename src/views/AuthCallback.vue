<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600">正在登录...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="text-red-600">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">登录失败</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="router.push('/login')"
          class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          返回登录页
        </button>
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

onMounted(async () => {
  const token = route.query.token as string
  const errorMsg = route.query.error as string

  if (errorMsg) {
    error.value = errorMsg
    loading.value = false
    return
  }

  if (!token) {
    error.value = '未收到认证令牌'
    loading.value = false
    return
  }

  try {
    authStore.setToken(token)
    
    const userData = route.query.user as string
    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData))
        authStore.saveUser(user)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }

    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (e: any) {
    error.value = e.message || '登录过程中发生错误'
  } finally {
    loading.value = false
  }
})
</script>
