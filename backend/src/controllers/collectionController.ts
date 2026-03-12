import { Response } from 'express';
import { CollectionService } from '../services/collectionService';
import { AuthRequest } from '../middleware/auth';
import { CollectionType } from '../models/Collection';

const collectionService = new CollectionService();

/**
 * 获取收藏列表（支持类型筛选）
 * GET /api/collections
 * 需求: 5.4, 5.5, 5.6
 */
export async function getCollections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const type = req.query.type as CollectionType | undefined;

    // 验证type参数
    if (type && !['itinerary', 'conversation'].includes(type)) {
      res.status(400).json({
        status: 'error',
        message: '无效的收藏类型',
      });
      return;
    }

    const collections = await collectionService.getUserCollections(userId, type);

    res.json({
      status: 'success',
      data: collections,
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取收藏列表失败',
    });
  }
}

/**
 * 添加收藏
 * POST /api/collections
 * 需求: 5.1, 5.2, 5.3
 */
export async function addCollection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { itemId, itemType } = req.body;

    // 验证必填字段
    if (!itemId || !itemType) {
      res.status(400).json({
        status: 'error',
        message: '缺少必填字段：itemId 和 itemType',
      });
      return;
    }

    // 验证itemType
    if (!['itinerary', 'conversation'].includes(itemType)) {
      res.status(400).json({
        status: 'error',
        message: '无效的收藏类型',
      });
      return;
    }

    const collection = await collectionService.addToCollection(
      userId,
      itemId,
      itemType
    );

    res.status(201).json({
      status: 'success',
      data: collection,
    });
  } catch (error: any) {
    console.error('添加收藏失败:', error);
    
    if (error.message.includes('不存在')) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: '添加收藏失败',
    });
  }
}

/**
 * 移除收藏
 * DELETE /api/collections/:id
 * 需求: 5.4
 */
export async function removeCollection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const collectionId = req.params.id;

    await collectionService.removeFromCollection(userId, collectionId);

    res.json({
      status: 'success',
      message: '已取消收藏',
    });
  } catch (error: any) {
    console.error('移除收藏失败:', error);

    if (error.message.includes('不存在') || error.message.includes('无权')) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: '移除收藏失败',
    });
  }
}

/**
 * 检查是否已收藏
 * GET /api/collections/check/:id
 * 需求: 5.4
 */
export async function checkCollection(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const itemId = req.params.id;

    const isCollected = await collectionService.isCollected(userId, itemId);

    res.json({
      status: 'success',
      data: {
        isCollected,
      },
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '检查收藏状态失败',
    });
  }
}
