import { Destination, IDestination } from '../models/Destination.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface DestinationFilters {
  region?: string;
  country?: string;
  type?: string;
  sortBy?: 'popularity' | 'name' | 'budget';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDestinationDTO {
  name: string;
  nameEn?: string;
  region: string;
  country: string;
  type: string[];
  description: string;
  images: string[];
  attractions: Array<{
    name: string;
    description: string;
    image?: string;
    ticketPrice?: number;
    openingHours?: string;
  }>;
  bestTimeToVisit: string;
  averageBudget: {
    min: number;
    max: number;
    currency: string;
  };
  climate?: string;
  transportation?: string;
  tips: string[];
  popularity?: number;
}

export interface UpdateDestinationDTO {
  name?: string;
  nameEn?: string;
  region?: string;
  country?: string;
  type?: string[];
  description?: string;
  images?: string[];
  attractions?: Array<{
    name: string;
    description: string;
    image?: string;
    ticketPrice?: number;
    openingHours?: string;
  }>;
  bestTimeToVisit?: string;
  averageBudget?: {
    min: number;
    max: number;
    currency: string;
  };
  climate?: string;
  transportation?: string;
  tips?: string[];
  popularity?: number;
}

export class DestinationService {
  /**
   * 获取目的地列表（支持筛选和排序）
   * 需求: 6.1, 6.4
   */
  async getDestinations(filters?: DestinationFilters): Promise<IDestination[]> {
    try {
      const query: any = {};

      // 应用筛选条件
      if (filters?.region) {
        query.region = filters.region;
      }

      if (filters?.country) {
        query.country = filters.country;
      }

      if (filters?.type) {
        query.type = filters.type;
      }

      // 构建排序选项
      let sortOptions: any = {};
      const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

      switch (filters?.sortBy) {
        case 'popularity':
          sortOptions = { popularity: sortOrder };
          break;
        case 'name':
          sortOptions = { name: sortOrder };
          break;
        case 'budget':
          sortOptions = { 'averageBudget.min': sortOrder };
          break;
        default:
          sortOptions = { popularity: -1 }; // 默认按热度降序
      }

      const destinations = await Destination.find(query)
        .sort(sortOptions)
        .lean();

      logger.info(`Retrieved ${destinations.length} destinations with filters:`, filters);
      return destinations as unknown as IDestination[];
    } catch (error) {
      logger.error('Error fetching destinations:', error);
      throw new AppError(500, '获取目的地列表失败');
    }
  }

  /**
   * 获取目的地详情
   * 需求: 6.2, 6.3
   */
  async getDestinationById(id: string): Promise<IDestination> {
    try {
      const destination = await Destination.findById(id).lean();

      if (!destination) {
        throw new AppError(404, '目的地不存在');
      }

      logger.info(`Retrieved destination: ${destination.name}`);
      return destination as unknown as IDestination;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error fetching destination by ID:', error);
      throw new AppError(500, '获取目的地详情失败');
    }
  }

  /**
   * 获取热门目的地
   * 需求: 6.7
   */
  async getPopularDestinations(limit: number = 10): Promise<IDestination[]> {
    try {
      const destinations = await Destination.find()
        .sort({ popularity: -1 })
        .limit(limit)
        .lean();

      logger.info(`Retrieved ${destinations.length} popular destinations`);
      return destinations as unknown as IDestination[];
    } catch (error) {
      logger.error('Error fetching popular destinations:', error);
      throw new AppError(500, '获取热门目的地失败');
    }
  }

  /**
   * 创建目的地（管理员）
   * 需求: 6.5
   */
  async createDestination(data: CreateDestinationDTO): Promise<IDestination> {
    try {
      // 验证必填字段
      this.validateRequiredFields(data);

      // 验证预算
      if (data.averageBudget.min <= 0 || data.averageBudget.max <= 0) {
        throw new AppError(400, '平均预算必须为正数');
      }

      if (data.averageBudget.max < data.averageBudget.min) {
        throw new AppError(400, '最大预算不能小于最小预算');
      }

      // 检查目的地名称是否已存在
      const existingDestination = await Destination.findOne({ name: data.name });
      if (existingDestination) {
        throw new AppError(409, '目的地名称已存在');
      }

      const destination = await Destination.create(data);
      logger.info(`Created new destination: ${destination.name}`);
      return destination;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating destination:', error);
      throw new AppError(500, '创建目的地失败');
    }
  }

  /**
   * 更新目的地（管理员）
   * 需求: 6.6
   */
  async updateDestination(
    id: string,
    data: UpdateDestinationDTO
  ): Promise<IDestination> {
    try {
      // 检查目的地是否存在
      const existingDestination = await Destination.findById(id);
      if (!existingDestination) {
        throw new AppError(404, '目的地不存在');
      }

      // 如果更新名称，检查新名称是否已被使用
      if (data.name && data.name !== existingDestination.name) {
        const duplicateName = await Destination.findOne({ name: data.name });
        if (duplicateName) {
          throw new AppError(409, '目的地名称已存在');
        }
      }

      // 验证预算（如果提供）
      if (data.averageBudget) {
        if (data.averageBudget.min <= 0 || data.averageBudget.max <= 0) {
          throw new AppError(400, '平均预算必须为正数');
        }
        if (data.averageBudget.max < data.averageBudget.min) {
          throw new AppError(400, '最大预算不能小于最小预算');
        }
      }

      const updatedDestination = await Destination.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedDestination) {
        throw new AppError(404, '目的地不存在');
      }

      logger.info(`Updated destination: ${updatedDestination.name}`);
      return updatedDestination;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating destination:', error);
      throw new AppError(500, '更新目的地失败');
    }
  }

  /**
   * 验证必填字段
   * 需求: 6.5
   */
  private validateRequiredFields(data: CreateDestinationDTO): void {
    const requiredFields = [
      'name',
      'region',
      'country',
      'description',
      'bestTimeToVisit',
      'averageBudget',
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof CreateDestinationDTO]) {
        throw new AppError(400, `缺少必填字段: ${field}`);
      }
    }

    // 验证averageBudget的子字段
    if (!data.averageBudget.min || !data.averageBudget.max) {
      throw new AppError(400, '平均预算必须包含最小值和最大值');
    }
  }
}
