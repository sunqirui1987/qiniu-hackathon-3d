import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import { MeshyClient } from '../meshyClient'
import type { MeshyTaskStatus } from '../meshyClient'

vi.mock('axios')

const mockAxios = axios as any

describe('MeshyClient', () => {
  let client: MeshyClient
  let mockAxiosInstance: any

  beforeEach(() => {
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn((successHandler) => {
            return successHandler
          }),
        },
        response: {
          use: vi.fn(),
        },
      },
    }

    mockAxios.create = vi.fn().mockReturnValue(mockAxiosInstance)

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-auth-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })

    client = new MeshyClient('test-api-key')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Text-to-3D', () => {
    it('should create Text-to-3D task successfully', async () => {
      const mockResponse = {
        data: {
          result: 'task-123',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createTextTo3D({
        prompt: 'A red sports car',
        art_style: 'realistic',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/text-to-3d', {
        prompt: 'A red sports car',
        art_style: 'realistic',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create Text-to-3D task with all parameters', async () => {
      const mockResponse = {
        data: {
          result: 'task-456',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createTextTo3D({
        prompt: 'A medieval castle',
        negative_prompt: 'modern, futuristic',
        art_style: 'sculpture',
        ai_model: 'meshy-5',
        license: 'private',
        is_a_t_pose: true,
        symmetry_mode: 'auto',
        seed: 12345,
        image_urls: ['https://example.com/ref.jpg'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/text-to-3d', {
        prompt: 'A medieval castle',
        negative_prompt: 'modern, futuristic',
        art_style: 'sculpture',
        ai_model: 'meshy-5',
        license: 'private',
        is_a_t_pose: true,
        symmetry_mode: 'auto',
        seed: 12345,
        image_urls: ['https://example.com/ref.jpg'],
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should poll Text-to-3D task until complete', async () => {
      const taskId = 'task-poll-123'
      const mockSucceededStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        created_at: Date.now(),
        finished_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockSucceededStatus })

      const onProgress = vi.fn()

      const result = await client.pollTaskUntilComplete(taskId, 'text-to-3d', {
        maxAttempts: 10,
        pollInterval: 10,
        onProgress,
      })

      expect(result).toEqual(mockSucceededStatus)
      expect(onProgress).toHaveBeenCalled()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/openapi/v1/text-to-3d/${taskId}`)
    })
  })

  describe('Image-to-3D', () => {
    it('should create Image-to-3D task successfully', async () => {
      const mockResponse = {
        data: {
          result: 'task-789',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createImageTo3D({
        image_url: 'https://example.com/image.jpg',
        ai_model: 'meshy-5',
        topology: 'quad',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/image-to-3d', {
        image_url: 'https://example.com/image.jpg',
        ai_model: 'meshy-5',
        topology: 'quad',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create Image-to-3D task with all parameters', async () => {
      const mockResponse = {
        data: {
          result: 'task-101',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createImageTo3D({
        image_url: 'https://example.com/chair.jpg',
        ai_model: 'latest',
        topology: 'triangle',
        target_polycount: 50000,
        symmetry_mode: 'on',
        should_remesh: true,
        should_texture: true,
        enable_pbr: true,
        is_a_t_pose: false,
        texture_prompt: 'wooden texture',
        texture_image_url: 'https://example.com/texture.jpg',
        moderation: true,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/image-to-3d', {
        image_url: 'https://example.com/chair.jpg',
        ai_model: 'latest',
        topology: 'triangle',
        target_polycount: 50000,
        symmetry_mode: 'on',
        should_remesh: true,
        should_texture: true,
        enable_pbr: true,
        is_a_t_pose: false,
        texture_prompt: 'wooden texture',
        texture_image_url: 'https://example.com/texture.jpg',
        moderation: true,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should poll Image-to-3D task until complete', async () => {
      const taskId = 'task-789'
      const mockSucceededStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        created_at: Date.now(),
        finished_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockSucceededStatus })

      const result = await client.pollTaskUntilComplete(taskId, 'image-to-3d', {
        maxAttempts: 10,
        pollInterval: 100,
      })

      expect(result).toEqual(mockSucceededStatus)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/openapi/v1/image-to-3d/${taskId}`)
    })
  })

  describe('Remesh', () => {
    it('should create Remesh task successfully', async () => {
      const mockResponse = {
        data: {
          result: 'task-remesh-1',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createRemesh({
        input_task_id: 'task-123',
        topology: 'quad',
        target_polycount: 10000,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/remesh', {
        input_task_id: 'task-123',
        topology: 'quad',
        target_polycount: 10000,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create Remesh task with all parameters', async () => {
      const mockResponse = {
        data: {
          result: 'task-remesh-2',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createRemesh({
        input_task_id: 'task-456',
        model_url: 'https://example.com/model.glb',
        target_formats: ['glb', 'fbx', 'obj'],
        topology: 'triangle',
        target_polycount: 25000,
        resize_height: 200,
        origin_at: 'bottom',
        convert_format_only: false,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/remesh', {
        input_task_id: 'task-456',
        model_url: 'https://example.com/model.glb',
        target_formats: ['glb', 'fbx', 'obj'],
        topology: 'triangle',
        target_polycount: 25000,
        resize_height: 200,
        origin_at: 'bottom',
        convert_format_only: false,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should poll Remesh task until complete', async () => {
      const taskId = 'task-remesh-1'
      const mockSucceededStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: {
          glb: 'https://example.com/remeshed.glb',
          fbx: 'https://example.com/remeshed.fbx',
        },
        created_at: Date.now(),
        finished_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockSucceededStatus })

      const result = await client.pollTaskUntilComplete(taskId, 'remesh', {
        maxAttempts: 10,
        pollInterval: 100,
      })

      expect(result).toEqual(mockSucceededStatus)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/openapi/v1/remesh/${taskId}`)
    })
  })

  describe('Retexture', () => {
    it('should create Retexture task successfully', async () => {
      const mockResponse = {
        data: {
          result: 'task-retexture-1',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createRetexture({
        input_task_id: 'task-123',
        text_style_prompt: 'wooden texture',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/retexture', {
        input_task_id: 'task-123',
        text_style_prompt: 'wooden texture',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create Retexture task with all parameters', async () => {
      const mockResponse = {
        data: {
          result: 'task-retexture-2',
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await client.createRetexture({
        input_task_id: 'task-789',
        model_url: 'https://example.com/model.glb',
        text_style_prompt: 'metallic finish',
        image_style_url: 'https://example.com/style.jpg',
        ai_model: 'meshy-5',
        enable_original_uv: true,
        enable_pbr: true,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/openapi/v1/retexture', {
        input_task_id: 'task-789',
        model_url: 'https://example.com/model.glb',
        text_style_prompt: 'metallic finish',
        image_style_url: 'https://example.com/style.jpg',
        ai_model: 'meshy-5',
        enable_original_uv: true,
        enable_pbr: true,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should poll Retexture task until complete', async () => {
      const taskId = 'task-retexture-1'
      const mockSucceededStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: {
          glb: 'https://example.com/retextured.glb',
        },
        texture_urls: [
          {
            base_color: 'https://example.com/base.jpg',
            metallic: 'https://example.com/metallic.jpg',
            normal: 'https://example.com/normal.jpg',
            roughness: 'https://example.com/roughness.jpg',
          },
        ],
        created_at: Date.now(),
        finished_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockSucceededStatus })

      const result = await client.pollTaskUntilComplete(taskId, 'retexture', {
        maxAttempts: 10,
        pollInterval: 100,
      })

      expect(result).toEqual(mockSucceededStatus)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/openapi/v1/retexture/${taskId}`)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors with error response', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              code: 'INVALID_REQUEST',
              message: 'Invalid prompt',
              details: { field: 'prompt' },
            },
          },
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({ prompt: '' })
      ).rejects.toThrow()
    })

    it('should handle 401 Unauthorized errors', async () => {
      const mockError = {
        response: {
          status: 401,
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({ prompt: 'test' })
      ).rejects.toThrow()
    })

    it('should handle 402 Insufficient Credits errors', async () => {
      const mockError = {
        response: {
          status: 402,
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({ prompt: 'test' })
      ).rejects.toThrow()
    })

    it('should handle 429 Rate Limit errors', async () => {
      const mockError = {
        response: {
          status: 429,
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({ prompt: 'test' })
      ).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout',
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({ prompt: 'test' })
      ).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      const mockError = {
        message: 'Network Error',
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        client.createTextTo3D({
          prompt: 'test',
        })
      ).rejects.toThrow('Network Error')
    })

    it('should handle FAILED task status', async () => {
      const taskId = 'task-fail'
      const mockFailedStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'FAILED',
        progress: 0,
        task_error: {
          message: 'Generation failed due to invalid input',
        },
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockFailedStatus })

      await expect(
        client.pollTaskUntilComplete(taskId, 'text-to-3d', {
          maxAttempts: 10,
          pollInterval: 100,
        })
      ).rejects.toThrow('Task failed: Generation failed due to invalid input')
    })

    it('should handle EXPIRED task status', async () => {
      const taskId = 'task-expired'
      const mockExpiredStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'EXPIRED',
        progress: 0,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockExpiredStatus })

      await expect(
        client.pollTaskUntilComplete(taskId, 'text-to-3d', {
          maxAttempts: 10,
          pollInterval: 100,
        })
      ).rejects.toThrow('Task expired')
    })

    it('should handle CANCELED task status', async () => {
      const taskId = 'task-canceled'
      const mockCanceledStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'CANCELED',
        progress: 0,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockCanceledStatus })

      await expect(
        client.pollTaskUntilComplete(taskId, 'text-to-3d', {
          maxAttempts: 10,
          pollInterval: 100,
        })
      ).rejects.toThrow('Task was canceled')
    })

    it('should handle polling timeout', async () => {
      const taskId = 'task-timeout'
      const mockPendingStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 50,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockPendingStatus })

      await expect(
        client.pollTaskUntilComplete(taskId, 'text-to-3d', {
          maxAttempts: 2,
          pollInterval: 100,
        })
      ).rejects.toThrow('Task polling timeout - maximum attempts reached')
    })
  })

  describe('Task Cancellation', () => {
    it('should cancel task polling', async () => {
      const taskId = 'task-cancel'
      const mockPendingStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 30,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockPendingStatus })

      const pollPromise = client.pollTaskUntilComplete(taskId, 'text-to-3d', {
        maxAttempts: 100,
        pollInterval: 100,
      })

      setTimeout(() => {
        client.cancelTask(taskId)
      }, 50)

      await expect(pollPromise).rejects.toThrow('Task polling cancelled by user')
    })

    it('should cancel all tasks', async () => {
      const taskId1 = 'task-1'
      const taskId2 = 'task-2'
      const mockPendingStatus: MeshyTaskStatus = {
        id: taskId1,
        status: 'IN_PROGRESS',
        progress: 30,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockPendingStatus })

      const pollPromise1 = client.pollTaskUntilComplete(taskId1, 'text-to-3d', {
        maxAttempts: 100,
        pollInterval: 100,
      })

      const pollPromise2 = client.pollTaskUntilComplete(taskId2, 'image-to-3d', {
        maxAttempts: 100,
        pollInterval: 100,
      })

      setTimeout(() => {
        client.cancelAllTasks()
      }, 50)

      await expect(pollPromise1).rejects.toThrow('Task polling cancelled by user')
      await expect(pollPromise2).rejects.toThrow('Task polling cancelled by user')
    })

    it('should support external abort signal', async () => {
      const taskId = 'task-abort'
      const mockPendingStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 30,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockPendingStatus })

      const abortController = new AbortController()

      const pollPromise = client.pollTaskUntilComplete(taskId, 'text-to-3d', {
        maxAttempts: 100,
        pollInterval: 100,
        signal: abortController.signal,
      })

      setTimeout(() => {
        abortController.abort()
      }, 50)

      await expect(pollPromise).rejects.toThrow('Task polling cancelled by user')
    })
  })

  describe('Task Management', () => {
    it('should list tasks successfully', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'task-1',
              status: 'SUCCEEDED',
              progress: 100,
              created_at: Date.now(),
            },
            {
              id: 'task-2',
              status: 'IN_PROGRESS',
              progress: 50,
              created_at: Date.now(),
            },
          ],
          total: 2,
        },
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await client.listTasks('text-to-3d', {
        page_num: 1,
        page_size: 10,
        sort_by: 'created_at',
        order: 'desc',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/openapi/v1/text-to-3d', {
        params: {
          page_num: 1,
          page_size: 10,
          sort_by: 'created_at',
          order: 'desc',
        },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should delete task successfully', async () => {
      const taskId = 'task-delete'

      mockAxiosInstance.delete.mockResolvedValue({ data: null })

      await client.deleteTask(taskId, 'text-to-3d')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/openapi/v1/text-to-3d/${taskId}`)
    })

    it('should get task status successfully', async () => {
      const taskId = 'task-status'
      const mockStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 75,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockStatus })

      const result = await client.getTaskStatus(taskId, 'text-to-3d')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/openapi/v1/text-to-3d/${taskId}`)
      expect(result).toEqual(mockStatus)
    })

    it('should cache task status', async () => {
      const taskId = 'task-cache'
      const mockStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 60,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockStatus })

      await client.getTaskStatus(taskId, 'text-to-3d')
      const cachedResult = await client.getTaskStatus(taskId, 'text-to-3d')

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(cachedResult).toEqual(mockStatus)
    })

    it('should clear cache', async () => {
      const taskId = 'task-clear'
      const mockStatus: MeshyTaskStatus = {
        id: taskId,
        status: 'IN_PROGRESS',
        progress: 60,
        created_at: Date.now(),
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockStatus })

      await client.getTaskStatus(taskId, 'text-to-3d')
      client.clearCache()
      await client.getTaskStatus(taskId, 'text-to-3d')

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2)
    })
  })
})
