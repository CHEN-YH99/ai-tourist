import { Destination, IDestination } from '../models/Destination.js';
import { Itinerary, IItinerary } from '../models/Itinerary.js';
import { Conversation, IConversation } from '../models/Conversation.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { sanitizeSearchQuery, escapeRegex } from '../utils/sanitize.js';
import { searchCache, normalizeCacheKey } from '../utils/cache.js';

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
      // 验证和清理搜索词
      if (!query || query.trim().length === 0) {
        throw new AppError(400, '搜索词不能为空');
      }

      const trimmedQuery = sanitizeSearchQuery(query);

      // 检查缓存
      const cacheKey = normalizeCacheKey('search', { query: trimmedQuery, userId, filters });
      const cached = searchCache.get(cacheKey);
      if (cached) {
        logger.info(`Search cache hit for: "${trimmedQuery}"`);
        return cached as SearchResults;
      }

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
        `Search completed: ${total} results (destinations: ${filteredDestinations.length}, itineraries: ${filteredItineraries.length}, conversations: ${filteredConversations.length})`
      );

      const results = {
        destinations: filteredDestinations,
        itineraries: filteredItineraries,
        conversations: filteredConversations,
        total,
      };

      // 缓存结果
      searchCache.set(cacheKey, results);

      return results;
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
   * 搜索目的地（优化版本）
   * 使用文本索引和安全的正则表达式
   */
  async searchDestinations(query: string): Promise<IDestination[]> {
    try {
      const escapedQuery = escapeRegex(query);

      // 优先使用文本搜索索引
      const destinations = await Destination.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .select('name nameEn region country type description images popularity averageBudget')
        .lean();

      if (destinations.length > 0) {
        logger.info(`Found ${destinations.length} destinations using text search`);
        return destinations as unknown as IDestination[];
      }

      // 回退到正则搜索（使用转义后的查询）
      const regexResults = await Destination.find({
        $or: [
          { name: { $regex: escapedQuery, $options: 'i' } },
          { nameEn: { $regex: escapedQuery, $options: 'i' } },
          { region: { $regex: escapedQuery, $options: 'i' } },
          { country: { $regex: escapedQuery, $options: 'i' } },
        ],
      })
        .limit(20)
        .select('name nameEn region country type description images popularity averageBudget')
        .lean();

      logger.info(`Found ${regexResults.length} destinations using regex search`);
      return regexResults as unknown as IDestination[];
    } catch (error) {
      logger.error('Error searching destinations:', error);
      return [];
    }
  }

  /**
   * 搜索攻略（优化版本）
   */
  async searchItineraries(query: string, userId?: string): Promise<IItinerary[]> {
    try {
      const escapedQuery = escapeRegex(query);
      
      // 构建查询条件
      const searchConditions: any = {
        $or: [
          { destination: { $regex: escapedQuery, $options: 'i' } },
          { 'days.activities.name': { $regex: escapedQuery, $options: 'i' } },
        ],
      };

      // 如果提供了userId，优先返回用户自己的攻略
      if (userId) {
        const [userItineraries, publicItineraries] = await Promise.all([
          Itinerary.find({ ...searchConditions, userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('destination days budget preferences createdAt userId')
            .lean(),
          Itinerary.find({ ...searchConditions, userId: { $ne: userId } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('destination days budget preferences createdAt userId')
            .lean(),
        ]);

        const combined = [...userItineraries, ...publicItineraries].slice(0, 20);
        logger.info(`Found ${combined.length} itineraries (${userItineraries.length} user's own)`);
        return combined as unknown as IItinerary[];
      }

      // 未登录用户只返回公开攻略
      const itineraries = await Itinerary.find(searchConditions)
        .sort({ createdAt: -1 })
        .limit(20)
        .select('destination days budget preferences createdAt userId')
        .lean();

      logger.info(`Found ${itineraries.length} public itineraries`);
      return itineraries as unknown as IItinerary[];
    } catch (error) {
      logger.error('Error searching itineraries:', error);
      return [];
    }
  }

  /**
   * 搜索对话（优化版本）
   */
  async searchConversations(query: string, userId?: string): Promise<IConversation[]> {
    try {
      if (!userId) {
        return []; // 未登录用户无法搜索对话
      }

      const escapedQuery = escapeRegex(query);

      const conversations = await Conversation.find({
        userId,
        $or: [
          { title: { $regex: escapedQuery, $options: 'i' } },
          { 'messages.content': { $regex: escapedQuery, $options: 'i' } },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('title messages.role messages.content messages.timestamp createdAt updatedAt')
        .lean();

      logger.info(`Found ${conversations.length} conversations for user`);
      return conversations as unknown as IConversation[];
    } catch (error) {
      logger.error('Error searching conversations:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
