import { Router } from 'express';
import {
  getCollections,
  addCollection,
  removeCollection,
  checkCollection,
} from '../controllers/collectionController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/collections/check/:id
 * 检查是否已收藏
 * 需求: 5.4 - 用户应能查看某个项目是否已收藏
 * 需求: 5.8 - 系统应提供API检查收藏状态
 * 认证: 必需
 */
router.get('/check/:id', authenticate, asyncHandler(checkCollection));

/**
 * GET /api/collections
 * 获取收藏列表（支持类型筛选）
 * 需求: 5.5 - 用户应能查看自己的收藏列表
 * 需求: 5.6 - 收藏列表应按收藏时间倒序排列
 * 需求: 5.8 - 系统应提供API按类型筛选收藏
 * 认证: 必需
 * 查询参数: type (可选) - 'itinerary' 或 'conversation'
 */
router.get('/', authenticate, asyncHandler(getCollections));

/**
 * POST /api/collections
 * 添加收藏
 * 需求: 5.1 - 用户应能收藏攻略和对话
 * 需求: 5.2 - 收藏时应验证项目存在性
 * 需求: 5.3 - 重复收藏应幂等处理
 * 认证: 必需
 * 请求体: { itemId: string, itemType: 'itinerary' | 'conversation' }
 */
router.post('/', authenticate, asyncHandler(addCollection));

/**
 * DELETE /api/collections/:id
 * 移除收藏
 * 需求: 5.4 - 用户应能取消收藏
 * 认证: 必需
 */
router.delete('/:id', authenticate, asyncHandler(removeCollection));

export default router;
