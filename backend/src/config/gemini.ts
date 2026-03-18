import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

let geminiClient: OpenAI | null = null;

// Lazy initialization of Gemini client (using OpenAI-compatible API)
function getGeminiClient(): OpenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseURL = process.env.GEMINI_BASE_URL;
    
    if (!apiKey || apiKey === 'sk-your-gemini-api-key-here') {
      logger.error('GEMINI_API_KEY is not configured or is using placeholder value');
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    const config: any = { 
      apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2,  // Retry failed requests
    };
    
    // Add custom base URL if provided
    if (baseURL) {
      config.baseURL = baseURL;
      logger.info(`Gemini client using base URL: ${baseURL}`);
    }
    
    geminiClient = new OpenAI(config);
    logger.info('Gemini client initialized successfully');
  }
  
  return geminiClient;
}

export default getGeminiClient;
