import { Router } from 'express';
import {
  globalSearch,
  searchDestinations,
  searchItineraries,
  searchConversations,
} from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/search - 全局搜索（支持类型筛选）
 * 需求: 7.1, 7.6 - 用户输入搜索关键词时，Search_Engine应在Destination、Itinerary和Conversation中搜索匹配内容
 * 需求: 7.6 - Search_Engine应支持按内容类型筛选搜索结果
 * 支持可选认证（已登录用户可获得个性化结果）
 */
router.get('/', optionalAuth, asyncHandler(globalSearch));

/**
 * GET /api/search/destinations - 搜索目的地
 * 需求: 7.1, 7.3 - Search_Engine应支持模糊匹配和部分关键词匹配
 */
router.get('/destinations', asyncHandler(searchDestinations));

/**
 * GET /api/search/itineraries - 搜索攻略
 * 需求: 7.1, 7.3, 7.7 - 已登录用户的搜索结果中，用户自己创建的攻略应排在其他用户的同类型项之前
 * 支持可选认证（已登录用户可获得个性化结果）
 */
router.get('/itineraries', optionalAuth, asyncHandler(searchItineraries));

/**
 * GET /api/search/conversations - 搜索对话
 * 需求: 7.1, 7.3 - 搜索对话记录
 * 注意：仅限已登录用户搜索自己的对话
 */
router.get('/conversations', optionalAuth, asyncHandler(searchConversations));

export default router;
