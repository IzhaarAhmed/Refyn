const GitHubService = require('../services/GitHubService');

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('GitHubService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPullRequest', () => {
    test('should fetch PR details successfully', async () => {
      const mockPRData = {
        data: {
          number: 123,
          title: 'Add feature X',
          body: 'This PR adds feature X',
          head: { ref: 'feature/x' },
          base: { ref: 'main' },
          user: { login: 'testuser' },
          labels: [{ name: 'enhancement' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          html_url: 'https://github.com/owner/repo/pull/123'
        }
      };

      axios.get.mockResolvedValue(mockPRData);

      const result = await GitHubService.fetchPullRequest('owner', 'repo', 123, 'token');

      expect(result).toBeDefined();
      expect(result.prNumber).toBe(123);
      expect(result.title).toBe('Add feature X');
      expect(result.labels).toContain('enhancement');
    });

    test('should handle errors when fetching PR', async () => {
      axios.get.mockRejectedValue(new Error('API error'));

      await expect(
        GitHubService.fetchPullRequest('owner', 'repo', 123, 'invalid-token')
      ).rejects.toThrow('Failed to fetch PR');
    });
  });

  describe('validateCredentials', () => {
    test('should validate GitHub credentials successfully', async () => {
      axios.get.mockResolvedValue({
        data: { login: 'testuser' }
      });

      const result = await GitHubService.validateCredentials('valid-token');

      expect(result).toBe(true);
    });

    test('should return false for invalid credentials', async () => {
      axios.get.mockRejectedValue(new Error('Unauthorized'));

      const result = await GitHubService.validateCredentials('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('postComment', () => {
    test('should post comment to GitHub issue', async () => {
      const mockResponse = {
        data: {
          id: 1,
          body: 'Test comment',
          user: { login: 'testuser' }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await GitHubService.postComment('owner', 'repo', 123, 'Test comment', 'token');

      expect(result).toBeDefined();
      expect(result.body).toBe('Test comment');
    });

    test('should handle errors when posting comment', async () => {
      axios.post.mockRejectedValue(new Error('Failed to post'));

      await expect(
        GitHubService.postComment('owner', 'repo', 123, 'comment', 'token')
      ).rejects.toThrow();
    });
  });
});
