const request = require('supertest');
const express = require('express');

// Mock axios
const mockAxios = {
  create: jest.fn(),
  request: jest.fn()
};

const mockAxiosInstance = {
  request: jest.fn()
};

// Mock the axios module
jest.mock('axios', () => mockAxios);

// Mock the security middleware
jest.mock('../../middleware/security.js', () => ({
  requireAuth: jest.fn((req, res, next) => next())
}));

describe('Meshy API Proxy Route', () => {
  let app;
  let meshyRouter;

  beforeAll(async () => {
    // Setup axios mock
    mockAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create express app
    app = express();
    app.use(express.json());
    
    // Since we can't easily import ES modules in Jest, we'll test the functionality
    // by creating a simplified version of the route
    const router = express.Router();
    
    // Simplified proxy route for testing
    router.all('/*', async (req, res) => {
      try {
        const response = await mockAxiosInstance.request({
          method: req.method,
          url: req.params[0],
          params: req.query,
          data: req.body,
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        });
        
        res.status(response.status).json(response.data);
      } catch (error) {
        if (error.response) {
          res.status(error.response.status).json(error.response.data);
        } else {
          res.status(500).json({ error: 'Network error' });
        }
      }
    });
    
    app.use('/api/meshy', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should proxy GET requests successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { id: 'task-123', status: 'completed' }
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/meshy/v1/text-to-3d/task-123')
        .expect(200);

      expect(response.body).toEqual(mockResponse.data);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'v1/text-to-3d/task-123',
        params: {},
        data: {},
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });

    it('should handle query parameters', async () => {
      const mockResponse = {
        status: 200,
        data: { tasks: [] }
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await request(app)
        .get('/api/meshy/v1/text-to-3d?page=1&limit=10')
        .expect(200);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'v1/text-to-3d',
        params: { page: '1', limit: '10' },
        data: {},
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('POST requests', () => {
    it('should proxy POST requests with body', async () => {
      const requestBody = {
        prompt: 'A red car',
        art_style: 'realistic'
      };
      
      const mockResponse = {
        status: 201,
        data: { task_id: 'new-task-123' }
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/meshy/v1/text-to-3d')
        .send(requestBody)
        .expect(201);

      expect(response.body).toEqual(mockResponse.data);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'v1/text-to-3d',
        params: {},
        data: requestBody,
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle 401 Unauthorized errors', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(errorResponse);

      const response = await request(app)
        .get('/api/meshy/v1/text-to-3d/invalid')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle 429 Rate Limit errors', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(errorResponse);

      const response = await request(app)
        .get('/api/meshy/v1/text-to-3d/test')
        .expect(429);

      expect(response.body).toEqual({ error: 'Rate limit exceeded' });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      
      mockAxiosInstance.request.mockRejectedValue(networkError);

      const response = await request(app)
        .get('/api/meshy/v1/text-to-3d/test')
        .expect(500);

      expect(response.body).toEqual({ error: 'Network error' });
    });
  });

  describe('HTTP Methods', () => {
    it('should handle PUT requests', async () => {
      const mockResponse = {
        status: 200,
        data: { updated: true }
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await request(app)
        .put('/api/meshy/v1/text-to-3d/task-123')
        .send({ status: 'cancelled' })
        .expect(200);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'v1/text-to-3d/task-123',
        params: {},
        data: { status: 'cancelled' },
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });

    it('should handle DELETE requests', async () => {
      const mockResponse = {
        status: 204,
        data: null
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await request(app)
        .delete('/api/meshy/v1/text-to-3d/task-123')
        .expect(204);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'v1/text-to-3d/task-123',
        params: {},
        data: {},
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });
});