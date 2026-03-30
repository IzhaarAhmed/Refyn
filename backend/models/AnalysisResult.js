const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  complexityAnalysis: mongoose.Schema.Types.Mixed,
  refactoringAnalysis: mongoose.Schema.Types.Mixed,
  securityAnalysis: mongoose.Schema.Types.Mixed,
  overallScore: Number, // 0-100
  analyzedAt: { type: Date, default: Date.now },
  analyzedBy: String, // Analyzer version or name
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);