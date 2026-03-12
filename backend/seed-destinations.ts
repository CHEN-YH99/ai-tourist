/**
 * Seed script to populate destinations collection with sample data and create admin user
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Destination } from './src/models/Destination.js';
import { User } from './src/models/User.js';
import { hashPassword } from './src/utils/password.js';
import { logger } from './src/utils/logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Admin user credentials
const ADMIN_USER = {
  email: 'admin@travel-assistant.com',
  password: 'Admin@123456',
  username: 'admin',
};

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
    type: ['文化', '历史', '美食'],
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
    type: ['海滨', '自然'],
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
    type: ['现代', '文化', '购物'],
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
    type: ['海滨', '文化', '自然'],
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
  {
    name: '伦敦',
    nameEn: 'London',
    region: '欧洲',
    country: '英国',
    type: ['文化', '历史', '购物'],
    description:
      '伦敦是英国的首都，拥有悠久的历史和丰富的文化遗产。从威斯敏斯特教堂到大英博物馆，从泰晤士河畔的现代建筑到传统的红色电话亭，伦敦完美融合了古典与现代。',
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    ],
    attractions: [
      {
        name: '大本钟',
        description: '伦敦的标志性建筑，正式名称为伊丽莎白塔',
        ticketPrice: 0,
        openingHours: '全天可见',
      },
      {
        name: '大英博物馆',
        description: '世界最大的综合性博物馆，收藏丰富',
        ticketPrice: 0,
        openingHours: '09:00-17:30',
      },
      {
        name: '伦敦眼',
        description: '泰晤士河畔的摩天轮，可俯瞰伦敦全景',
        ticketPrice: 180,
        openingHours: '11:00-18:00',
      },
    ],
    bestTimeToVisit: '5-9月，气候温暖，活动丰富',
    averageBudget: {
      min: 8000,
      max: 18000,
      currency: 'CNY',
    },
    climate: '温带海洋性气候，全年温和多雨',
    transportation: '地铁系统发达，建议购买Oyster卡',
    tips: [
      '提前预订热门景点门票',
      '注意英国的左侧通行规则',
      '品尝传统英式下午茶',
      '逛逛伦敦的各大购物街',
    ],
    popularity: 94,
  },
  {
    name: '西安',
    nameEn: 'Xi\'an',
    region: '亚洲',
    country: '中国',
    type: ['历史', '文化'],
    description:
      '西安是中国古代文明的重要发源地，拥有丰富的历史文化遗产。秦兵马俑、古城墙、大雁塔等著名景点见证了中华文明的辉煌。西安的美食文化也享誉全国，是品尝陕西特色小吃的最佳地点。',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    ],
    attractions: [
      {
        name: '秦兵马俑',
        description: '世界八大奇迹之一，展现秦朝军队的壮观景象',
        ticketPrice: 150,
        openingHours: '08:30-17:00',
      },
      {
        name: '古城墙',
        description: '保存完整的古代城墙，可骑自行车环城',
        ticketPrice: 54,
        openingHours: '08:00-22:00',
      },
      {
        name: '大雁塔',
        description: '唐代建筑，是西安的标志性建筑',
        ticketPrice: 50,
        openingHours: '08:00-17:00',
      },
    ],
    bestTimeToVisit: '3-5月或9-11月，气候宜人',
    averageBudget: {
      min: 2000,
      max: 6000,
      currency: 'CNY',
    },
    climate: '温带大陆性气候，四季分明',
    transportation: '地铁和公交系统发达，建议购买交通卡',
    tips: [
      '提前预订兵马俑门票避免排队',
      '品尝陕西特色小吃：肉夹馍、羊肉汤、油泼面',
      '古城墙骑行是独特体验',
      '参加陕西民俗文化表演',
    ],
    popularity: 87,
  },
  {
    name: '迪拜',
    nameEn: 'Dubai',
    region: '亚洲',
    country: '阿联酋',
    type: ['现代', '购物', '冒险'],
    description:
      '迪拜是中东最现代化的城市，以其超现代的建筑、奢华的购物和独特的沙漠体验而闻名。从世界最高的哈利法塔到人工岛棕榈岛，迪拜展现了人类的建筑奇迹。',
    images: [
      'https://images.unsplash.com/photo-1512453475868-bada1adc6f30',
    ],
    attractions: [
      {
        name: '哈利法塔',
        description: '世界最高建筑，观景台视野无敌',
        ticketPrice: 200,
        openingHours: '10:00-23:00',
      },
      {
        name: '棕榈岛',
        description: '人工岛屿，拥有豪华酒店和度假设施',
        ticketPrice: 0,
        openingHours: '全天开放',
      },
      {
        name: '迪拜购物中心',
        description: '世界最大的购物中心之一',
        ticketPrice: 0,
        openingHours: '10:00-23:00',
      },
    ],
    bestTimeToVisit: '11月至次年3月，气候凉爽',
    averageBudget: {
      min: 8000,
      max: 25000,
      currency: 'CNY',
    },
    climate: '热带沙漠气候，夏季炎热，冬季温暖',
    transportation: '地铁系统现代化，出租车和打车应用便利',
    tips: [
      '冬季是最佳旅游季节',
      '体验沙漠冲沙和骆驼骑行',
      '尊重当地文化和宗教习俗',
      '购物时注意商品真伪',
    ],
    popularity: 90,
  },
  {
    name: '阿姆斯特丹',
    nameEn: 'Amsterdam',
    region: '欧洲',
    country: '荷兰',
    type: ['文化', '美食', '购物'],
    description:
      '阿姆斯特丹是荷兰的首都，以其独特的运河系统、自行车文化和艺术氛围而闻名。这座城市拥有众多世界级博物馆，如梵高美术馆和安妮之家，是艺术爱好者的天堂。',
    images: [
      'https://images.unsplash.com/photo-1520763185298-1b434c919eba',
    ],
    attractions: [
      {
        name: '梵高美术馆',
        description: '收藏梵高最多作品的博物馆',
        ticketPrice: 120,
        openingHours: '09:00-19:00',
      },
      {
        name: '安妮之家',
        description: '二战期间安妮·弗兰克躲藏的地方',
        ticketPrice: 100,
        openingHours: '09:00-22:00',
      },
      {
        name: '运河游船',
        description: '乘船游览阿姆斯特丹的运河系统',
        ticketPrice: 80,
        openingHours: '09:00-18:00',
      },
    ],
    bestTimeToVisit: '4-5月（郁金香季）或9-10月',
    averageBudget: {
      min: 6000,
      max: 15000,
      currency: 'CNY',
    },
    climate: '温带海洋性气候，冬季寒冷多雨',
    transportation: '自行车是主要交通工具，也可乘坐电车和公交',
    tips: [
      '租赁自行车体验当地生活',
      '品尝荷兰特色美食：芝士、煎饼、炸薯条',
      '参观当地的跳蚤市场',
      '尊重当地的开放文化',
    ],
    popularity: 89,
  },
  {
    name: '新加坡',
    nameEn: 'Singapore',
    region: '亚洲',
    country: '新加坡',
    type: ['现代', '美食', '购物', '自然'],
    description:
      '新加坡是亚洲最发达的城市国家，以其清洁、安全和高效的城市管理而闻名。这里融合了多种文化，拥有世界级的美食、购物和娱乐设施。滨海湾花园和圣淘沙岛是必去景点。',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    ],
    attractions: [
      {
        name: '滨海湾花园',
        description: '未来主义的花园，拥有超树和灯光秀',
        ticketPrice: 100,
        openingHours: '09:00-21:00',
      },
      {
        name: '圣淘沙岛',
        description: '度假胜地，拥有海滩、主题公园和酒店',
        ticketPrice: 0,
        openingHours: '全天开放',
      },
      {
        name: '滨海湾金沙酒店',
        description: '标志性建筑，拥有世界最高的无边泳池',
        ticketPrice: 0,
        openingHours: '全天可见',
      },
    ],
    bestTimeToVisit: '2-4月或7-9月，避开雨季',
    averageBudget: {
      min: 5000,
      max: 15000,
      currency: 'CNY',
    },
    climate: '热带气候，全年温暖湿润',
    transportation: '地铁系统发达，出租车和打车应用便利',
    tips: [
      '品尝多元文化美食：海南鸡饭、肉骨茶、咖喱',
      '购物时注意商场营业时间',
      '尊重多元文化和宗教',
      '体验夜间野生动物园',
    ],
    popularity: 91,
  },
  {
    name: '罗马',
    nameEn: 'Rome',
    region: '欧洲',
    country: '意大利',
    type: ['历史', '文化', '美食'],
    description:
      '罗马是意大利的首都，被誉为"永恒之城"。这座城市拥有2000多年的历史，古罗马遗迹、文艺复兴艺术和美味的意大利美食吸引着世界各地的游客。',
    images: [
      'https://images.unsplash.com/photo-1552832860-cfb67165eaf0',
    ],
    attractions: [
      {
        name: '斗兽场',
        description: '古罗马最著名的建筑，见证了帝国的辉煌',
        ticketPrice: 120,
        openingHours: '08:30-19:00',
      },
      {
        name: '梵蒂冈圣彼得大教堂',
        description: '世界最大的教堂，建筑宏伟壮观',
        ticketPrice: 100,
        openingHours: '07:00-19:00',
      },
      {
        name: '许愿池',
        description: '巴洛克风格的喷泉，投币许愿的传统',
        ticketPrice: 0,
        openingHours: '全天开放',
      },
    ],
    bestTimeToVisit: '4-6月或9-10月，气候宜人',
    averageBudget: {
      min: 6000,
      max: 16000,
      currency: 'CNY',
    },
    climate: '地中海气候，冬季温和，夏季炎热',
    transportation: '地铁、公交和出租车便利',
    tips: [
      '提前预订热门景点门票',
      '品尝意大利美食：意大利面、披萨、冰淇淋',
      '注意扒手，保管好贵重物品',
      '参加当地的美食之旅',
    ],
    popularity: 95,
  },
  {
    name: '悉尼',
    nameEn: 'Sydney',
    region: '大洋洲',
    country: '澳大利亚',
    type: ['海滨', '自然', '现代'],
    description:
      '悉尼是澳大利亚最大的城市，以其标志性的歌剧院和美丽的海滩而闻名。这座城市融合了现代都市风格和自然美景，是冲浪、潜水和海滩爱好者的天堂。',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    ],
    attractions: [
      {
        name: '悉尼歌剧院',
        description: '世界著名的建筑，可参加内部导览',
        ticketPrice: 150,
        openingHours: '09:00-17:00',
      },
      {
        name: '邦迪海滩',
        description: '悉尼最著名的海滩，适合冲浪和游泳',
        ticketPrice: 0,
        openingHours: '全天开放',
      },
      {
        name: '悉尼港大桥',
        description: '可攀登大桥，俯瞰整个悉尼港',
        ticketPrice: 200,
        openingHours: '08:00-21:00',
      },
    ],
    bestTimeToVisit: '9-11月（春季）或3-5月（秋季）',
    averageBudget: {
      min: 7000,
      max: 18000,
      currency: 'CNY',
    },
    climate: '温带海洋性气候，四季分明',
    transportation: '公交、火车和出租车便利',
    tips: [
      '体验冲浪课程',
      '品尝澳大利亚特色美食：牛排、海鲜',
      '参加海滩文化活动',
      '探索蓝山国家公园',
    ],
    popularity: 93,
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

    // Create or update admin user
    await createAdminUser();

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding destinations:', error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    logger.info('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      logger.info(`Admin user already exists: ${ADMIN_USER.email}`);
      console.log('\n=== Admin User ===');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Username: ${existingAdmin.username}`);
      console.log('==================\n');
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(ADMIN_USER.password);

    // Create admin user
    const adminUser = await User.create({
      email: ADMIN_USER.email,
      password: hashedPassword,
      username: ADMIN_USER.username,
      preferences: ['文化', '美食', '冒险'],
      avatar: null,
    });

    logger.info(`Admin user created successfully: ${adminUser.email}`);
    console.log('\n=== Admin User Created ===');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: ${ADMIN_USER.password}`);
    console.log('(Please change this password after first login)');
    console.log('==========================\n');
  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  }
}

seedDestinations();
