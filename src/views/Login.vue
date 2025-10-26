<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4"
  >
    <div class="max-w-md w-full">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div
            class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">3D生成打印平台</h1>
        <p class="text-gray-600 dark:text-gray-400">AI驱动的3D模型生成与打印服务</p>
      </div>

      <!-- 登录卡片 -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            欢迎回来
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-center text-sm">
            选择一种方式登录您的账户
          </p>
        </div>

        <!-- OAuth 登录按钮 -->
        <OAuthButtons />

        <div class="mt-6 text-center text-sm text-gray-500">
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </div>

      <!-- 注册提示 -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          还没有账号？
          <span class="text-blue-600 dark:text-blue-400 font-medium">
            通过上述方式登录即可自动创建账号
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OAuthButtons from '@/components/ui/OAuthButtons.vue'
</script>
