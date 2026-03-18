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
   * 规则：允许多个同名目的地，但不允许内容完全相同
   */
  async createDestination(data: CreateDestinationDTO): Promise<IDestination> {
    try {
      console.log('=== 创建目的地开始 ===');
      console.log('目的地名称:', data.name);
      console.log('描述:', data.description.substring(0, 50) + '...');
      
      // 验证必填字段
      this.validateRequiredFields(data);

      // 验证预算
      if (data.averageBudget.min <= 0 || data.averageBudget.max <= 0) {
        throw new AppError(400, '平均预算必须为正数');
      }

      if (data.averageBudget.max < data.averageBudget.min) {
        throw new AppError(400, '最大预算不能小于最小预算');
      }

      // 检查是否存在内容完全相同的目的地
      // 允许同名目的地，但不允许内容完全相同
      console.log('查找同名目的地...');
      const existingDestinations = await Destination.find({ name: data.name });
      console.log(`找到 ${existingDestinations.length} 个同名目的地`);
      
      if (existingDestinations.length > 0) {
        // 检查是否有内容完全相同的目的地
        for (let i = 0; i < existingDestinations.length; i++) {
          const existing = existingDestinations[i];
          console.log(`检查第 ${i + 1} 个同名目的地...`);
          
          const isDuplicate = this.isDestinationContentDuplicate(existing, data);
          console.log(`内容是否相同: ${isDuplicate}`);
          
          if (isDuplicate) {
            console.log('❌ 发现内容完全相同的目的地，拒绝创建');
            throw new AppError(409, '已存在内容完全相同的目的地，请修改后再添加');
          }
        }
        
        console.log(`✓ 所有同名目的地的内容都不同，允许创建`);
        logger.info(`Found ${existingDestinations.length} existing destination(s) with name "${data.name}", but content is different`);
      } else {
        console.log('✓ 没有同名目的地，允许创建');
      }

      console.log('开始创建目的地...');
      const destination = await Destination.create(data);
      console.log('✓ 目的地创建成功:', destination._id);
      logger.info(`Created new destination: ${destination.name}`);
      return destination;
    } catch (error) {
      console.error('创建目的地失败:', error);
      if (error instanceof AppError) {
        throw error;
      }
      // 检查是否是 MongoDB 唯一索引错误
      if ((error as any).code === 11000) {
        console.error('❌ MongoDB 唯一索引错误 - 数据库中仍有 unique 约束！');
        console.error('请运行: db.destinations.dropIndex("name_1")');
        throw new AppError(409, '目的地名称已存在（数据库唯一索引约束）。请联系管理员删除索引。');
      }
      logger.error('Error creating destination:', error);
      throw new AppError(500, '创建目的地失败');
    }
  }

  /**
   * 检查两个目的地的内容是否完全相同
   * 比较关键字段：描述、地区、国家、类型、景点、最佳旅游时间
   */
  private isDestinationContentDuplicate(
    existing: IDestination,
    newData: CreateDestinationDTO
  ): boolean {
    console.log('  → 比较描述...');
    if (existing.description !== newData.description) {
      console.log('    ✗ 描述不同');
      return false;
    }
    console.log('    ✓ 描述相同');

    console.log('  → 比较地区和国家...');
    if (existing.region !== newData.region || existing.country !== newData.country) {
      console.log(`    ✗ 地区或国家不同: ${existing.region}/${existing.country} vs ${newData.region}/${newData.country}`);
      return false;
    }
    console.log('    ✓ 地区和国家相同');

    console.log('  → 比较类型...');
    const existingTypes = [...existing.type].sort();
    const newTypes = [...newData.type].sort();
    if (JSON.stringify(existingTypes) !== JSON.stringify(newTypes)) {
      console.log(`    ✗ 类型不同: ${existingTypes} vs ${newTypes}`);
      return false;
    }
    console.log('    ✓ 类型相同');

    console.log('  → 比较最佳旅游时间...');
    if (existing.bestTimeToVisit !== newData.bestTimeToVisit) {
      console.log(`    ✗ 最佳旅游时间不同: ${existing.bestTimeToVisit} vs ${newData.bestTimeToVisit}`);
      return false;
    }
    console.log('    ✓ 最佳旅游时间相同');

    console.log('  → 比较景点...');
    if (existing.attractions.length !== newData.attractions.length) {
      console.log(`    ✗ 景点数量不同: ${existing.attractions.length} vs ${newData.attractions.length}`);
      return false;
    }

    const existingAttractionNames = existing.attractions.map(a => a.name).sort();
    const newAttractionNames = newData.attractions.map(a => a.name).sort();
    if (JSON.stringify(existingAttractionNames) !== JSON.stringify(newAttractionNames)) {
      console.log(`    ✗ 景点名称不同`);
      console.log(`      现有: ${existingAttractionNames.join(', ')}`);
      console.log(`      新的: ${newAttractionNames.join(', ')}`);
      return false;
    }
    console.log('    ✓ 景点相同');

    console.log('  → 比较预算...');
    if (
      existing.averageBudget.min !== newData.averageBudget.min ||
      existing.averageBudget.max !== newData.averageBudget.max ||
      existing.averageBudget.currency !== newData.averageBudget.currency
    ) {
      console.log(`    ✗ 预算不同: ${existing.averageBudget.min}-${existing.averageBudget.max} ${existing.averageBudget.currency} vs ${newData.averageBudget.min}-${newData.averageBudget.max} ${newData.averageBudget.currency}`);
      return false;
    }
    console.log('    ✓ 预算相同');

    // 如果所有关键字段都相同，则认为内容完全相同
    console.log('  ⚠️  所有字段都相同，内容重复！');
    logger.warn(`Duplicate content detected for destination: ${newData.name}`);
    return true;
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
