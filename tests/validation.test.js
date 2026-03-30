const {
  validateRequest,
  isValidEmail,
  isValidUrl,
  isValidObjectId,
  sanitizeInput,
  securityHeaders,
  rateLimitMiddleware
} = require('../middleware/validation');

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    test('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://github.com/user/repo')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://unsupported')).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    test('should validate MongoDB ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    test('should reject invalid ObjectIds', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false); // Too short
    });
  });

  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
    });

    test('should handle SQL injection attempts', () => {
      const input = "admin'; DROP TABLE users; --";
      const result = sanitizeInput(input);
      expect(result).not.toContain("'");
    });

    test('should preserve normal text', () => {
      const input = 'This is normal text with 123 numbers';
      const result = sanitizeInput(input);
      expect(result).toContain('normal');
    });
  });
});

describe('Validation Middleware', () => {
  describe('validateRequest', () => {
    test('should validate required fields', () => {
      const schema = {
        email: { required: true, type: 'email' },
        password: { required: true, minLength: 6 }
      };

      const middleware = validateRequest(schema);

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array)
        })
      );
    });

    test('should validate email format', () => {
      const schema = {
        email: { required: true, type: 'email' }
      };

      const middleware = validateRequest(schema);

      const req = { body: { email: 'invalid-email' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should validate URL format', () => {
      const schema = {
        repositoryUrl: { required: true, type: 'url' }
      };

      const middleware = validateRequest(schema);

      const req = { body: { repositoryUrl: 'https://github.com/user/repo' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should validate string length', () => {
      const schema = {
        password: { required: true, minLength: 8, maxLength: 50 }
      };

      const middleware = validateRequest(schema);

      const req = { body: { password: 'short' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('securityHeaders', () => {
    test('should set security headers', () => {
      const middleware = securityHeaders;

      const req = {};
      const res = {
        setHeader: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('rateLimitMiddleware', () => {
    test('should allow requests within limit', () => {
      const middleware = rateLimitMiddleware(60000, 5);

      const req = { ip: '192.168.1.1', connection: { remoteAddress: '192.168.1.1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(3);
    });

    test('should block requests exceeding limit', () => {
      const middleware = rateLimitMiddleware(60000, 2);

      const req = { ip: '192.168.1.1', connection: { remoteAddress: '192.168.1.1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(429);
    });
  });
});
