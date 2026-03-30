const express = require('express');
const Review = require('../models/Review');
const AnalysisResult = require('../models/AnalysisResult');
const Job = require('../models/Job');
const ComplexityAnalyzer = require('../services/analyzers/ComplexityAnalyzer');
const RefactoringAnalyzer = require('../services/analyzers/RefactoringAnalyzer');
const SecurityAnalyzer = require('../services/analyzers/SecurityAnalyzer');
const JobQueue = require('../services/JobQueue');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Analyze review code
router.post('/:reviewId/analyze', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Create analysis job
    const jobId = await JobQueue.enqueue({
      id: `analysis-${req.params.reviewId}-${Date.now()}`,
      type: 'analyze_code',
      data: {
        reviewId: req.params.reviewId,
        originalCode: review.originalCode,
        changedCode: review.changedCode
      }
    });

    // Save job to database
    const job = new Job({
      jobId,
      jobType: 'analyze_code',
      status: 'pending',
      review: req.params.reviewId,
      metadata: {
        analyzer: 'multi_analyzer'
      }
    });

    await job.save();
    logger.info('Analysis job created', { reviewId: req.params.reviewId, jobId });

    res.status(202).json({
      message: 'Analysis started',
      jobId
    });
  } catch (error) {
    logger.error('Failed to start analysis', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get analysis results
router.get('/:reviewId/results', auth, async (req, res) => {
  try {
    const analysis = await AnalysisResult.findOne({ review: req.params.reviewId });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      reviewId: req.params.reviewId,
      overallScore: analysis.overallScore,
      complexity: analysis.complexityAnalysis,
      refactoring: analysis.refactoringAnalysis,
      security: analysis.securityAnalysis,
      analyzedAt: analysis.analyzedAt
    });
  } catch (error) {
    logger.error('Failed to fetch analysis results', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Run specific analyzer
router.post('/:reviewId/analyze/:analyzerType', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { analyzerType } = req.params;
    let analyzerClass;

    switch (analyzerType) {
      case 'complexity':
        analyzerClass = ComplexityAnalyzer;
        break;
      case 'refactoring':
        analyzerClass = RefactoringAnalyzer;
        break;
      case 'security':
        analyzerClass = SecurityAnalyzer;
        break;
      default:
        return res.status(400).json({ error: 'Unknown analyzer type' });
    }

    const analyzer = new analyzerClass(req.params.reviewId);
    const results = await analyzer.analyze(review.originalCode, review.changedCode);

    logger.info('Analysis completed', {
      reviewId: req.params.reviewId,
      analyzerType
    });

    res.json({
      analyzer: analyzerType,
      results
    });
  } catch (error) {
    logger.error('Analysis failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Save analysis results
router.post('/:reviewId/save-analysis', auth, async (req, res) => {
  try {
    const { complexityAnalysis, refactoringAnalysis, securityAnalysis } = req.body;

    let analysis = await AnalysisResult.findOne({ review: req.params.reviewId });

    if (!analysis) {
      analysis = new AnalysisResult({
        review: req.params.reviewId
      });
    }

    if (complexityAnalysis) analysis.complexityAnalysis = complexityAnalysis;
    if (refactoringAnalysis) analysis.refactoringAnalysis = refactoringAnalysis;
    if (securityAnalysis) analysis.securityAnalysis = securityAnalysis;

    // Calculate overall score
    const scores = [];
    if (complexityAnalysis?.summary?.improvement) scores.push(70);
    if (refactoringAnalysis?.summary?.patternsDetected) scores.push(80);
    if (securityAnalysis?.summary?.securityScore) scores.push(securityAnalysis.summary.securityScore);

    analysis.overallScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

    analysis.analyzedAt = new Date();
    await analysis.save();

    logger.info('Analysis results saved', { reviewId: req.params.reviewId });

    res.json({
      message: 'Analysis saved',
      overallScore: analysis.overallScore
    });
  } catch (error) {
    logger.error('Failed to save analysis', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;