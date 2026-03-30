const logger = require('../utils/logger');

class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async enqueue(job) {
    const jobData = {
      id: job.id || Date.now().toString(),
      type: job.type,
      data: job.data,
      status: 'pending',
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.queue.push(jobData);
    logger.info(`Job enqueued: ${jobData.id}`, { type: job.type });

    if (!this.processing) {
      this.processQueue();
    }

    return jobData.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];

      try {
        job.status = 'processing';
        job.updatedAt = new Date();

        // Execute the job
        await this.executeJob(job);

        job.status = 'completed';
        job.completedAt = new Date();
        this.queue.shift();

        logger.info(`Job completed: ${job.id}`, { type: job.type });
      } catch (error) {
        logger.error(`Job failed: ${job.id}`, { type: job.type, error: error.message });

        if (job.retries < this.maxRetries) {
          job.retries += 1;
          job.status = 'pending';
          job.updatedAt = new Date();

          logger.warn(`Job will be retried: ${job.id}`, { retries: job.retries });

          // Wait before retrying
          await this.delay(this.retryDelay);
        } else {
          job.status = 'failed';
          job.error = error.message;
          job.failedAt = new Date();
          this.queue.shift();

          logger.error(`Job permanently failed: ${job.id}`, { type: job.type });
        }
      }
    }

    this.processing = false;
  }

  async executeJob(job) {
    // Handle different job types
    switch (job.type) {
      case 'analyze_code':
        return this.analyzeCode(job.data);
      case 'fetch_github':
        return this.fetchGitHub(job.data);
      case 'generate_report':
        return this.generateReport(job.data);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  async analyzeCode(data) {
    // Placeholder for code analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ analyzed: true });
      }, 1000);
    });
  }

  async fetchGitHub(data) {
    // Placeholder for GitHub fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ fetched: true });
      }, 1000);
    });
  }

  async generateReport(data) {
    // Placeholder for report generation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ report: true });
      }, 1000);
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStatus(jobId) {
    const job = this.queue.find(j => j.id === jobId);
    return job || null;
  }

  getQueue() {
    return this.queue;
  }
}

module.exports = new JobQueue();