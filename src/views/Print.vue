<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      打印管理
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <BambuConnector
          :model-url="testModelUrl"
          :model-name="testModelName"
          @print-sent="handlePrintSent"
        />

        <PrintStatus />
      </div>

      <div>
        <PrintQueue />
      </div>
    </div>

    <div class="mt-8 p-6 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        使用说明
      </h3>
      <ul class="list-disc list-inside space-y-2 text-sm text-gray-700">
        <li>请确保已安装 Bambu Connect 应用程序</li>
        <li>支持的文件格式: .gcode, .3mf, .gcode.3mf</li>
        <li>点击"发送到 Bambu Connect"按钮将模型发送到打印机</li>
        <li>在 Bambu Connect 中完成打印设置和启动</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePrintStore } from '@/stores/print'
import BambuConnector from '@/components/print/BambuConnector.vue'
import PrintQueue from '@/components/print/PrintQueue.vue'
import PrintStatus from '@/components/print/PrintStatus.vue'

const printStore = usePrintStore()

const testModelUrl = ref('/tmp/test-model.3mf')
const testModelName = ref('测试模型')

const handlePrintSent = (result: { success: boolean; message: string }) => {
  console.log('模型已发送到 Bambu Connect:', result)

  printStore.addPrintJob({
    id: Date.now().toString(),
    modelId: 'test-model-id',
    modelName: testModelName.value,
    status: 'pending',
    progress: 0,
    settings: {
      printer: 'Bambu Connect',
      material: 'PLA',
      layerHeight: 0.2,
      infillDensity: 20,
      supports: false
    },
    createdAt: new Date()
  })
}
</script>
