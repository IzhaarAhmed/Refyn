const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repositoryUrl: { type: String, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  accessToken: { type: String, required: true }, // Encrypted
  prNumber: Number,
  prTitle: String,
  prDescription: String,
  prHead: String,
  prBase: String,
  prLabels: [String],
  fetchedAt: Date,
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
githubIntegrationSchema.index({ user: 1, repositoryUrl: 1 });
githubIntegrationSchema.index({ review: 1 });

module.exports = mongoose.model('GitHubIntegration', githubIntegrationSchema);