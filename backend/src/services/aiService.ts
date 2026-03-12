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
      // Load existing conversation if provided
      let conversation: IConversation | null = null;
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          throw new Error('对话不存在');
        }
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

      // Call OpenAI with timeout using queue
      const aiResponse = await this.callOpenAIWithTimeout(messages, 5000);

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
      throw new Error('AI服务暂时不可用，请稍后再试');
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

      const client = openai();
      const apiPromise = client.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
    });
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
