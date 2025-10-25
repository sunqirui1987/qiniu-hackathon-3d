<template>
  <div class="bambu-connector p-6 bg-white rounded-lg shadow-md">
    <div class="status-section mb-6">
      <h3 class="text-xl font-semibold mb-4">
        Bambu Connect 状态
      </h3>
      <div
        class="status-indicator flex items-center p-4 rounded-lg"
        :class="statusClass"
      >
        <div
          class="status-icon w-3 h-3 rounded-full mr-3"
          :class="statusIconClass"
        />
        <span class="font-medium">{{ statusText }}</span>
      </div>

      <button
        v-if="!bambuState.isConnectInstalled"
        class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        @click="downloadBambuConnect"
      >
        下载 Bambu Connect
      </button>
    </div>

    <div
      v-if="bambuState.isConnectInstalled"
      class="print-section"
    >
      <h3 class="text-xl font-semibold mb-4">
        发送到打印机
      </h3>
      <button
        :disabled="bambuState.isConnecting || !modelUrl"
        class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        @click="handleSendToPrint"
      >
        <span
          v-if="bambuState.isConnecting"
          class="animate-spin mr-2"
        >⟳</span>
        {{ bambuState.isConnecting ? '发送中...' : '发送到 Bambu Connect' }}
      </button>

      <div
        v-if="bambuState.lastError"
        class="error-message mt-4 p-3 bg-red-50 text-red-700 rounded-lg"
      >
        {{ bambuState.lastError }}
      </div>

      <div
        v-if="successMessage"
        class="success-message mt-4 p-3 bg-green-50 text-green-700 rounded-lg"
      >
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBambuConnect } from '@/composables/useBambuConnect'

interface Props {
  modelUrl?: string
  modelName?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelName: '3D模型'
})

const emit = defineEmits<{
  printSent: [result: { success: boolean; message: string }]
}>()

const {
  state: bambuState,
  checkBambuConnect,
  sendToPrint,
  getBambuConnectDownloadUrl
} = useBambuConnect()

const successMessage = ref('')

const statusClass = computed(() => ({
  'bg-green-50 border border-green-200': bambuState.isConnectInstalled,
  'bg-red-50 border border-red-200': !bambuState.isConnectInstalled,
  'bg-yellow-50 border border-yellow-200': bambuState.isConnecting
}))

const statusIconClass = computed(() => ({
  'bg-green-500': bambuState.isConnectInstalled,
  'bg-red-500': !bambuState.isConnectInstalled,
  'bg-yellow-500': bambuState.isConnecting
}))

const statusText = computed(() => {
  if (bambuState.isConnecting) return '检测中...'
  return bambuState.isConnectInstalled ? 'Bambu Connect 已安装' : 'Bambu Connect 未安装'
})

const downloadBambuConnect = () => {
  const downloadUrl = getBambuConnectDownloadUrl()
  window.open(downloadUrl, '_blank')
}

const handleSendToPrint = async () => {
  if (!props.modelUrl) return

  successMessage.value = ''

  const result = await sendToPrint(props.modelUrl, props.modelName)

  if (result.success) {
    successMessage.value = result.message
    emit('printSent', result)
  }
}

onMounted(() => {
  checkBambuConnect()
})
</script>
