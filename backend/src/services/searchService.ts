import { Destination, IDestination } from '../models/Destination.js';
import { Itinerary, IItinerary } from '../models/Itinerary.js';
import { Conversation, IConversation } from '../models/Conversation.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface SearchFilters {
  type?: 'destination' | 'itinerary' | 'conversation';
  sortBy?: 'relevance' | 'date';
}

export interface SearchResults {
  destinations: IDestination[];
  itineraries: IItinerary[];
  conversations: IConversation[];
  total: number;
}

const SEARCH_TIMEOUT_MS = 2000; // 2秒超时

/**
 * 执行带超时的搜索操作
 * 需求: 7.2 - 搜索应在2秒内返回结果
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('搜索超时')), timeoutMs)
    ),
  ]);
}

export class SearchService {
  /**
   * 全局搜索（支持模糊匹配）
   * 需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
   */
  async search(
    query: string,
    userId?: string,
    filters?: SearchFilters
  ): Promise<SearchResults> {
    try {
      // 验证搜索词不为空
      if (!query || query.trim().length === 0) {
        throw new AppError(400, '搜索词不能为空');
      }

      const trimmedQuery = query.trim();

      // 执行并行搜索，带超时控制
      const [destinations, itineraries, conversations] = await withTimeout(
        Promise.all([
          this.searchDestinations(trimmedQuery),
          this.searchItineraries(trimmedQuery, userId),
          this.searchConversations(trimmedQuery, userId),
        ]),
        SEARCH_TIMEOUT_MS
      );

      // 应用类型筛选
      let filteredDestinations = destinations;
      let filteredItineraries = itineraries;
      let filteredConversations = conversations;

      if (filters?.type) {
        if (filters.type !== 'destination') {
          filteredDestinations = [];
        }
        if (filters.type !== 'itinerary') {
          filteredItineraries = [];
        }
        if (filters.type !== 'conversation') {
          filteredConversations = [];
        }
      }

      // 计算总数
      const total =
        filteredDestinations.length +
        filteredItineraries.length +
        filteredConversations.length;

      logger.info(
        `Search completed for query: "${trimmedQuery}", results: ${total}`
      );

      return {
        destinations: filteredDestinations,
        itineraries: filteredItineraries,
        conversations: filteredConversations,
        total,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.message === '搜索超时') {
        throw new AppError(408, '搜索请求超时，请重试');
      }
      logger.error('Error during global search:', error);
      throw new AppError(500, '搜索失败');
    }
  }

  /**
   * 搜索目的地
   * 需求: 7.1, 7.3
   */
  async searchDestinations(query: string): Promise<IDestination[]> {
    try {
      const trimmedQuery = query.trim();

      // 使用MongoDB文本搜索和模糊匹配
      const destinations = await Destination.find(
        {
          $or: [
            { $text: { $search: trimmedQuery } },
            { name: { $regex: trimmedQuery, $options: 'i' } },
            { description: { $regex: trimmedQuery, $options: 'i' } },
            { region: { $regex: trimmedQuery, $options: 'i' } },
            { country: { $regex: trimmedQuery, $options: 'i' } },
          ],
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .lean();

      logger.info(
        `Found ${destinations.length} destinations matching: "${trimmedQuery}"`
      );
      return destinations as unknown as IDestination[];
    } catch (error) {
      logger.error('Error searching destinations:', error);
      // 如果文本搜索失败，回退到简单的正则搜索
      try {
        const destinations = await Destination.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { region: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } },
          ],
        })
          .limit(20)
          .lean();

        return destinations as unknown as IDestination[];
      } catch (fallbackError) {
        logger.error('Error in destination search fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 搜索攻略（优先显示用户自己的）
   * 需求: 7.1, 7.3, 7.7
   */
  async searchItineraries(query: string, userId?: string): Promise<IItinerary[]> {
    try {
      const trimmedQuery = query.trim();

      // 构建查询条件
      const searchCondition = {
        $or: [
          { $text: { $search: trimmedQuery } },
          { destination: { $regex: trimmedQuery, $options: 'i' } },
          { 'content.activities.name': { $regex: trimmedQuery, $options: 'i' } },
          { 'content.activities.description': { $regex: trimmedQuery, $options: 'i' } },
        ],
      };

      // 如果用户已登录，优先显示用户自己的攻略
      let itineraries: any[] = [];

      if (userId) {
        // 先获取用户自己的攻略
        const userItineraries = await Itinerary.find({
          userId,
          ...searchCondition,
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        // 再获取其他用户的攻略
        const otherItineraries = await Itinerary.find({
          userId: { $ne: userId },
          ...searchCondition,
        })
          .limit(10)
          .lean();

        itineraries = [...userItineraries, ...otherItineraries];
      } else {
        // 未登录用户，直接搜索
        itineraries = await Itinerary.find(searchCondition)
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      }

      logger.info(
        `Found ${itineraries.length} itineraries matching: "${trimmedQuery}"`
      );
      return itineraries as unknown as IItinerary[];
    } catch (error) {
      logger.error('Error searching itineraries:', error);
      // 回退到简单搜索
      try {
        const searchCondition = {
          $or: [
            { destination: { $regex: query, $options: 'i' } },
            { 'content.activities.name': { $regex: query, $options: 'i' } },
            { 'content.activities.description': { $regex: query, $options: 'i' } },
          ],
        };

        let itineraries: any[] = [];

        if (userId) {
          const userItineraries = await Itinerary.find({
            userId,
            ...searchCondition,
          })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

          const otherItineraries = await Itinerary.find({
            userId: { $ne: userId },
            ...searchCondition,
          })
            .limit(10)
            .lean();

          itineraries = [...userItineraries, ...otherItineraries];
        } else {
          itineraries = await Itinerary.find(searchCondition)
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        }

        return itineraries as unknown as IItinerary[];
      } catch (fallbackError) {
        logger.error('Error in itinerary search fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 搜索对话（仅限用户自己的）
   * 需求: 7.1, 7.3
   */
  async searchConversations(query: string, userId?: string): Promise<IConversation[]> {
    try {
      // 未登录用户无法搜索对话
      if (!userId) {
        return [];
      }

      const trimmedQuery = query.trim();

      // 搜索用户自己的对话
      const conversations = await Conversation.find({
        userId,
        $or: [
          { $text: { $search: trimmedQuery } },
          { title: { $regex: trimmedQuery, $options: 'i' } },
          { 'messages.content': { $regex: trimmedQuery, $options: 'i' } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      logger.info(
        `Found ${conversations.length} conversations matching: "${trimmedQuery}"`
      );
      return conversations as unknown as IConversation[];
    } catch (error) {
      logger.error('Error searching conversations:', error);
      // 回退到简单搜索
      try {
        if (!userId) {
          return [];
        }

        const conversations = await Conversation.find({
          userId,
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { 'messages.content': { $regex: query, $options: 'i' } },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        return conversations as unknown as IConversation[];
      } catch (fallbackError) {
        logger.error('Error in conversation search fallback:', fallbackError);
        return [];
      }
    }
  }
}
