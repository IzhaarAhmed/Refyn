const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// const logger = require('./utils/logger');
// const { securityHeaders, rateLimitMiddleware } = require('./middleware/validation');

const app = express();

// Logging
// logger.info('Application starting', { env: process.env.NODE_ENV });
console.log('Application starting');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(securityHeaders);
// app.use(rateLimitMiddleware(
//   process.env.RATE_LIMIT_WINDOW_MS || 60000,
//   process.env.RATE_LIMIT_MAX_REQUESTS || 100
// ));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // logger.info('MongoDB connected', { uri: process.env.MONGO_URI });
    console.log('MongoDB connected');
  })
  .catch(err => {
    // logger.error('MongoDB connection failed', { error: err.message });
    console.error('MongoDB connection failed:', err.message);
    console.log('Server will continue without database connection for development');
  });

// Routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');
const githubRoutes = require('./routes/github');
const jobRoutes = require('./routes/jobs');
const analysisRoutes = require('./routes/analysis');

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // logger.error('Unhandled error', { error: err.message, stack: err.stack });
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  // logger.warn('Route not found', { path: req.path, method: req.method });
  console.warn('Route not found:', req.path);
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // logger.info(`Server running on port ${PORT}`, { port: PORT });
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;