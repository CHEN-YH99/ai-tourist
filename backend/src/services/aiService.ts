import openai from '../config/openai.js';
import { logger } from '../utils/logger.js';
import { aiQueue } from '../utils/aiQueue.js';
import { Conversation, IConversation } from '../models/Conversation.js';
import { Itinerary, IItinerary } from '../models/Itinerary.js';
import { Destination } from '../models/Destination.js';
import mongoose from 'mongoose';

export interface ChatParams {
  userId: string | null;
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: Date;
}

export interface ItineraryParams {
  destination: string;
  days: number;
  budget: number;
  preferences?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class AIService {
  /**
   * Handle AI chat with optional destination data integration
   * Implements 5-second timeout and conversation saving
   */
  async chat(params: ChatParams): Promise<ChatResponse> {
    const { userId, message, conversationId } = params;

    try {
      // Load existing conversation if provided and valid
      let conversation: IConversation | null = null;
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          logger.warn(`Conversation not found: ${conversationId}`);
        }
      } else if (conversationId) {
        logger.warn(`Invalid conversationId format: ${conversationId}`);
      }

      // Check if message mentions a destination and fetch relevant data
      const destinationData = await this.getDestinationContext(message);

      // Build conversation history for context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `你是一个专业的旅游助手，帮助用户规划旅行和回答旅游相关问题。${
            destinationData
              ? `\n\n以下是相关目的地信息：\n${destinationData}`
              : ''
          }`,
        },
      ];

      // Add conversation history if exists
      if (conversation) {
        conversation.messages.forEach((msg) => {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message,
      });

      // Call OpenAI with timeout using queue (60 seconds timeout)
      const aiResponse = await this.callOpenAIWithTimeout(messages, 60000);

      // Save conversation for logged-in users
      if (userId) {
        if (conversation) {
          // Update existing conversation
          conversation.messages.push(
            {
              role: 'user',
              content: message,
              timestamp: new Date(),
            },
            {
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date(),
            }
          );
          await conversation.save();
        } else {
          // Create new conversation
          conversation = await Conversation.create({
            userId: new mongoose.Types.ObjectId(userId),
            messages: [
              {
                role: 'user',
                content: message,
                timestamp: new Date(),
              },
              {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
              },
            ],
            title: message.substring(0, 50), // Use first 50 chars as title
          });
        }
      }

      return {
        conversationId: conversation?._id.toString() || '',
        message: aiResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('AI chat error:', error);
      
      // Always provide a fallback response instead of throwing an error
      // This ensures the user gets a helpful message instead of a 500 error
      const fallbackMessage = this.getFallbackResponse(message);
      
      // Save the user message and fallback response for logged-in users
      if (userId) {
        try {
          let conversation: IConversation | null = null;
          if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
            conversation = await Conversation.findById(conversationId);
          }
          
          if (conversation) {
            // Update existing conversation
            conversation.messages.push(
              {
                role: 'user',
                content: message,
                timestamp: new Date(),
              },
              {
                role: 'assistant',
                content: fallbackMessage,
                timestamp: new Date(),
              }
            );
            await conversation.save();
          } else {
            // Create new conversation
            conversation = await Conversation.create({
              userId: new mongoose.Types.ObjectId(userId),
              messages: [
                {
                  role: 'user',
                  content: message,
                  timestamp: new Date(),
                },
                {
                  role: 'assistant',
                  content: fallbackMessage,
                  timestamp: new Date(),
                },
              ],
              title: message.substring(0, 50),
            });
          }
          
          return {
            conversationId: conversation._id.toString(),
            message: fallbackMessage,
            timestamp: new Date(),
          };
        } catch (dbError) {
          logger.error('Database error during fallback:', dbError);
        }
      }
      
      return {
        conversationId: conversationId || '',
        message: fallbackMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate travel itinerary with 10-second timeout
   * Validates budget constraints and handles preferences
   */
  async generateItinerary(
    userId: string,
    params: ItineraryParams
  ): Promise<IItinerary> {
    const { destination, days, budget, preferences = [] } = params;

    try {
      // Validate parameters
      if (days < 1 || days > 30) {
        throw new Error('旅行天数必须在1-30天之间');
      }
      if (budget <= 0) {
        throw new Error('预算必须大于0');
      }

      // Get destination information for context
      const destinationInfo = await Destination.findOne({
        $or: [{ name: destination }, { nameEn: destination }],
      });

      // Build prompt for itinerary generation
      const prompt = this.buildItineraryPrompt(
        destination,
        days,
        budget,
        preferences,
        destinationInfo
      );

      // Call OpenAI with timeout
      const aiResponse = await this.callOpenAIWithTimeout(
        [
          {
            role: 'system',
            content:
              '你是一个专业的旅游规划师。请生成详细的旅行攻略，以JSON格式返回。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        10000
      );

      // Parse AI response
      const itineraryContent = this.parseItineraryResponse(aiResponse, days, budget);

      // Validate budget constraint
      const totalBudget = itineraryContent.reduce(
        (sum, day) => sum + day.dailyBudget,
        0
      );
      if (totalBudget > budget) {
        logger.warn(
          `Generated itinerary exceeds budget: ${totalBudget} > ${budget}`
        );
        // Adjust budgets proportionally
        const ratio = budget / totalBudget;
        itineraryContent.forEach((day) => {
          day.dailyBudget = Math.floor(day.dailyBudget * ratio);
          day.activities.forEach((activity: any) => {
            activity.cost = Math.floor(activity.cost * ratio);
          });
          day.meals.forEach((meal: any) => {
            meal.estimatedCost = Math.floor(meal.estimatedCost * ratio);
          });
        });
      }

      // Save itinerary to database
      const itinerary = await Itinerary.create({
        userId: new mongoose.Types.ObjectId(userId),
        destination,
        days,
        budget,
        preferences,
        content: itineraryContent,
        generatedAt: new Date(),
      });

      logger.info(`Itinerary generated for user ${userId}: ${itinerary._id}`);
      return itinerary;
    } catch (error) {
      logger.error('Itinerary generation error:', error);
      if (error instanceof Error) {
        throw new Error(`攻略生成失败: ${error.message}`);
      }
      throw new Error('攻略生成失败，请稍后再试');
    }
  }

  /**
   * Get user's conversation list with pagination
   */
  async getConversations(
    userId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<IConversation>> {
    const skip = (page - 1) * pageSize;

    const [conversations, total] = await Promise.all([
      Conversation.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Conversation.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
    ]);

    return {
      items: conversations as any,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('对话不存在');
    }
    return conversation;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const result = await Conversation.findByIdAndDelete(conversationId);
    if (!result) {
      throw new Error('对话不存在');
    }
    logger.info(`Conversation deleted: ${conversationId}`);
  }

  /**
   * Call OpenAI API with timeout
   */
  private async callOpenAIWithTimeout(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    timeoutMs: number
  ): Promise<string> {
    return aiQueue.add(async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI请求超时')), timeoutMs);
      });

      try {
        const client = openai();
        const apiPromise = client.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'qwen-turbo',  // 使用环境变量配置的模型
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        });

        const completion = await Promise.race([apiPromise, timeoutPromise]);
        const content = completion.choices[0]?.message?.content;

        if (!content) {
          throw new Error('AI未返回有效响应');
        }

        return content;
      } catch (error: any) {
        logger.error('OpenAI API call failed:', error);
        
        // If it's a timeout or API error, provide a fallback response
        const isTimeout = error.message?.includes('超时');
        const isForbidden = error.status === 403;
        const isRateLimit = error.status === 429;
        
        if (isTimeout || isForbidden || isRateLimit) {
          logger.warn('Using fallback response due to API issues');
          const userMessage = messages[messages.length - 1]?.content || '';
          return this.getFallbackResponse(userMessage);
        }
        
        throw error;
      }
    });
  }

  /**
   * Provide a fallback response when AI service is unavailable
   */
  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('你好') || message.includes('hello') || message.includes('hi')) {
      return '你好！很高兴认识你。我是旅游助手，可以帮助你规划旅行、推荐目的地、提供旅游建议等。请告诉我你想去哪里旅游，或者你对什么样的旅行感兴趣？';
    }
    
    if (message.includes('旅游') || message.includes('旅行') || message.includes('攻略')) {
      return '我很乐意帮助你规划旅行！请告诉我：\n1. 你想去哪个目的地？\n2. 计划旅行多少天？\n3. 你的预算是多少？\n4. 你对什么类型的活动感兴趣（文化、自然、美食等）？\n\n这样我可以为你制定更好的旅行计划。';
    }
    
    if (message.includes('酒店') || message.includes('住宿')) {
      return '关于住宿，我可以帮助你：\n- 推荐不同价位的酒店\n- 提供住宿地点建议\n- 分享住宿预订技巧\n\n请告诉我你的目的地和预算，我会为你推荐合适的住宿选择。';
    }
    
    if (message.includes('交通') || message.includes('机票')) {
      return '关于交通和机票，我可以帮助你：\n- 推荐最佳出行方式\n- 提供交通路线建议\n- 分享购票技巧\n\n请告诉我你的出发地和目的地，我会为你提供交通建议。';
    }
    
    if (message.includes('美食') || message.includes('餐厅') || message.includes('吃')) {
      return '我很喜欢讨论美食！请告诉我：\n- 你想去哪个地方？\n- 你喜欢什么类型的菜系？\n- 你的预算范围？\n\n我可以为你推荐当地特色美食和餐厅。';
    }
    
    if (message.includes('景点') || message.includes('景区') || message.includes('看')) {
      return '关于景点和景区，我可以帮助你：\n- 推荐必去景点\n- 提供游览路线\n- 分享参观建议\n\n请告诉我你的目的地，我会为你推荐最值得去的景点。';
    }
    
    return '感谢你的提问！我是旅游助手，可以帮助你规划旅行。请告诉我更多关于你的旅行计划，比如目的地、时间、预算等，我会为你提供更具体的建议。';
  }

  /**
   * Get destination context for chat
   */
  private async getDestinationContext(message: string): Promise<string | null> {
    try {
      // Search for destinations mentioned in the message
      const destinations = await Destination.find({
        $text: { $search: message },
      }).limit(1);

      if (destinations.length === 0) {
        return null;
      }

      const dest = destinations[0];
      return `
目的地：${dest.name}
地区：${dest.region}, ${dest.country}
描述：${dest.description}
最佳旅行时间：${dest.bestTimeToVisit}
平均预算：${dest.averageBudget.min}-${dest.averageBudget.max} ${dest.averageBudget.currency}
热门景点：${dest.attractions.map((a) => a.name).join(', ')}
${dest.tips.length > 0 ? `旅行贴士：${dest.tips.join('; ')}` : ''}
      `.trim();
    } catch (error) {
      logger.error('Error fetching destination context:', error);
      return null;
    }
  }

  /**
   * Build prompt for itinerary generation
   */
  private buildItineraryPrompt(
    destination: string,
    days: number,
    budget: number,
    preferences: string[],
    destinationInfo: any
  ): string {
    let prompt = `请为${destination}生成一个${days}天的旅行攻略，总预算为${budget}元。\n\n`;

    if (preferences.length > 0) {
      prompt += `用户偏好：${preferences.join('、')}\n\n`;
    }

    if (destinationInfo) {
      prompt += `目的地信息：\n`;
      prompt += `- 最佳旅行时间：${destinationInfo.bestTimeToVisit}\n`;
      prompt += `- 热门景点：${destinationInfo.attractions.map((a: any) => a.name).join('、')}\n`;
      if (destinationInfo.tips.length > 0) {
        prompt += `- 旅行贴士：${destinationInfo.tips.join('；')}\n`;
      }
      prompt += `\n`;
    }

    prompt += `请按以下JSON格式返回攻略（只返回JSON，不要其他文字）：\n`;
    prompt += `[
  {
    "day": 1,
    "activities": [
      {
        "time": "09:00",
        "name": "活动名称",
        "description": "活动描述",
        "location": "具体位置",
        "cost": 100,
        "duration": "2小时"
      }
    ],
    "meals": [
      {
        "type": "breakfast",
        "restaurant": "餐厅名称",
        "cuisine": "菜系",
        "estimatedCost": 50
      }
    ],
    "accommodation": "住宿推荐",
    "dailyBudget": 500
  }
]\n\n`;
    prompt += `注意：\n`;
    prompt += `1. 总预算不能超过${budget}元\n`;
    prompt += `2. 每天的活动要合理安排时间\n`;
    prompt += `3. 包含早中晚三餐建议\n`;
    prompt += `4. 根据用户偏好调整活动类型\n`;

    return prompt;
  }

  /**
   * Parse AI response into itinerary content
   */
  private parseItineraryResponse(response: string, days: number, budget: number): any[] {
    try {
      // Extract JSON from response (AI might include extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('AI响应格式不正确');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('攻略内容为空');
      }

      // Ensure we have the right number of days
      if (parsed.length !== days) {
        logger.warn(
          `AI returned ${parsed.length} days instead of ${days}, adjusting...`
        );
      }

      // Validate each day has required fields
      parsed.forEach((day, index) => {
        if (!day.day || !day.activities || !day.meals || day.dailyBudget === undefined) {
          throw new Error(`第${index + 1}天的攻略格式不完整`);
        }
      });

      return parsed;
    } catch (error) {
      logger.error('Failed to parse itinerary response:', error);
      // Return a fallback structure
      return this.generateFallbackItinerary(days, budget);
    }
  }

  /**
   * Generate a fallback itinerary if AI parsing fails
   */
  private generateFallbackItinerary(days: number, budget: number): any[] {
    const dailyBudget = Math.floor(budget / days);
    const itinerary = [];

    for (let i = 1; i <= days; i++) {
      itinerary.push({
        day: i,
        activities: [
          {
            time: '09:00',
            name: '自由活动',
            description: '根据个人兴趣安排活动',
            location: '目的地',
            cost: Math.floor(dailyBudget * 0.4),
            duration: '全天',
          },
        ],
        meals: [
          {
            type: 'breakfast',
            restaurant: '酒店早餐或当地餐厅',
            cuisine: '当地特色',
            estimatedCost: Math.floor(dailyBudget * 0.1),
          },
          {
            type: 'lunch',
            restaurant: '当地推荐餐厅',
            cuisine: '当地特色',
            estimatedCost: Math.floor(dailyBudget * 0.2),
          },
          {
            type: 'dinner',
            restaurant: '当地推荐餐厅',
            cuisine: '当地特色',
            estimatedCost: Math.floor(dailyBudget * 0.2),
          },
        ],
        accommodation: i < days ? '当地酒店' : undefined,
        dailyBudget,
      });
    }

    return itinerary;
  }
}

export const aiService = new AIService();
