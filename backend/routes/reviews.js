const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  const { title, description, originalCode, changedCode, reviewers } = req.body;
  try {
    // Convert usernames to user IDs
    let reviewerIds = [];
    if (reviewers) {
      const usernames = reviewers.split(',').map(u => u.trim());
      const users = await User.find({ username: { $in: usernames } });
      reviewerIds = users.map(u => u._id);
    }

    const review = new Review({
      title,
      description,
      originalCode,
      changedCode,
      author: req.user.id,
      reviewers: reviewerIds
    });
    await review.save();
    await review.populate('author reviewers');
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get reviews
router.get('/', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ $or: [{ author: req.user.id }, { reviewers: req.user.id }] })
      .populate('author reviewers')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single review
router.get('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('author reviewers comments.user');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  const { text, line } = req.body;
  try {
    const review = await Review.findById(req.params.id);
    review.comments.push({ user: req.user.id, text, line });
    await review.save();
    await review.populate('comments.user');
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('author reviewers comments.user');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;