import { Collection, ICollection, CollectionType } from '../models/Collection';
import { Itinerary } from '../models/Itinerary';
import { Conversation } from '../models/Conversation';
import mongoose from 'mongoose';

export interface AddCollectionDTO {
  itemId: string;
  itemType: CollectionType;
}

export class CollectionService {
  /**
   * 添加收藏（幂等性处理）
   * 需求: 5.1, 5.2, 5.3
   */
  async addToCollection(
    userId: string,
    itemId: string,
    itemType: CollectionType
  ): Promise<ICollection> {
    // 验证itemId格式
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new Error('无效的项目ID');
    }

    // 验证项目是否存在
    const itemExists = await this.verifyItemExists(itemId, itemType);
    if (!itemExists) {
      throw new Error(`${itemType === 'itinerary' ? '攻略' : '对话'}不存在`);
    }

    // 检查是否已收藏（幂等性处理）
    const existing = await Collection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      itemId: new mongoose.Types.ObjectId(itemId),
    });

    if (existing) {
      // 已收藏，直接返回现有记录（幂等性）
      return existing;
    }

    // 创建新收藏
    const collection = new Collection({
      userId: new mongoose.Types.ObjectId(userId),
      itemId: new mongoose.Types.ObjectId(itemId),
      itemType,
    });

    await collection.save();
    return collection;
  }

  /**
   * 移除收藏
   * 需求: 5.4
   */
  async removeFromCollection(userId: string, collectionId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error('无效的收藏ID');
    }

    const result = await Collection.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(collectionId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw new Error('收藏不存在或无权删除');
    }
  }

  /**
   * 获取用户收藏列表（支持类型筛选、倒序）
   * 需求: 5.5, 5.6, 5.7
   */
  async getUserCollections(
    userId: string,
    type?: CollectionType
  ): Promise<ICollection[]> {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    // 类型筛选
    if (type) {
      query.itemType = type;
    }

    // 按收藏时间倒序返回
    const collections = await Collection.find(query)
      .sort({ createdAt: -1 })
      .populate('itemId')
      .exec();

    return collections;
  }

  /**
   * 检查是否已收藏
   * 需求: 5.4
   */
  async isCollected(userId: string, itemId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return false;
    }

    const collection = await Collection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      itemId: new mongoose.Types.ObjectId(itemId),
    });

    return !!collection;
  }

  /**
   * 验证项目是否存在
   */
  private async verifyItemExists(
    itemId: string,
    itemType: CollectionType
  ): Promise<boolean> {
    const objectId = new mongoose.Types.ObjectId(itemId);

    if (itemType === 'itinerary') {
      const itinerary = await Itinerary.findById(objectId);
      return !!itinerary;
    } else if (itemType === 'conversation') {
      const conversation = await Conversation.findById(objectId);
      return !!conversation;
    }

    return false;
  }
}
