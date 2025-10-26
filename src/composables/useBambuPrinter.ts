import { ref, reactive } from 'vue'
import { BambuClient, GCodeFileCommand, UpdateStateCommand } from 'bambu-node'

export interface BambuPrinterConfig {
  host: string
  accessToken: string
  serialNumber: string
}

export interface PrinterStatus {
  isConnected: boolean
  isConnecting: boolean
  status: string
  temperature: {
    bed: number
    nozzle: number
  }
  progress: number
  currentJob?: {
    name: string
    progress: number
    timeRemaining: number
  }
}

export function useBambuPrinter() {
  const client = ref<BambuClient | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  
  const printerStatus = reactive<PrinterStatus>({
    isConnected: false,
    isConnecting: false,
    status: 'offline',
    temperature: {
      bed: 0,
      nozzle: 0
    },
    progress: 0
  })

  // 连接打印机
  const connectPrinter = async (config: BambuPrinterConfig) => {
    if (isConnecting.value || isConnected.value) {
      return
    }

    isConnecting.value = true
    printerStatus.isConnecting = true
    connectionError.value = null

    try {
      // 创建 Bambu 客户端
      client.value = new BambuClient({
        host: config.host,
        accessToken: config.accessToken,
        serialNumber: config.serialNumber
      })

      // 设置事件监听器
      setupEventListeners()

      // 连接到打印机
      await client.value.connect()
      
      isConnected.value = true
      printerStatus.isConnected = true
      printerStatus.status = 'connected'
      
      console.log('Successfully connected to Bambu printer')
    } catch (error) {
      console.error('Failed to connect to Bambu printer:', error)
      connectionError.value = error instanceof Error ? error.message : '连接失败'
      printerStatus.status = 'error'
    } finally {
      isConnecting.value = false
      printerStatus.isConnecting = false
    }
  }

  // 断开连接
  const disconnectPrinter = async () => {
    if (!client.value || !isConnected.value) {
      return
    }

    try {
      await client.value.disconnect()
      isConnected.value = false
      printerStatus.isConnected = false
      printerStatus.status = 'offline'
      client.value = null
      console.log('Disconnected from Bambu printer')
    } catch (error) {
      console.error('Error disconnecting from printer:', error)
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    if (!client.value) return

    // 连接状态事件
    client.value.on('client:connect', () => {
      console.log('Printer connected')
      printerStatus.status = 'idle'
    })

    client.value.on('client:disconnect', () => {
      console.log('Printer disconnected')
      isConnected.value = false
      printerStatus.isConnected = false
      printerStatus.status = 'offline'
    })

    client.value.on('client:error', (error) => {
      console.error('Printer client error:', error)
      connectionError.value = error.message
      printerStatus.status = 'error'
    })

    // 打印机状态更新
    client.value.on('printer:statusUpdate', (oldStatus, newStatus) => {
      console.log(`Printer status changed from ${oldStatus} to ${newStatus}`)
      printerStatus.status = newStatus
    })

    // 打印机数据更新
    client.value.on('printer:dataUpdate', (data: any) => {
      // 更新温度信息
      if (data && typeof data === 'object' && data.temperature) {
        printerStatus.temperature.bed = data.temperature.bed || 0
        printerStatus.temperature.nozzle = data.temperature.nozzle || 0
      }
      
      // 更新打印进度
      if (data && typeof data === 'object' && data.progress !== undefined) {
        printerStatus.progress = data.progress
      }
    })

    // 打印任务事件
    client.value.on('job:start', (job: any) => {
      console.log('Print job started:', job)
      printerStatus.currentJob = {
        name: (job && job.data && job.data.name) || 'Unknown',
        progress: 0,
        timeRemaining: 0
      }
      printerStatus.status = 'printing'
    })

    client.value.on('job:update', (job: any) => {
      if (printerStatus.currentJob && job && job.data) {
        printerStatus.currentJob.progress = job.data.progress || 0
        printerStatus.currentJob.timeRemaining = job.data.timeRemaining || 0
      }
      if (job && job.data) {
        printerStatus.progress = job.data.progress || 0
      }
    })

    client.value.on('job:finish', (job: any, outcome: any) => {
      console.log('Print job finished:', outcome)
      printerStatus.currentJob = undefined
      printerStatus.progress = 0
      printerStatus.status = outcome === 'SUCCESS' ? 'idle' : 'error'
    })

    client.value.on('job:pause', () => {
      console.log('Print job paused')
      printerStatus.status = 'paused'
    })

    client.value.on('job:unpause', () => {
      console.log('Print job resumed')
      printerStatus.status = 'printing'
    })
  }

  // 开始打印
  const startPrint = async (modelUrl: string, fileName: string = 'model.3mf') => {
    if (!client.value || !isConnected.value) {
      throw new Error('打印机未连接')
    }

    try {
      // 发送 G-code 文件命令
      const command = new GCodeFileCommand({
        fileName: fileName
      })

      await client.value.executeCommand(command)
      console.log('Print job started successfully')
    } catch (error) {
      console.error('Failed to start print job:', error)
      throw new Error(error instanceof Error ? error.message : '打印启动失败')
    }
  }

  // 暂停打印
  const pausePrint = async () => {
    if (!client.value || !isConnected.value) {
      throw new Error('打印机未连接')
    }

    try {
      const command = new UpdateStateCommand({ state: 'pause' })
      await client.value.executeCommand(command)
      console.log('Print job paused')
    } catch (error) {
      console.error('Failed to pause print job:', error)
      throw new Error('暂停打印失败')
    }
  }

  // 恢复打印
  const resumePrint = async () => {
    if (!client.value || !isConnected.value) {
      throw new Error('打印机未连接')
    }

    try {
      const command = new UpdateStateCommand({ state: 'resume' })
      await client.value.executeCommand(command)
      console.log('Print job resumed')
    } catch (error) {
      console.error('Failed to resume print job:', error)
      throw new Error('恢复打印失败')
    }
  }

  // 停止打印
  const stopPrint = async () => {
    if (!client.value || !isConnected.value) {
      throw new Error('打印机未连接')
    }

    try {
      const command = new UpdateStateCommand({ state: 'stop' })
      await client.value.executeCommand(command)
      console.log('Print job stopped')
    } catch (error) {
      console.error('Failed to stop print job:', error)
      throw new Error('停止打印失败')
    }
  }

  return {
    // 状态
    isConnected,
    isConnecting,
    connectionError,
    printerStatus,
    
    // 方法
    connectPrinter,
    disconnectPrinter,
    startPrint,
    pausePrint,
    resumePrint,
    stopPrint
  }
}