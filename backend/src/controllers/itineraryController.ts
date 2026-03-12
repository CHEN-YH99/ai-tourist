import { Response } from 'express';
import { Itinerary } from '../models/Itinerary.js';
import { AuthRequest } from '../middleware/auth.js';
import { paginate } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * 获取攻略列表（分页）
 * GET /api/itineraries
 * 需求: 2.4, 2.5
 */
export async function getItineraries(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string) || 20));

    // 分页查询用户的攻略
    const result = await paginate(
      Itinerary,
      { userId },
      { page, pageSize },
      { createdAt: -1 }
    );

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('获取攻略列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取攻略列表失败',
    });
  }
}

/**
 * 获取特定攻略
 * GET /api/itineraries/:id
 * 需求: 2.4, 2.5
 */
export async function getItinerary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const itineraryId = req.params.id;

    // 查询攻略
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      res.status(404).json({
        status: 'error',
        message: '攻略不存在',
      });
      return;
    }

    // 验证权限：用户只能访问自己的攻略
    if (itinerary.userId.toString() !== userId) {
      res.status(403).json({
        status: 'error',
        message: '无权访问此攻略',
      });
      return;
    }

    res.json({
      status: 'success',
      data: itinerary,
    });
  } catch (error) {
    console.error('获取攻略失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取攻略失败',
    });
  }
}

/**
 * 更新攻略
 * PUT /api/itineraries/:id
 * 需求: 2.4, 2.5
 */
export async function updateItinerary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const itineraryId = req.params.id;
    const { destination, days, budget, preferences, content } = req.body;

    // 查询攻略
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      res.status(404).json({
        status: 'error',
        message: '攻略不存在',
      });
      return;
    }

    // 验证权限：用户只能修改自己的攻略
    if (itinerary.userId.toString() !== userId) {
      res.status(403).json({
        status: 'error',
        message: '无权修改此攻略',
      });
      return;
    }

    // 验证输入数据
    if (destination !== undefined) {
      if (typeof destination !== 'string' || destination.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: '目的地必须是非空字符串',
        });
        return;
      }
      itinerary.destination = destination.trim();
    }

    if (days !== undefined) {
      if (!Number.isInteger(days) || days < 1 || days > 30) {
        res.status(400).json({
          status: 'error',
          message: '旅行天数必须是1-30之间的整数',
        });
        return;
      }
      itinerary.days = days;
    }

    if (budget !== undefined) {
      if (typeof budget !== 'number' || budget < 0) {
        res.status(400).json({
          status: 'error',
          message: '预算必须是非负数',
        });
        return;
      }
      itinerary.budget = budget;
    }

    if (preferences !== undefined) {
      if (!Array.isArray(preferences)) {
        res.status(400).json({
          status: 'error',
          message: '偏好必须是数组',
        });
        return;
      }
      itinerary.preferences = preferences;
    }

    if (content !== undefined) {
      if (!Array.isArray(content)) {
        res.status(400).json({
          status: 'error',
          message: '内容必须是数组',
        });
        return;
      }
      itinerary.content = content;
    }

    // 保存更新
    const updatedItinerary = await itinerary.save();

    res.json({
      status: 'success',
      data: updatedItinerary,
    });
  } catch (error) {
    console.error('更新攻略失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新攻略失败',
    });
  }
}

/**
 * 删除攻略
 * DELETE /api/itineraries/:id
 * 需求: 2.4, 2.5
 */
export async function deleteItinerary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const itineraryId = req.params.id;

    // 查询攻略
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      res.status(404).json({
        status: 'error',
        message: '攻略不存在',
      });
      return;
    }

    // 验证权限：用户只能删除自己的攻略
    if (itinerary.userId.toString() !== userId) {
      res.status(403).json({
        status: 'error',
        message: '无权删除此攻略',
      });
      return;
    }

    // 删除攻略
    await Itinerary.findByIdAndDelete(itineraryId);

    res.json({
      status: 'success',
      message: '攻略已删除',
    });
  } catch (error) {
    console.error('删除攻略失败:', error);
    res.status(500).json({
      status: 'error',
      message: '删除攻略失败',
    });
  }
}
