const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  jobType: { type: String, required: true }, // 'analyze_code', 'fetch_github', 'generate_report'
  status: { type: String, default: 'pending' }, // pending, processing, completed, failed
  progress: { type: Number, default: 0 }, // 0-100
  result: mongoose.Schema.Types.Mixed,
  error: String,
  retries: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Job', jobSchema);