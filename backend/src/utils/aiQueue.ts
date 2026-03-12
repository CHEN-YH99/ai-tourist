import { logger } from './logger.js';

/**
 * Simple queue implementation for AI requests
 * Limits concurrent requests and implements basic rate limiting
 */
class AIRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private readonly maxConcurrent = 5; // Maximum concurrent AI requests
  private readonly requestsPerMinute = 10; // Rate limit
  private requestTimestamps: number[] = [];

  /**
   * Add a request to the queue
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedFn = async () => {
        try {
          // Check rate limit
          await this.checkRateLimit();
          
          this.activeRequests++;
          this.requestTimestamps.push(Date.now());
          
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      this.queue.push(wrappedFn);
      this.processQueue();
    });
  }

  /**
   * Process the next item in the queue if capacity allows
   */
  private processQueue() {
    if (this.activeRequests < this.maxConcurrent && this.queue.length > 0) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  /**
   * Check if we're within rate limits, wait if necessary
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    // If we've hit the rate limit, wait
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      requestsInLastMinute: this.requestTimestamps.filter(
        (t) => t > Date.now() - 60000
      ).length,
    };
  }
}

// Export singleton instance
export const aiQueue = new AIRequestQueue();
