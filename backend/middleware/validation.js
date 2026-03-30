const logger = require('../utils/logger');

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potential script tags and SQL
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/('|(--)|;|\/\*.*?\*\/)/g, '')
    .trim();
};

// Middleware for request validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const errors = [];

      for (const [key, rules] of Object.entries(schema)) {
        const value = req.body[key];

        if (rules.required && !value) {
          errors.push(`${key} is required`);
          continue;
        }

        if (value && rules.type === 'email' && !isValidEmail(value)) {
          errors.push(`${key} must be a valid email`);
        }

        if (value && rules.type === 'url' && !isValidUrl(value)) {
          errors.push(`${key} must be a valid URL`);
        }

        if (value && rules.minLength && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
        }
      }

      if (errors.length > 0) {
        logger.warn('Validation failed', { errors, body: req.body });
        return res.status(400).json({ errors });
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error', { error: error.message });
      res.status(500).json({ error: 'Validation error' });
    }
  };
};

// Middleware to prevent common attacks
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

// Rate limiting middleware
const rateLimitMiddleware = (windowMs = 60000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const requestTimes = requests.get(key).filter(time => time > windowStart);

    if (requestTimes.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { ip: key });
      return res.status(429).json({ error: 'Too many requests' });
    }

    requestTimes.push(now);
    requests.set(key, requestTimes);

    next();
  };
};

module.exports = {
  validateRequest,
  securityHeaders,
  rateLimitMiddleware,
  isValidEmail,
  isValidObjectId,
  isValidUrl,
  sanitizeInput
};