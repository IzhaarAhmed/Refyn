const axios = require('axios');
const logger = require('../utils/logger');

class GitHubService {
  constructor() {
    this.apiBaseUrl = 'https://api.github.com';
  }

  async fetchPullRequest(owner, repo, prNumber, accessToken) {
    try {
      const url = `${this.apiBaseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      logger.info('Pull request fetched from GitHub', { owner, repo, prNumber });

      return {
        prNumber: response.data.number,
        title: response.data.title,
        description: response.data.body,
        head: response.data.head.ref,
        base: response.data.base.ref,
        author: response.data.user.login,
        labels: response.data.labels.map(l => l.name),
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        url: response.data.html_url
      };
    } catch (error) {
      logger.error('Failed to fetch pull request from GitHub', {
        owner,
        repo,
        prNumber,
        error: error.message
      });
      throw new Error(`Failed to fetch PR: ${error.message}`);
    }
  }

  async fetchPullRequestDiff(owner, repo, prNumber, accessToken) {
    try {
      const url = `${this.apiBaseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3.diff'
        }
      });

      logger.info('Pull request diff fetched from GitHub', { owner, repo, prNumber });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch PR diff from GitHub', {
        owner,
        repo,
        prNumber,
        error: error.message
      });
      throw error;
    }
  }

  async validateCredentials(accessToken) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/user`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      logger.info('GitHub credentials validated', { user: response.data.login });
      return true;
    } catch (error) {
      logger.warn('GitHub credentials validation failed', { error: error.message });
      return false;
    }
  }

  async postComment(owner, repo, issueNumber, comment, accessToken) {
    try {
      const url = `${this.apiBaseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
      const response = await axios.post(
        url,
        { body: comment },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info('Comment posted to GitHub', { owner, repo, issueNumber });
      return response.data;
    } catch (error) {
      logger.error('Failed to post comment to GitHub', {
        owner,
        repo,
        issueNumber,
        error: error.message
      });
      throw error;
    }
  }

  async createCheckRun(owner, repo, headSha, checkData, accessToken) {
    try {
      const url = `${this.apiBaseUrl}/repos/${owner}/${repo}/check-runs`;
      const response = await axios.post(
        url,
        {
          name: checkData.name,
          head_sha: headSha,
          status: checkData.status,
          conclusion: checkData.conclusion,
          output: {
            title: checkData.title,
            summary: checkData.summary,
            text: checkData.text
          }
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info('Check run created on GitHub', { owner, repo });
      return response.data;
    } catch (error) {
      logger.error('Failed to create check run on GitHub', {
        owner,
        repo,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new GitHubService();