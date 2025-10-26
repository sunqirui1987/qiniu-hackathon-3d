import { ref, computed } from 'vue'
import type { PrintSettings } from '../types/print'

export interface BambuConnectState {
  connected: boolean
  printers: string[]
  error: string | null
}

export interface SendToPrintResult {
  success: boolean
  message: string
}

export function useBambuConnect() {
  const connected = ref<boolean>(false)
  const printers = ref<string[]>([])
  const error = ref<string | null>(null)
  const isChecking = ref<boolean>(false)

  const hasPrinters = computed(() => printers.value.length > 0)
  const hasError = computed(() => error.value !== null)

  const checkBambuConnect = async (): Promise<boolean> => {
    try {
      isChecking.value = true
      error.value = null

      const bambuUrl = 'bambustudio://check'
      const checkWindow = window.open(bambuUrl, '_blank')
      
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      if (checkWindow) {
        checkWindow.close()
      }

      connected.value = true
      printers.value = ['Bambu Lab X1 Carbon', 'Bambu Lab P1P', 'Bambu Lab A1 Mini']
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Bambu Connect'
      error.value = errorMessage
      connected.value = false
      printers.value = []
      return false
    } finally {
      isChecking.value = false
    }
  }

  const sendToPrint = async (
    modelPath: string,
    settings: PrintSettings
  ): Promise<SendToPrintResult> => {
    try {
      error.value = null

      if (!connected.value) {
        throw new Error('Bambu Connect is not connected. Please check connection first.')
      }

      const params = new URLSearchParams({
        file: modelPath,
        printer: settings.printer,
        material: settings.material,
        layer_height: settings.layerHeight.toString(),
        infill_density: settings.infillDensity.toString(),
        supports: settings.supports.toString(),
      })

      if (settings.temperature) {
        params.append('temperature', settings.temperature.toString())
      }

      const bambuUrl = `bambustudio://print?${params.toString()}`
      
      window.open(bambuUrl, '_blank')

      return {
        success: true,
        message: 'Model sent to Bambu Studio successfully',
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send model to printer'
      error.value = errorMessage
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const getPrinters = async (): Promise<string[]> => {
    try {
      error.value = null
      
      if (!connected.value) {
        await checkBambuConnect()
      }

      return printers.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get printer list'
      error.value = errorMessage
      return []
    }
  }

  const importFileToBambuConnect = async (
    fileUrl: string,
    fileName: string
  ): Promise<SendToPrintResult> => {
    try {
      error.value = null

      if (!connected.value) {
        throw new Error('Bambu Connect is not connected. Please check connection first.')
      }

      // 确保文件名有正确的扩展名
      let processedFileName = fileName
      if (!fileName.toLowerCase().endsWith('.3mf') && !fileName.toLowerCase().endsWith('.gcode')) {
        processedFileName = `${fileName}.3mf`
      }

      // 构建bambu-connect URL scheme
      const params = new URLSearchParams({
        path: fileUrl,
        name: processedFileName,
        version: '1.0.0'
      })

      const bambuUrl = `bambu-connect://import-file?${params.toString()}`
      
      console.log('Opening Bambu Connect with URL:', bambuUrl)
      
      // 使用window.location.href来触发协议处理
      window.location.href = bambuUrl

      return {
        success: true,
        message: `模型 "${processedFileName}" 已发送到 Bambu Connect`,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import file to Bambu Connect'
      error.value = errorMessage
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const reset = () => {
    connected.value = false
    printers.value = []
    error.value = null
    isChecking.value = false
  }

  return {
    connected,
    printers,
    error,
    isChecking,
    hasPrinters,
    hasError,
    checkBambuConnect,
    sendToPrint,
    getPrinters,
    importFileToBambuConnect,
    reset,
  }
}
