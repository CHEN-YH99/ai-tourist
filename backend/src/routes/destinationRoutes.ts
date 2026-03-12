import { Router } from 'express';
import {
  getDestinations,
  getDestinationById,
  getPopularDestinations,
  createDestination,
  updateDestination,
} from '../controllers/destinationController.js';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/destinations/popular
 * 获取热门目的地
 * 需求: 6.7 - 系统应在首页展示至少10个热门Destination
 * 缓存: 1小时
 */
router.get(
  '/popular',
  cacheMiddleware(3600), // 1小时缓存
  asyncHandler(getPopularDestinations)
);

/**
 * GET /api/destinations/:id
 * 获取目的地详情
 * 需求: 6.2 - Destination_Service应为每个Destination提供完整信息
 * 需求: 6.3 - 用户请求特定Destination的详情时，Destination_Service应返回该Destination的完整信息
 */
router.get('/:id', asyncHandler(getDestinationById));

/**
 * GET /api/destinations
 * 获取目的地列表（支持筛选）
 * 需求: 6.1 - 用户请求目的地列表时，Destination_Service应返回所有可用的Destination信息
 * 需求: 6.4 - Destination_Service应支持按地区、类型或热度排序Destination列表
 */
router.get('/', asyncHandler(getDestinations));

/**
 * POST /api/destinations
 * 创建目的地（管理员）
 * 需求: 6.5 - 管理员添加新的Destination时，Destination_Service应验证必填字段完整性
 * TODO: 添加管理员权限验证中间件
 */
router.post('/', authenticate, asyncHandler(createDestination));

/**
 * PUT /api/destinations/:id
 * 更新目的地（管理员）
 * 需求: 6.6 - 管理员更新Destination信息时，Destination_Service应保存更新并保持数据一致性
 * TODO: 添加管理员权限验证中间件
 */
router.put('/:id', authenticate, asyncHandler(updateDestination));

export default router;
