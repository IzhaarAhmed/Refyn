const express = require('express');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comments for a review
router.get('/:reviewId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ review: req.params.reviewId }).populate('user');
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a comment
router.post('/:reviewId', auth, async (req, res) => {
  const { text, line } = req.body;
  try {
    const comment = new Comment({
      review: req.params.reviewId,
      user: req.user.id,
      text,
      line
    });
    await comment.save();
    await comment.populate('user');
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;