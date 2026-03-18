import { Request, Response, NextFunction } from 'express';
import { routeMapService } from '../services/routeMapService.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * POST /api/route-map/generate
 * Generate a route map from travel content using Gemini
 */
export async function generateRouteMap(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: '内容不能为空',
      });
      return;
    }

    const response = await routeMapService.generateRouteMap({
      content: content.trim(),
    });

    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    logger.error('Route map generation endpoint error:', error);
    next(error);
  }
}
