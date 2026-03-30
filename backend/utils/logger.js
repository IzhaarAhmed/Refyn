// Simple console-based logger as fallback
const logger = {
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, meta);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }
};

module.exports = logger;