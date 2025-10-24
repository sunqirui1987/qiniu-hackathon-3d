<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link
              to="/"
              class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <span class="text-xl font-bold">3D平台</span>
            </router-link>
            <div class="ml-6 flex space-x-4">
              <router-link
                to="/generate"
                class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 border-b-2 border-blue-600"
              >
                生成
              </router-link>
              <router-link
                to="/viewer"
                class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 border-b-2 border-blue-600"
              >
                查看器
              </router-link>
              <router-link
                to="/print"
                class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 border-b-2 border-blue-600"
              >
                打印
              </router-link>
              <router-link
                to="/library"
                class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 border-b-2 border-blue-600"
              >
                模型库
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
