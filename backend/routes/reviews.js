const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendReviewFinalizedEmail } = require('../services/emailService');

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
    const review = await Review.findById(req.params.id).populate('author reviewers comments.user votes.user');
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

// Add reviewers
router.post('/:id/reviewers', auth, async (req, res) => {
  const { reviewers } = req.body;
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const usernames = reviewers.split(',').map(u => u.trim()).filter(Boolean);
    if (usernames.length === 0) {
      return res.status(400).json({ error: 'No valid usernames provided' });
    }

    const users = await User.find({ username: { $in: usernames } });
    if (users.length === 0) {
      return res.status(404).json({ error: 'No matching users found' });
    }

    const existingIds = review.reviewers.map(id => id.toString());
    const newIds = users
      .map(u => u._id)
      .filter(id => !existingIds.includes(id.toString()));

    review.reviewers.push(...newIds);
    await review.save();
    await review.populate('author reviewers comments.user');
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vote on review (approve/reject)
router.put('/:id/status', auth, async (req, res) => {
  const { status, comment } = req.body;
  try {
    const review = await Review.findById(req.params.id).populate('author reviewers comments.user votes.user');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Author cannot vote on their own review
    if (review.author._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: 'Author cannot approve or reject their own review' });
    }

    // Cannot vote if review is already finalized
    if (review.status !== 'open') {
      return res.status(400).json({ error: 'This review has already been ' + review.status });
    }

    // Rejection requires a comment
    if (status === 'rejected' && (!comment || !comment.trim())) {
      return res.status(400).json({ error: 'A comment is required when rejecting a review' });
    }

    // Check if user already voted
    const existingVote = review.votes.find(v => v.user._id.toString() === req.user._id.toString());
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this review' });
    }

    // Add vote
    review.votes.push({ user: req.user._id, vote: status });

    // If rejecting, add the mandatory comment
    if (status === 'rejected' && comment) {
      review.comments.push({ user: req.user._id, text: comment, line: null });
    }

    // Check majority
    const totalReviewers = review.reviewers.length;
    const approvals = review.votes.filter(v => v.vote === 'approved').length;
    const rejections = review.votes.filter(v => v.vote === 'rejected').length;
    const majority = Math.floor(totalReviewers / 2) + 1;

    if (approvals >= majority) {
      review.status = 'approved';
    } else if (rejections >= majority) {
      review.status = 'rejected';
    }

    await review.save();
    await review.populate('author reviewers comments.user votes.user');

    // Notify author when review is finalized
    if (review.status !== 'open') {
      sendReviewFinalizedEmail(review.author.email, {
        reviewTitle: review.title,
        status: review.status,
        authorName: review.author.username
      }).catch(err => console.error('Review finalized email failed:', err));
    }

    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;