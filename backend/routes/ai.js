const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const aiService = require('../services/aiService');

const router = express.Router();

// Helper to fetch review and return code
async function getReviewCode(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return null;
  }
  return review;
}

// AI Diff Summary
router.post('/:id/diff-summary', auth, async (req, res) => {
  try {
    const review = await getReviewCode(req, res);
    if (!review) return;
    const result = await aiService.diffSummary(review.originalCode, review.changedCode);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Code Review Suggestions
router.post('/:id/review-suggestions', auth, async (req, res) => {
  try {
    const review = await getReviewCode(req, res);
    if (!review) return;
    const result = await aiService.reviewSuggestions(review.originalCode, review.changedCode);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Risk Detection
router.post('/:id/risk-detection', auth, async (req, res) => {
  try {
    const review = await getReviewCode(req, res);
    if (!review) return;
    const result = await aiService.riskDetection(review.originalCode, review.changedCode);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Test Case Generation
router.post('/:id/test-generation', auth, async (req, res) => {
  try {
    const review = await getReviewCode(req, res);
    if (!review) return;
    const result = await aiService.testCaseGeneration(review.changedCode);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Code Explanation
router.post('/:id/code-explanation', auth, async (req, res) => {
  try {
    const review = await getReviewCode(req, res);
    if (!review) return;
    const result = await aiService.codeExplanation(review.changedCode);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
