import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

let openaiClient: OpenAI | null = null;

// Lazy initialization of OpenAI client
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      logger.error('OPENAI_API_KEY is not configured or is using placeholder value');
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    openaiClient = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized successfully');
  }
  
  return openaiClient;
}

export default getOpenAIClient;
