import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useBambuConnect } from '../useBambuConnect'

const mockWindowOpen = vi.fn()

describe('useBambuConnect', () => {
  beforeEach(() => {
    global.window.open = mockWindowOpen
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with disconnected state', () => {
      const { connected, printers, error, hasPrinters, hasError, isChecking } = useBambuConnect()

      expect(connected.value).toBe(false)
      expect(printers.value).toEqual([])
      expect(error.value).toBeNull()
      expect(hasPrinters.value).toBe(false)
      expect(hasError.value).toBe(false)
      expect(isChecking.value).toBe(false)
    })
  })

  describe('checkBambuConnect', () => {
    it('should successfully connect to Bambu Connect', async () => {
      const mockWindow = { close: vi.fn() }
      mockWindowOpen.mockReturnValue(mockWindow)

      const { checkBambuConnect, connected, printers, hasPrinters } = useBambuConnect()

      const result = await checkBambuConnect()

      expect(result).toBe(true)
      expect(connected.value).toBe(true)
      expect(printers.value.length).toBeGreaterThan(0)
      expect(hasPrinters.value).toBe(true)
      expect(mockWindowOpen).toHaveBeenCalledWith('bambustudio://check', '_blank')
      expect(mockWindow.close).toHaveBeenCalled()
    })

    it('should set isChecking during check', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, isChecking } = useBambuConnect()

      expect(isChecking.value).toBe(false)

      const promise = checkBambuConnect()
      expect(isChecking.value).toBe(true)

      await promise
      expect(isChecking.value).toBe(false)
    })

    it('should handle connection errors', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const { checkBambuConnect, connected, error, hasError } = useBambuConnect()

      const result = await checkBambuConnect()

      expect(result).toBe(false)
      expect(connected.value).toBe(false)
      expect(error.value).toBe('Connection failed')
      expect(hasError.value).toBe(true)
    })
  })

  describe('sendToPrint', () => {
    it('should send model to printer successfully', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, sendToPrint } = useBambuConnect()
      await checkBambuConnect()

      const result = await sendToPrint('/models/test.stl', {
        printer: 'Bambu Lab X1 Carbon',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: true,
        temperature: 200,
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Model sent to Bambu Studio successfully')
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('bambustudio://print'),
        '_blank'
      )
    })

    it('should include all print settings in URL', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, sendToPrint } = useBambuConnect()
      await checkBambuConnect()

      await sendToPrint('/models/test.stl', {
        printer: 'Bambu Lab X1 Carbon',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: true,
        temperature: 200,
      })

      const callArg = mockWindowOpen.mock.calls[1][0] as string
      expect(callArg).toContain('file=%2Fmodels%2Ftest.stl')
      expect(callArg).toContain('printer=Bambu+Lab+X1+Carbon')
      expect(callArg).toContain('material=PLA')
      expect(callArg).toContain('layer_height=0.2')
      expect(callArg).toContain('infill_density=20')
      expect(callArg).toContain('supports=true')
      expect(callArg).toContain('temperature=200')
    })

    it('should fail if not connected', async () => {
      const { sendToPrint, error, hasError } = useBambuConnect()

      const result = await sendToPrint('/models/test.stl', {
        printer: 'Bambu Lab X1 Carbon',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false,
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('not connected')
      expect(error.value).toContain('not connected')
      expect(hasError.value).toBe(true)
    })

    it('should handle optional temperature parameter', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, sendToPrint } = useBambuConnect()
      await checkBambuConnect()

      await sendToPrint('/models/test.stl', {
        printer: 'Bambu Lab X1 Carbon',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false,
      })

      const callArg = mockWindowOpen.mock.calls[1][0] as string
      expect(callArg).not.toContain('temperature')
    })
  })

  describe('getPrinters', () => {
    it('should return printer list when connected', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, getPrinters } = useBambuConnect()
      await checkBambuConnect()

      const printers = await getPrinters()

      expect(printers.length).toBeGreaterThan(0)
      expect(printers).toContain('Bambu Lab X1 Carbon')
    })

    it('should auto-connect if not connected', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { getPrinters, connected } = useBambuConnect()

      expect(connected.value).toBe(false)

      const printers = await getPrinters()

      expect(connected.value).toBe(true)
      expect(printers.length).toBeGreaterThan(0)
    })

    it('should handle errors', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Failed to get printers')
      })

      const { getPrinters, error, hasError } = useBambuConnect()

      const printers = await getPrinters()

      expect(printers).toEqual([])
      expect(error.value).toBe('Failed to get printers')
      expect(hasError.value).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all state', async () => {
      mockWindowOpen.mockReturnValue({ close: vi.fn() })

      const { checkBambuConnect, reset, connected, printers, error, isChecking } = useBambuConnect()

      await checkBambuConnect()

      expect(connected.value).toBe(true)
      expect(printers.value.length).toBeGreaterThan(0)

      reset()

      expect(connected.value).toBe(false)
      expect(printers.value).toEqual([])
      expect(error.value).toBeNull()
      expect(isChecking.value).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should compute hasPrinters correctly', () => {
      const { printers, hasPrinters } = useBambuConnect()

      expect(hasPrinters.value).toBe(false)

      printers.value = ['Printer 1']
      expect(hasPrinters.value).toBe(true)

      printers.value = []
      expect(hasPrinters.value).toBe(false)
    })

    it('should compute hasError correctly', () => {
      const { error, hasError } = useBambuConnect()

      expect(hasError.value).toBe(false)

      error.value = 'Some error'
      expect(hasError.value).toBe(true)

      error.value = null
      expect(hasError.value).toBe(false)
    })
  })
})
