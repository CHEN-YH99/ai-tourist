/**
 * 删除目的地名称的唯一索引
 * 允许同名目的地存在（不同地区/国家可以有同名城市）
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { logger } from './src/utils/logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function removeUniqueIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_planner';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Get the destinations collection
    const db = mongoose.connection.db;
    const collection = db.collection('destinations');

    // List all indexes
    console.log('\n=== 当前索引列表 ===');
    const indexes = await collection.indexes();
    indexes.forEach((index: any) => {
      console.log(`索引名: ${index.name}`);
      console.log(`键: ${JSON.stringify(index.key)}`);
      console.log(`唯一: ${index.unique || false}`);
      console.log('---');
    });

    // Drop the unique index on name field
    try {
      await collection.dropIndex('name_1');
      console.log('\n✓ 成功删除 name_1 唯一索引');
    } catch (error: any) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('\n✓ name_1 索引不存在，无需删除');
      } else {
        throw error;
      }
    }

    // Create a non-unique index on name for search performance
    await collection.createIndex({ name: 1 }, { unique: false });
    console.log('✓ 创建非唯一 name 索引（用于搜索性能）');

    // Verify indexes after changes
    console.log('\n=== 更新后的索引列表 ===');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index: any) => {
      console.log(`索引名: ${index.name}`);
      console.log(`键: ${JSON.stringify(index.key)}`);
      console.log(`唯一: ${index.unique || false}`);
      console.log('---');
    });

    console.log('\n✓ 索引更新完成！现在可以添加同名目的地了。');
    
  } catch (error) {
    logger.error('Error removing unique index:', error);
    console.error('\n✗ 删除索引失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
removeUniqueIndex();
