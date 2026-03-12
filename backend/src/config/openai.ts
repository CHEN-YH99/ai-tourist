import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate API key on startup
if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not configured');
  throw new Error('OPENAI_API_KEY environment variable is required');
}

logger.info('OpenAI client initialized successfully');

export default openai;
