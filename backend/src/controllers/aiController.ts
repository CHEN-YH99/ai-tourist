import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * POST /api/chat
 * Send a message to AI assistant
 * Supports both authenticated and unauthenticated users
 */
export async function chat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: '消息内容不能为空',
      });
      return;
    }

    const response = await aiService.chat({
      userId: req.userId || null,
      message: message.trim(),
      conversationId,
    });

    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    next(error);
  }
}

/**
 * GET /api/chat/conversations
 * Get user's conversation list with pagination
 */
export async function getConversations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: '需要登录',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await aiService.getConversations(req.userId, page, pageSize);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    next(error);
  }
}

/**
 * GET /api/chat/conversations/:id
 * Get a specific conversation
 */
export async function getConversation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const conversation = await aiService.getConversation(id);

    res.status(200).json({
      status: 'success',
      data: conversation,
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    next(error);
  }
}

/**
 * DELETE /api/chat/conversations/:id
 * Delete a conversation
 */
export async function deleteConversation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    await aiService.deleteConversation(id);

    res.status(200).json({
      status: 'success',
      message: '对话已删除',
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    next(error);
  }
}

/**
 * POST /api/itineraries/generate
 * Generate a travel itinerary
 */
export async function generateItinerary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: '需要登录才能生成攻略',
      });
      return;
    }

    const { destination, days, budget, preferences } = req.body;

    // Validate required fields
    if (!destination || !days || !budget) {
      res.status(400).json({
        status: 'error',
        message: '目的地、天数和预算为必填项',
      });
      return;
    }

    // Validate data types and ranges
    if (typeof days !== 'number' || days < 1 || days > 30) {
      res.status(400).json({
        status: 'error',
        message: '旅行天数必须在1-30天之间',
      });
      return;
    }

    if (typeof budget !== 'number' || budget <= 0) {
      res.status(400).json({
        status: 'error',
        message: '预算必须大于0',
      });
      return;
    }

    const itinerary = await aiService.generateItinerary(req.userId, {
      destination,
      days,
      budget,
      preferences: preferences || [],
    });

    res.status(201).json({
      status: 'success',
      data: itinerary,
    });
  } catch (error) {
    logger.error('Generate itinerary error:', error);
    next(error);
  }
}
