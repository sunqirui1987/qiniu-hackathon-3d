<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          3D生成打印平台
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          选择一种方式登录
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <OAuthButtons />
        
        <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </div>

      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        还没有账号? 通过上述方式登录即可自动创建账号
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OAuthButtons from '@/components/ui/OAuthButtons.vue'
</script>
