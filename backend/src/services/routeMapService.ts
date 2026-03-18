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
  private readonly apiKey = process.env.GEMINI_API_KEY || 'sk-Pzu0Kcqo8K2wFfMJaQcKxFCCOyj2zWBhc2bVWvfzpkll2tOV';
  private readonly apiBaseUrl = 'https://docs.newapi.pro/v1beta/models';
  private readonly model = 'gemini-2.0-flash-exp'; // 可以通过环境变量配置

  /**
   * Generate route map using Gemini content generation API
   * Automatically adds prompt to convert text to route map with Chinese labels
   */
  async generateRouteMap(params: RouteMapParams): Promise<RouteMapResponse> {
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
   * Call Gemini content generation API with timeout
   */
  private async callGeminiAPIWithTimeout(
    prompt: string,
    timeoutMs: number
  ): Promise<{ message: string; imageUrl?: string }> {
    return aiQueue.add(async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('路线图生成请求超时')), timeoutMs);
      });

      try {
        if (!this.apiKey) {
          logger.error('GEMINI_API_KEY is not configured');
          throw new Error('GEMINI_API_KEY is not configured');
        }

        logger.info('Calling Gemini content generation API with key length:', this.apiKey.length);
        
        const apiUrl = `${this.apiBaseUrl}/${this.model}:generateContent/`;
        
        logger.info('API URL:', apiUrl);
        
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
        };

        const apiPromise = fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`API error (${response.status}):`, errorText);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        logger.info('Gemini API response received');
        
        // Extract text and image from response
        // Gemini API response structure: { candidates: [{ content: { parts: [...] } }] }
        const candidates = data?.candidates || [];
        if (candidates.length === 0) {
          logger.error('No candidates in response:', data);
          throw new Error('API未返回有效内容');
        }

        const parts = candidates[0]?.content?.parts || [];
        let textContent = '';
        let imageUrl = '';

        for (const part of parts) {
          if (part.text) {
            textContent += part.text;
          }
          if (part.inlineData?.data) {
            // Base64 encoded image
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          }
          if (part.fileData?.fileUri) {
            // File URI
            imageUrl = part.fileData.fileUri;
          }
        }

        if (!textContent && !imageUrl) {
          logger.error('No content in response:', data);
          throw new Error('API未返回文本或图片内容');
        }

        logger.info('Gemini API call successful');
        
        // Format response message
        let message = textContent || '路线图已生成！';
        if (imageUrl) {
          message += `\n\n![路线图](${imageUrl})\n\n您可以查看上方的路线图，其中包含了您的旅行路线和时间安排。`;
        }

        return {
          message,
          imageUrl: imageUrl || undefined
        };
      } catch (error: any) {
        logger.error('Gemini API call failed:', error);
        
        // If it's a timeout or API error, provide a fallback response
        const isTimeout = error.message?.includes('超时');
        const isForbidden = error.status === 403;
        const isRateLimit = error.status === 429;
        
        if (isTimeout || isForbidden || isRateLimit) {
          logger.warn('Using fallback response due to API issues');
          throw new Error('API调用失败');
        }
        
        throw error;
      }
    });
  }

  /**
   * Provide a fallback response when service is unavailable
   */
  private getFallbackResponse(): string {
    return '抱歉，路线图生成服务暂时不可用。请稍后再试，或者您可以继续与我对话，我会尽力帮助您规划旅行路线。\n\n如果您需要，我可以为您提供文字版的详细路线规划。';
  }
}

export const routeMapService = new RouteMapService();
