import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

let openaiClient: OpenAI | null = null;

// Lazy initialization of OpenAI client
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      logger.error('OPENAI_API_KEY is not configured or is using placeholder value');
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    const config: any = { 
      apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2,  // Retry failed requests
    };
    
    // Add custom base URL if provided
    if (baseURL) {
      config.baseURL = baseURL;
      logger.info(`OpenAI client using custom base URL: ${baseURL}`);
    }
    
    openaiClient = new OpenAI(config);
    logger.info('OpenAI client initialized successfully');
  }
  
  return openaiClient;
}

export default getOpenAIClient;
