const jwt = require('jsonwebtoken');

describe('Auth Middleware - protect', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  test('should reject request without token', () => {
    const { protect } = require('../../src/middleware/auth.middleware');

    protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should reject request with invalid token', () => {
    const { protect } = require('../../src/middleware/auth.middleware');
    mockReq.headers.authorization = 'Bearer invalidtoken';

    protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('Auth Middleware - authorize', () => {
  test('should allow access for authorized role', () => {
    const { authorize } = require('../../src/middleware/auth.middleware');
    const mockReq = { user: { role: 'admin' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    const middleware = authorize('admin', 'owner');
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('should deny access for unauthorized role', () => {
    const { authorize } = require('../../src/middleware/auth.middleware');
    const mockReq = { user: { role: 'customer' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    const middleware = authorize('admin', 'owner');
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

