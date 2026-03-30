const express = require('express');
const GitHubIntegration = require('../models/GitHubIntegration');
const Review = require('../models/Review');
const GitHubService = require('../services/GitHubService');
const auth = require('../middleware/auth');
const { validateRequest, isValidUrl } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Connect GitHub repository
router.post('/connect', auth, async (req, res) => {
  try {
    const { repositoryUrl, accessToken } = req.body;

    // Validate inputs
    if (!isValidUrl(repositoryUrl)) {
      return res.status(400).json({ error: 'Invalid repository URL' });
    }

    // Validate GitHub token
    const isValid = await GitHubService.validateCredentials(accessToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid GitHub token' });
    }

    // Parse repository URL
    const urlParts = repositoryUrl.replace('https://github.com/', '').split('/');
    const [owner, repo] = urlParts;

    // Check if already connected
    let integration = await GitHubIntegration.findOne({
      user: req.user.id,
      repositoryUrl
    });

    if (integration) {
      integration.accessToken = accessToken;
      integration.updatedAt = new Date();
    } else {
      integration = new GitHubIntegration({
        user: req.user.id,
        repositoryUrl,
        owner,
        repo,
        accessToken
      });
    }

    await integration.save();
    logger.info('GitHub repository connected', { user: req.user.id, repo: repositoryUrl });

    res.status(201).json({
      message: 'GitHub repository connected',
      integration: {
        id: integration._id,
        repositoryUrl: integration.repositoryUrl,
        owner: integration.owner,
        repo: integration.repo
      }
    });
  } catch (error) {
    logger.error('Failed to connect GitHub repository', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Fetch PR and create review
router.post('/import-pr', auth, async (req, res) => {
  try {
    const { integrationId, prNumber } = req.body;

    const integration = await GitHubIntegration.findById(integrationId);
    if (!integration || integration.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch PR details from GitHub
    const prData = await GitHubService.fetchPullRequest(
      integration.owner,
      integration.repo,
      prNumber,
      integration.accessToken
    );

    // Fetch PR diff
    const diffData = await GitHubService.fetchPullRequestDiff(
      integration.owner,
      integration.repo,
      prNumber,
      integration.accessToken
    );

    // Create review from PR
    const review = new Review({
      title: prData.title,
      description: prData.description,
      originalCode: '', // Would need to parse diff properly
      changedCode: diffData || '',
      author: req.user.id,
      reviewers: []
    });

    await review.save();

    // Link integration to review
    integration.review = review._id;
    integration.prNumber = prNumber;
    integration.prTitle = prData.title;
    integration.prDescription = prData.description;
    integration.prHead = prData.head;
    integration.prBase = prData.base;
    integration.prLabels = prData.labels;
    integration.fetchedAt = new Date();
    await integration.save();

    logger.info('PR imported as review', { prNumber, reviewId: review._id });

    res.status(201).json({
      message: 'Pull request imported successfully',
      review: {
        id: review._id,
        title: review.title,
        prNumber: prNumber
      }
    });
  } catch (error) {
    logger.error('Failed to import PR', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get connected integrations
router.get('/integrations', auth, async (req, res) => {
  try {
    const integrations = await GitHubIntegration.find({ user: req.user.id }).select(
      '-accessToken'
    );

    res.json(integrations);
  } catch (error) {
    logger.error('Failed to fetch integrations', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Disconnect repository
router.delete('/disconnect/:id', auth, async (req, res) => {
  try {
    const integration = await GitHubIntegration.findById(req.params.id);

    if (!integration || integration.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await GitHubIntegration.deleteOne({ _id: req.params.id });
    logger.info('GitHub repository disconnected', { integrationId: req.params.id });

    res.json({ message: 'Repository disconnected' });
  } catch (error) {
    logger.error('Failed to disconnect repository', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;