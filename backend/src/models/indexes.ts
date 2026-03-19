/**
 * Database indexes optimization
 * 为提高查询性能添加复合索引
 */

import { Destination } from './Destination.js';
import { Conversation } from './Conversation.js';
import { Itinerary } from './Itinerary.js';
import { User } from './User.js';
import { logger } from '../utils/logger.js';

export async function createIndexes(): Promise<void> {
  try {
    logger.info('Creating database indexes...');

    // Helper function to create index safely
    const createIndexSafely = async (collection: any, index: any, options?: any) => {
      try {
        await collection.createIndex(index, options);
      } catch (error: any) {
        // 如果是索引冲突错误（code 85），只记录警告
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          logger.warn(`Index already exists with different options, skipping: ${JSON.stringify(index)}`);
        } else {
          // 其他错误继续抛出
          throw error;
        }
      }
    };

    // Destination indexes
    await createIndexSafely(Destination.collection, { region: 1, type: 1 });
    await createIndexSafely(Destination.collection, { popularity: -1 });
    await createIndexSafely(Destination.collection, { 'averageBudget.min': 1, 'averageBudget.max': 1 });
    
    // Text search index for destinations
    await createIndexSafely(
      Destination.collection,
      { name: 'text', description: 'text', 'attractions.name': 'text' },
      { 
        weights: { name: 10, 'attractions.name': 5, description: 1 },
        default_language: 'none' // 支持中文
      }
    );

    // Conversation indexes
    await createIndexSafely(Conversation.collection, { userId: 1, createdAt: -1 });
    await createIndexSafely(Conversation.collection, { userId: 1, title: 1 });
    await createIndexSafely(Conversation.collection, { 'messages.timestamp': -1 });

    // Itinerary indexes
    await createIndexSafely(Itinerary.collection, { userId: 1, destination: 1 });
    await createIndexSafely(Itinerary.collection, { userId: 1, createdAt: -1 });
    await createIndexSafely(Itinerary.collection, { destination: 1, days: 1 });
    
    // Text search index for itineraries
    await createIndexSafely(
      Itinerary.collection,
      { destination: 'text', 'days.activities.name': 'text' },
      { default_language: 'none' }
    );

    // User indexes
    await createIndexSafely(User.collection, { email: 1 }, { unique: true, sparse: true });
    await createIndexSafely(User.collection, { username: 1 }, { unique: true });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating indexes:', error);
    // 不抛出错误，允许服务器继续启动
    logger.warn('Server will continue despite index creation errors');
  }
}
