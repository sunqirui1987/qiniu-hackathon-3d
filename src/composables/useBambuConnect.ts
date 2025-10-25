import { ref, reactive } from 'vue'

export interface BambuConnectState {
  isConnectInstalled: boolean
  connectVersion: string | null
  isConnecting: boolean
  lastError: string | null
}

export interface Printer {
  id: string
  name: string
  status: string
  type: string
  description: string
}

export interface SendToPrintResult {
  success: boolean
  message: string
  urlScheme?: string
  error?: string
}

export function useBambuConnect() {
  const state = reactive<BambuConnectState>({
    isConnectInstalled: false,
    connectVersion: null,
    isConnecting: false,
    lastError: null
  })

  const tempDir = ref('/tmp/bambu-files')

  const checkBambuConnect = async (): Promise<boolean> => {
    try {
      state.isConnecting = true
      state.lastError = null

      interface ElectronWindow extends Window {
        electron?: {
          checkApp: (app: string) => Promise<boolean>
        }
      }

      const win = window as ElectronWindow
      if (win.electron) {
        state.isConnectInstalled = await win.electron.checkApp('bambu-connect')
      } else {
        state.isConnectInstalled = await detectByUrlScheme()
      }

      if (state.isConnectInstalled) {
        console.log('Bambu Connect 已安装')
      } else {
        console.warn('Bambu Connect 未检测到')
      }

      return state.isConnectInstalled
    } catch (error) {
      console.error('检测 Bambu Connect 时出错:', error)
      state.lastError = error instanceof Error ? error.message : '检测失败'
      state.isConnectInstalled = false
      return false
    } finally {
      state.isConnecting = false
    }
  }

  const detectByUrlScheme = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
      }, 2000)

      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = 'bambu-connect://ping'

      iframe.onload = () => {
        clearTimeout(timeout)
        document.body.removeChild(iframe)
        resolve(true)
      }

      iframe.onerror = () => {
        clearTimeout(timeout)
        document.body.removeChild(iframe)
        resolve(false)
      }

      document.body.appendChild(iframe)
    })
  }

  const sendToPrint = async (
    filePath: string,
    fileName: string
  ): Promise<SendToPrintResult> => {
    if (!state.isConnectInstalled) {
      return {
        success: false,
        message: 'Bambu Connect 未安装',
        error: '请先下载并安装 Bambu Connect'
      }
    }

    try {
      state.isConnecting = true
      state.lastError = null

      if (!filePath || !fileName) {
        throw new Error('文件路径和文件名不能为空')
      }

      const supportedFormats = ['.gcode', '.3mf', '.gcode.3mf']
      const fileExtension = getFileExtension(filePath)
      if (!supportedFormats.includes(fileExtension)) {
        throw new Error(`不支持的文件格式: ${fileExtension}`)
      }

      const encodedPath = encodeURIComponent(filePath)
      const encodedName = encodeURIComponent(fileName)

      const urlScheme = `bambu-connect://import-file?path=${encodedPath}&name=${encodedName}&version=1.0.0`

      console.log('调用 Bambu Connect:', urlScheme)

      interface ElectronWindow extends Window {
        electron?: {
          openExternal: (url: string) => Promise<void>
        }
      }

      const win = window as ElectronWindow
      if (win.electron) {
        await win.electron.openExternal(urlScheme)
      } else {
        window.location.href = urlScheme
      }

      return {
        success: true,
        message: '已发送到 Bambu Connect',
        urlScheme: urlScheme
      }
    } catch (error) {
      console.error('发送到 Bambu Connect 失败:', error)
      const errorMessage = error instanceof Error ? error.message : '发送失败'
      state.lastError = errorMessage
      return {
        success: false,
        message: '发送失败',
        error: errorMessage
      }
    } finally {
      state.isConnecting = false
    }
  }

  const discoverPrinters = async (): Promise<Printer[]> => {
    if (!state.isConnectInstalled) {
      return []
    }

    return [
      {
        id: 'bambu-connect-managed',
        name: '通过 Bambu Connect 管理的打印机',
        status: 'available',
        type: 'bambu-connect',
        description: '打印机管理由 Bambu Connect 应用程序处理'
      }
    ]
  }

  const getFileExtension = (filePath: string): string => {
    if (filePath.endsWith('.gcode.3mf')) {
      return '.gcode.3mf'
    }
    return filePath.substring(filePath.lastIndexOf('.'))
  }

  const getBambuConnectDownloadUrl = (): string => {
    const platform = detectPlatform()
    const downloadUrls: Record<string, string> = {
      windows:
        'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-win32-x64.exe',
      'macos-arm64':
        'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-darwin-arm64.dmg',
      'macos-x64':
        'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-darwin-x64.dmg',
      linux: 'https://github.com/bambulab/BambuStudio/releases/latest'
    }

    return downloadUrls[platform] || downloadUrls['linux']
  }

  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'windows'
    if (userAgent.includes('mac')) {
      return navigator.platform.includes('arm') ? 'macos-arm64' : 'macos-x64'
    }
    return 'linux'
  }

  return {
    state,
    tempDir,
    checkBambuConnect,
    sendToPrint,
    discoverPrinters,
    getBambuConnectDownloadUrl,
    detectPlatform
  }
}
