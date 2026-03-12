import { Request, Response, NextFunction } from 'express';
import { SearchService, SearchFilters } from '../services/searchService.js';
import { ApiResponse } from '../types/index.js';

interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const searchService = new SearchService();

/**
 * GET /api/search - 全局搜索（支持类型筛选）
 * 需求: 7.1, 7.6
 */
export async function globalSearch(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { q, type, sortBy } = req.query;

    // 验证搜索词
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: '搜索词为必填项',
      });
      return;
    }

    const filters: SearchFilters = {
      type: type as 'destination' | 'itinerary' | 'conversation' | undefined,
      sortBy: sortBy as 'relevance' | 'date' | undefined,
    };

    const results = await searchService.search(q, req.userId, filters);

    res.status(200).json({
      status: 'success',
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/search/destinations - 搜索目的地
 * 需求: 7.1, 7.3
 */
export async function searchDestinations(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { q } = req.query;

    // 验证搜索词
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: '搜索词为必填项',
      });
      return;
    }

    const destinations = await searchService.searchDestinations(q);

    res.status(200).json({
      status: 'success',
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/search/itineraries - 搜索攻略
 * 需求: 7.1, 7.3, 7.7
 */
export async function searchItineraries(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { q } = req.query;

    // 验证搜索词
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: '搜索词为必填项',
      });
      return;
    }

    const itineraries = await searchService.searchItineraries(q, req.userId);

    res.status(200).json({
      status: 'success',
      data: itineraries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/search/conversations - 搜索对话
 * 需求: 7.1, 7.3
 */
export async function searchConversations(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { q } = req.query;

    // 验证搜索词
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: '搜索词为必填项',
      });
      return;
    }

    // 检查用户是否已登录
    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: '搜索对话需要登录',
      });
      return;
    }

    const conversations = await searchService.searchConversations(q, req.userId);

    res.status(200).json({
      status: 'success',
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
}
