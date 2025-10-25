import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBambuConnect } from '../useBambuConnect'

describe('useBambuConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { state } = useBambuConnect()

    expect(state.isConnectInstalled).toBe(false)
    expect(state.connectVersion).toBeNull()
    expect(state.isConnecting).toBe(false)
    expect(state.lastError).toBeNull()
  })

  it('should detect platform correctly', () => {
    const { detectPlatform } = useBambuConnect()

    const platform = detectPlatform()
    expect(['windows', 'macos-arm64', 'macos-x64', 'linux']).toContain(platform)
  })

  it('should get Bambu Connect download URL', () => {
    const { getBambuConnectDownloadUrl } = useBambuConnect()

    const url = getBambuConnectDownloadUrl()
    expect(url).toContain('github.com')
  })

  it('should return error when sending print without Bambu Connect installed', async () => {
    const { sendToPrint } = useBambuConnect()

    const result = await sendToPrint('/test/path.3mf', 'test-model')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Bambu Connect')
  })

  it('should validate file format when sending to print', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.txt', 'test-model')

    expect(result.success).toBe(false)
    expect(result.error).toContain('不支持的文件格式')
  })

  it('should construct correct URL scheme for print', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.3mf', 'test-model')

    expect(result.success).toBe(true)
    expect(result.urlScheme).toContain('bambu-connect://import-file')
    expect(result.urlScheme).toContain('path=')
    expect(result.urlScheme).toContain('name=')
    expect(result.urlScheme).toContain('version=1.0.0')
  })

  it('should return empty array when discovering printers without Bambu Connect', async () => {
    const { discoverPrinters } = useBambuConnect()

    const printers = await discoverPrinters()

    expect(printers).toEqual([])
  })

  it('should return managed printer when Bambu Connect is installed', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const printers = await composable.discoverPrinters()

    expect(printers).toHaveLength(1)
    expect(printers[0].id).toBe('bambu-connect-managed')
    expect(printers[0].type).toBe('bambu-connect')
  })

  it('should handle .gcode.3mf file extension correctly', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.gcode.3mf', 'test-model')

    expect(result.success).toBe(true)
  })

  it('should handle .gcode file extension correctly', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.gcode', 'test-model')

    expect(result.success).toBe(true)
  })

  it('should handle .3mf file extension correctly', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.3mf', 'test-model')

    expect(result.success).toBe(true)
  })

  it('should encode file path and name in URL scheme', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint(
      '/test/path with spaces.3mf',
      'test model with spaces'
    )

    expect(result.success).toBe(true)
    expect(result.urlScheme).toContain('path=%2Ftest%2Fpath%20with%20spaces.3mf')
    expect(result.urlScheme).toContain('name=test%20model%20with%20spaces')
  })

  it('should return error when file path is empty', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('', 'test-model')

    expect(result.success).toBe(false)
    expect(result.error).toContain('文件路径和文件名不能为空')
  })

  it('should return error when file name is empty', async () => {
    const composable = useBambuConnect()
    composable.state.isConnectInstalled = true

    const result = await composable.sendToPrint('/test/path.3mf', '')

    expect(result.success).toBe(false)
    expect(result.error).toContain('文件路径和文件名不能为空')
  })
})
