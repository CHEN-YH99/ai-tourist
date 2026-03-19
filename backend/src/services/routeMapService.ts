import { logger } from '../utils/logger.js';
import { aiQueue } from '../utils/aiQueue.js';

export interface RouteMapParams {
  content: string;
}

export interface RouteMapResponse {
  message: string;
  imageUrl?: string;
  timestamp: Date;
}

class RouteMapService {
  private get apiKey() {
    return process.env.GEMINI_API_KEY;
  }
  
  private get apiBaseUrl() {
    return process.env.GEMINI_API_BASE_URL || 'https://docs.newapi.pro/v1beta/models';
  }
  
  private get model() {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
  }

  /**
   * Generate route map using Gemini content generation API
   * Automatically adds prompt to convert text to route map with Chinese labels
   */
  async generateRouteMap(params: RouteMapParams): Promise<RouteMapResponse> {
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY is not configured, using fallback response');
      return this.getFallbackResponse();
    }
    const { content } = params;

    try {
      // Add the prompt to convert text to route map with Chinese labels
      const enhancedPrompt = `请将以下旅游攻略转化为清晰的路线图，使用中文标注所有地点和说明，包含地点连接线和时间安排：\n\n${content}`;

      // Call Gemini API with timeout using queue
      const result = await this.callGeminiAPIWithTimeout(enhancedPrompt, 60000);

      return {
        message: result.message,
        imageUrl: result.imageUrl,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Route map generation error:', error);
      
      // Provide fallback response
      const fallbackMessage = this.getFallbackResponse();
      
      return {
        message: fallbackMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Call Gemini API with retry mechanism and circuit breaker
   */
  private async callGeminiAPIWithTimeout(
    prompt: string,
    timeoutMs: number
  ): Promise<{ message: string; imageUrl?: string }> {
    return aiQueue.add(async () => {
      const maxRetries = 3
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const startTime = Date.now()
          const result = await this.callGeminiAPI(prompt, timeoutMs)
          const duration = Date.now() - startTime
          
          logger.info(`Gemini API call completed in ${duration}ms`)
          return result
        } catch (error: any) {
          lastError = error
          logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message)

          // 不重试的错误类型
          if (this.isAuthError(error) || error.status === 400 || error.status === 404) {
            throw error
          }

          // 速率限制错误，使用更长的退避时间
          if (this.isRateLimitError(error)) {
            const delay = Math.min(5000 * Math.pow(2, attempt - 1), 30000)
            logger.warn(`Rate limited, waiting ${delay}ms before retry`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          // 指数退避
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
            logger.info(`Retrying after ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      throw lastError || new Error('Max retries exceeded')
    })
  }

  /**
   * Call Gemini API once
   */
  private async callGeminiAPI(
    prompt: string,
    timeoutMs: number
  ): Promise<{ message: string; imageUrl?: string }> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('路线图生成请求超时')), timeoutMs)
    })

    if (!this.apiKey) {
      logger.error('GEMINI_API_KEY is not configured')
      throw new Error('GEMINI_API_KEY is not configured')
    }

    logger.info('Calling Gemini content generation API')

    const apiUrl = `${this.apiBaseUrl}/${this.model}:generateContent/`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: 'LARGE'
        }
      }
    }

    const apiPromise = fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    const response = await Promise.race([apiPromise, timeoutPromise])

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`API error (${response.status}):`, errorText)
      const error: any = new Error(`API request failed: ${response.status}`)
      error.status = response.status
      throw error
    }

    const data: any = await response.json()
    logger.info('Gemini API response received')

    // Extract text and image from response
    const candidates = data?.candidates || []
    if (candidates.length === 0) {
      logger.error('No candidates in response:', data)
      throw new Error('API未返回有效内容')
    }

    const parts = candidates[0]?.content?.parts || []
    let textContent = ''
    let imageUrl = ''

    for (const part of parts) {
      if (part.text) {
        textContent += part.text
      }
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png'
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`
      }
      if (part.fileData?.fileUri) {
        imageUrl = part.fileData.fileUri
      }
    }

    if (!textContent && !imageUrl) {
      logger.error('No content in response:', data)
      throw new Error('API未返回文本或图片内容')
    }

    logger.info('Gemini API call successful')

    // Format response message
    let message = textContent || '路线图已生成！'
    if (imageUrl) {
      message += `\n\n![路线图](${imageUrl})\n\n您可以查看上方的路线图，其中包含了您的旅行路线和时间安排。`
    }

    return {
      message,
      imageUrl: imageUrl || undefined
    }
  }

  /**
   * Check if error is authentication related
   */
  private isAuthError(error: any): boolean {
    return error.status === 401 || error.status === 403
  }

  /**
   * Check if error is rate limit
   */
  private isRateLimitError(error: any): boolean {
    return error.status === 429
  }

  /**
   * Provide a fallback response when service is unavailable
   */
  private getFallbackResponse(): string {
    return '抱歉，路线图生成服务暂时不可用。请稍后再试，或者您可以继续与我对话，我会尽力帮助您规划旅行路线。\n\n如果您需要，我可以为您提供文字版的详细路线规划。';
  }
}

export const routeMapService = new RouteMapService();
