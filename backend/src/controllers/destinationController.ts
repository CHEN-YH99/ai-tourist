import { Request, Response, NextFunction } from 'express';
import { DestinationService, DestinationFilters } from '../services/destinationService.js';
import { ApiResponse } from '../types/index.js';

const destinationService = new DestinationService();

/**
 * GET /api/destinations - 获取目的地列表（支持筛选）
 * 需求: 6.1, 6.4
 */
export async function getDestinations(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const filters: DestinationFilters = {
      region: req.query.region as string,
      country: req.query.country as string,
      type: req.query.type as string,
      sortBy: req.query.sortBy as 'popularity' | 'name' | 'budget',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const destinations = await destinationService.getDestinations(filters);

    res.status(200).json({
      status: 'success',
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/destinations/:id - 获取目的地详情
 * 需求: 6.2, 6.3
 */
export async function getDestinationById(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const destination = await destinationService.getDestinationById(id);

    res.status(200).json({
      status: 'success',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/destinations/popular - 获取热门目的地
 * 需求: 6.7
 */
export async function getPopularDestinations(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const destinations = await destinationService.getPopularDestinations(limit);

    res.status(200).json({
      status: 'success',
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/destinations - 创建目的地（管理员）
 * 需求: 6.5
 */
export async function createDestination(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const destination = await destinationService.createDestination(req.body);

    res.status(201).json({
      status: 'success',
      data: destination,
      message: '目的地创建成功',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/destinations/:id - 更新目的地（管理员）
 * 需求: 6.6
 */
export async function updateDestination(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const destination = await destinationService.updateDestination(id, req.body);

    res.status(200).json({
      status: 'success',
      data: destination,
      message: '目的地更新成功',
    });
  } catch (error) {
    next(error);
  }
}
