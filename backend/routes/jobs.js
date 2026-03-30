const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get job status
router.get('/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });
  } catch (error) {
    logger.error('Failed to fetch job status', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs for review
router.get('/review/:reviewId', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ review: req.params.reviewId });

    res.json(
      jobs.map(job => ({
        jobId: job.jobId,
        jobType: job.jobType,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt
      }))
    );
  } catch (error) {
    logger.error('Failed to fetch jobs for review', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Poll job status (for long-polling)
router.get('/:jobId/poll', auth, async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Return immediately if job is complete or failed
    if (job.status === 'completed' || job.status === 'failed') {
      return res.json({
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error
      });
    }

    // For processing jobs, implement long polling with timeout
    const timeout = req.query.timeout || 30000; // 30 seconds default
    const startTime = Date.now();

    const pollInterval = setInterval(async () => {
      const updatedJob = await Job.findOne({ jobId: req.params.jobId });

      if (
        updatedJob.status === 'completed' ||
        updatedJob.status === 'failed' ||
        Date.now() - startTime > timeout
      ) {
        clearInterval(pollInterval);

        res.json({
          jobId: updatedJob.jobId,
          status: updatedJob.status,
          progress: updatedJob.progress,
          result: updatedJob.result,
          error: updatedJob.error
        });
      }
    }, 1000); // Check every second
  } catch (error) {
    logger.error('Failed to poll job', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Cancel job
router.post('/:jobId/cancel', auth, async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'processing') {
      job.status = 'cancelled';
      await job.save();
      logger.info('Job cancelled', { jobId: req.params.jobId });
    }

    res.json({ message: 'Job cancelled' });
  } catch (error) {
    logger.error('Failed to cancel job', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;