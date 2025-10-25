import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BambuConnector from '../BambuConnector.vue'
import { useBambuConnect } from '@/composables/useBambuConnect'

vi.mock('@/composables/useBambuConnect')

describe('BambuConnector.vue', () => {
  const mockCheckBambuConnect = vi.fn()
  const mockSendToPrint = vi.fn()
  const mockGetBambuConnectDownloadUrl = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockCheckBambuConnect.mockResolvedValue(false)
    mockSendToPrint.mockResolvedValue({ success: true, message: '发送成功' })
    mockGetBambuConnectDownloadUrl.mockReturnValue('https://example.com/download')

    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: false,
        connectVersion: null,
        isConnecting: false,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })
  })

  it('should render component correctly', () => {
    const wrapper = mount(BambuConnector)

    expect(wrapper.find('.bambu-connector').exists()).toBe(true)
    expect(wrapper.find('.status-section').exists()).toBe(true)
  })

  it('should call checkBambuConnect on mount', () => {
    mount(BambuConnector)

    expect(mockCheckBambuConnect).toHaveBeenCalled()
  })

  it('should show download button when Bambu Connect is not installed', () => {
    const wrapper = mount(BambuConnector)

    expect(wrapper.find('button').text()).toContain('下载 Bambu Connect')
  })

  it('should show print button when Bambu Connect is installed', () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: false,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector, {
      props: {
        modelUrl: '/test/model.3mf'
      }
    })

    expect(wrapper.find('.print-section').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('发送到 Bambu Connect')
  })

  it('should open download URL when download button is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const wrapper = mount(BambuConnector)

    await wrapper.find('button').trigger('click')

    expect(mockGetBambuConnectDownloadUrl).toHaveBeenCalled()
    expect(openSpy).toHaveBeenCalledWith('https://example.com/download', '_blank')

    openSpy.mockRestore()
  })

  it('should call sendToPrint when print button is clicked', async () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: false,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector, {
      props: {
        modelUrl: '/test/model.3mf',
        modelName: 'Test Model'
      }
    })

    await wrapper.find('.print-section button').trigger('click')

    expect(mockSendToPrint).toHaveBeenCalledWith('/test/model.3mf', 'Test Model')
  })

  it('should emit printSent event when print is successful', async () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: false,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector, {
      props: {
        modelUrl: '/test/model.3mf'
      }
    })

    await wrapper.find('.print-section button').trigger('click')

    expect(wrapper.emitted('printSent')).toBeTruthy()
  })

  it('should display status text correctly', () => {
    const wrapper = mount(BambuConnector)

    expect(wrapper.text()).toContain('Bambu Connect 未安装')
  })

  it('should display error message when there is an error', async () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: false,
        lastError: '发送失败'
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector, {
      props: {
        modelUrl: '/test/model.3mf'
      }
    })

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('发送失败')
  })

  it('should disable print button when isConnecting is true', async () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: true,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector, {
      props: {
        modelUrl: '/test/model.3mf'
      }
    })

    const printButton = wrapper.find('.print-section button')
    expect(printButton.attributes('disabled')).toBeDefined()
  })

  it('should disable print button when modelUrl is not provided', async () => {
    vi.mocked(useBambuConnect).mockReturnValue({
      state: {
        isConnectInstalled: true,
        connectVersion: null,
        isConnecting: false,
        lastError: null
      },
      tempDir: { value: '/tmp/bambu-files' },
      checkBambuConnect: mockCheckBambuConnect,
      sendToPrint: mockSendToPrint,
      discoverPrinters: vi.fn(),
      getBambuConnectDownloadUrl: mockGetBambuConnectDownloadUrl,
      detectPlatform: vi.fn()
    })

    const wrapper = mount(BambuConnector)

    const printButton = wrapper.find('.print-section button')
    expect(printButton.attributes('disabled')).toBeDefined()
  })
})
