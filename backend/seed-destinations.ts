/**
 * Seed script to populate destinations collection with sample data
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Destination } from './src/models/Destination.js';
import { logger } from './src/utils/logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const sampleDestinations = [
  {
    name: '东京',
    nameEn: 'Tokyo',
    region: '亚洲',
    country: '日本',
    type: ['文化', '美食', '购物', '现代'],
    description:
      '东京是日本的首都，是一座充满活力的现代化大都市。这里既有传统的寺庙神社，也有繁华的购物街和高科技的娱乐设施。东京的美食文化世界闻名，从米其林星级餐厅到街边小吃应有尽有。',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    ],
    attractions: [
      {
        name: '浅草寺',
        description: '东京最古老的寺庙，充满传统日本风情',
        ticketPrice: 0,
        openingHours: '06:00-17:00',
      },
      {
        name: '东京塔',
        description: '东京的标志性建筑，可俯瞰整个城市',
        ticketPrice: 1200,
        openingHours: '09:00-23:00',
      },
      {
        name: '筑地市场',
        description: '世界著名的海鲜市场，品尝新鲜寿司的最佳地点',
        ticketPrice: 0,
        openingHours: '05:00-14:00',
      },
    ],
    bestTimeToVisit: '3-5月（春季赏樱）或9-11月（秋季赏枫）',
    averageBudget: {
      min: 5000,
      max: 15000,
      currency: 'CNY',
    },
    climate: '温带海洋性气候，四季分明',
    transportation: '地铁和JR线路发达，建议购买交通卡',
    tips: [
      '提前预订热门餐厅',
      '购买西瓜卡方便乘坐公共交通',
      '注意垃圾分类规则',
      '学习基本日语礼貌用语',
    ],
    popularity: 95,
  },
  {
    name: '巴黎',
    nameEn: 'Paris',
    region: '欧洲',
    country: '法国',
    type: ['文化', '艺术', '历史', '美食'],
    description:
      '巴黎是法国的首都，被誉为"光之城"和"浪漫之都"。这座城市拥有世界级的博物馆、标志性的建筑和精致的法式美食。漫步在塞纳河畔，感受这座城市独特的艺术气息和浪漫氛围。',
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    ],
    attractions: [
      {
        name: '埃菲尔铁塔',
        description: '巴黎的象征，登顶可欣赏城市全景',
        ticketPrice: 150,
        openingHours: '09:30-23:45',
      },
      {
        name: '卢浮宫',
        description: '世界最大的艺术博物馆，收藏无数珍宝',
        ticketPrice: 120,
        openingHours: '09:00-18:00',
      },
      {
        name: '凯旋门',
        description: '纪念拿破仑战争胜利的标志性建筑',
        ticketPrice: 80,
        openingHours: '10:00-23:00',
      },
    ],
    bestTimeToVisit: '4-6月或9-10月，气候宜人且游客相对较少',
    averageBudget: {
      min: 8000,
      max: 20000,
      currency: 'CNY',
    },
    climate: '温带海洋性气候，冬季温和多雨，夏季温暖',
    transportation: '地铁系统发达，建议购买巴黎通票',
    tips: [
      '提前预订博物馆门票避免排队',
      '注意扒手，保管好贵重物品',
      '学习基本法语问候语',
      '尝试当地特色面包店和咖啡馆',
    ],
    popularity: 98,
  },
  {
    name: '三亚',
    nameEn: 'Sanya',
    region: '亚洲',
    country: '中国',
    type: ['海滨', '度假', '自然'],
    description:
      '三亚位于海南岛最南端，是中国著名的热带海滨度假城市。这里拥有细腻的沙滩、清澈的海水和丰富的热带风光。全年温暖的气候使其成为冬季避寒的理想目的地。',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    ],
    attractions: [
      {
        name: '亚龙湾',
        description: '被誉为"天下第一湾"，沙滩细腻，海水清澈',
        ticketPrice: 0,
        openingHours: '全天开放',
      },
      {
        name: '天涯海角',
        description: '著名的海滨风景区，象征着天涯海角的浪漫',
        ticketPrice: 95,
        openingHours: '07:30-18:30',
      },
      {
        name: '南山文化旅游区',
        description: '佛教文化主题景区，有108米高的海上观音像',
        ticketPrice: 129,
        openingHours: '08:00-17:30',
      },
    ],
    bestTimeToVisit: '11月至次年4月，避开台风季节',
    averageBudget: {
      min: 3000,
      max: 10000,
      currency: 'CNY',
    },
    climate: '热带海洋性季风气候，全年温暖',
    transportation: '机场有直达市区和各景区的巴士，也可租车自驾',
    tips: [
      '提前预订酒店，旺季价格较高',
      '注意防晒，海边紫外线强',
      '品尝当地海鲜，但注意选择正规餐厅',
      '可以体验潜水、帆船等水上活动',
    ],
    popularity: 88,
  },
  {
    name: '纽约',
    nameEn: 'New York',
    region: '北美洲',
    country: '美国',
    type: ['现代', '文化', '购物', '艺术'],
    description:
      '纽约是美国最大的城市，被称为"世界之都"。这座不夜城汇聚了世界各地的文化、艺术和美食。从百老汇的音乐剧到大都会博物馆的艺术珍品，从华尔街的金融中心到时代广场的繁华，纽约展现着无与伦比的都市魅力。',
    images: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    ],
    attractions: [
      {
        name: '自由女神像',
        description: '美国的象征，可乘船登岛参观',
        ticketPrice: 150,
        openingHours: '09:00-17:00',
      },
      {
        name: '中央公园',
        description: '城市中的绿洲，适合散步和野餐',
        ticketPrice: 0,
        openingHours: '06:00-01:00',
      },
      {
        name: '帝国大厦',
        description: '纽约的标志性摩天大楼，观景台视野极佳',
        ticketPrice: 200,
        openingHours: '08:00-02:00',
      },
    ],
    bestTimeToVisit: '4-6月或9-11月，气候宜人',
    averageBudget: {
      min: 10000,
      max: 30000,
      currency: 'CNY',
    },
    climate: '温带大陆性气候，四季分明',
    transportation: '地铁系统发达，24小时运营',
    tips: [
      '提前购买百老汇演出票',
      '使用地铁卡更经济',
      '注意人身安全，避免深夜独行',
      '尝试各国美食，纽约是美食天堂',
    ],
    popularity: 96,
  },
  {
    name: '巴厘岛',
    nameEn: 'Bali',
    region: '亚洲',
    country: '印度尼西亚',
    type: ['海滨', '度假', '文化', '自然'],
    description:
      '巴厘岛是印度尼西亚最著名的旅游胜地，被誉为"众神之岛"。这里有美丽的海滩、壮观的火山、古老的寺庙和独特的巴厘文化。巴厘岛是冲浪、潜水和瑜伽爱好者的天堂。',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    ],
    attractions: [
      {
        name: '乌布皇宫',
        description: '巴厘岛文化中心，可欣赏传统舞蹈表演',
        ticketPrice: 50,
        openingHours: '08:00-19:00',
      },
      {
        name: '海神庙',
        description: '建在海边岩石上的古老寺庙，日落景色绝美',
        ticketPrice: 40,
        openingHours: '07:00-19:00',
      },
      {
        name: '德格拉朗梯田',
        description: '壮观的稻田梯田景观',
        ticketPrice: 20,
        openingHours: '08:00-18:00',
      },
    ],
    bestTimeToVisit: '4-10月（旱季），天气晴朗少雨',
    averageBudget: {
      min: 4000,
      max: 12000,
      currency: 'CNY',
    },
    climate: '热带雨林气候，全年温暖湿润',
    transportation: '租摩托车或包车游览，注意交通安全',
    tips: [
      '尊重当地宗教习俗，进寺庙需穿着得体',
      '讨价还价是常态',
      '尝试当地SPA和瑜伽课程',
      '注意食品卫生，避免生水',
    ],
    popularity: 92,
  },
];

async function seedDestinations() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-assistant';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing destinations
    const deleteResult = await Destination.deleteMany({});
    logger.info(`Cleared ${deleteResult.deletedCount} existing destinations`);

    // Insert sample destinations
    const result = await Destination.insertMany(sampleDestinations);
    logger.info(`Successfully seeded ${result.length} destinations`);

    // Display seeded destinations
    console.log('\n=== Seeded Destinations ===');
    result.forEach((dest, index) => {
      console.log(`${index + 1}. ${dest.name} (${dest.nameEn}) - Popularity: ${dest.popularity}`);
    });
    console.log('===========================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding destinations:', error);
    process.exit(1);
  }
}

seedDestinations();
