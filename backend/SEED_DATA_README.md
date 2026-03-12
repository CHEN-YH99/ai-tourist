# Seed Data and Admin User Setup

This document describes the seed data initialization process for the AI Travel Assistant application.

## Overview

The `seed-destinations.ts` script populates the MongoDB database with:
1. **12 Popular Destination Records** - Complete tourist destination data
2. **Admin User Account** - For system administration

## Running the Seed Script

### Prerequisites

- MongoDB is running and accessible
- Environment variables are configured in `.env`
- Node.js 18+ is installed

### Execution

```bash
# From the backend directory
npm run seed

# Or directly with ts-node
npx ts-node seed-destinations.ts
```

### Expected Output

```
=== Seeded Destinations ===
1. 东京 (Tokyo) - Popularity: 95
2. 巴黎 (Paris) - Popularity: 98
3. 三亚 (Sanya) - Popularity: 88
4. 纽约 (New York) - Popularity: 96
5. 巴厘岛 (Bali) - Popularity: 92
6. 伦敦 (London) - Popularity: 94
7. 西安 (Xi'an) - Popularity: 87
8. 迪拜 (Dubai) - Popularity: 90
9. 阿姆斯特丹 (Amsterdam) - Popularity: 89
10. 新加坡 (Singapore) - Popularity: 91
11. 罗马 (Rome) - Popularity: 95
12. 悉尼 (Sydney) - Popularity: 93
===========================

=== Admin User Created ===
Email: admin@travel-assistant.com
Username: admin
Password: Admin@123456
(Please change this password after first login)
==========================
```

## Seeded Destinations

### 1. 东京 (Tokyo) - Japan
- **Region**: Asia
- **Type**: Culture, Food, Shopping, Modern
- **Popularity**: 95/100
- **Budget**: ¥5,000 - ¥15,000
- **Key Attractions**:
  - 浅草寺 (Senso-ji Temple) - Free
  - 东京塔 (Tokyo Tower) - ¥1,200
  - 筑地市场 (Tsukiji Market) - Free
- **Best Time**: March-May (Cherry Blossoms) or September-November (Autumn)

### 2. 巴黎 (Paris) - France
- **Region**: Europe
- **Type**: Culture, Art, History, Food
- **Popularity**: 98/100
- **Budget**: ¥8,000 - ¥20,000
- **Key Attractions**:
  - 埃菲尔铁塔 (Eiffel Tower) - ¥150
  - 卢浮宫 (Louvre Museum) - ¥120
  - 凯旋门 (Arc de Triomphe) - ¥80
- **Best Time**: April-June or September-October

### 3. 三亚 (Sanya) - China
- **Region**: Asia
- **Type**: Beach, Resort, Nature
- **Popularity**: 88/100
- **Budget**: ¥3,000 - ¥10,000
- **Key Attractions**:
  - 亚龙湾 (Yalong Bay) - Free
  - 天涯海角 (End of the Earth) - ¥95
  - 南山文化旅游区 (Nanshan Cultural Park) - ¥129
- **Best Time**: November-April (Avoid typhoon season)

### 4. 纽约 (New York) - USA
- **Region**: North America
- **Type**: Modern, Culture, Shopping, Art
- **Popularity**: 96/100
- **Budget**: ¥10,000 - ¥30,000
- **Key Attractions**:
  - 自由女神像 (Statue of Liberty) - ¥150
  - 中央公园 (Central Park) - Free
  - 帝国大厦 (Empire State Building) - ¥200
- **Best Time**: April-June or September-November

### 5. 巴厘岛 (Bali) - Indonesia
- **Region**: Asia
- **Type**: Beach, Resort, Culture, Nature
- **Popularity**: 92/100
- **Budget**: ¥4,000 - ¥12,000
- **Key Attractions**:
  - 乌布皇宫 (Ubud Palace) - ¥50
  - 海神庙 (Tanah Lot Temple) - ¥40
  - 德格拉朗梯田 (Tegallalang Rice Terraces) - ¥20
- **Best Time**: April-October (Dry season)

### 6. 伦敦 (London) - UK
- **Region**: Europe
- **Type**: Culture, History, Shopping, Art
- **Popularity**: 94/100
- **Budget**: ¥8,000 - ¥18,000
- **Key Attractions**:
  - 大本钟 (Big Ben) - Free
  - 大英博物馆 (British Museum) - Free
  - 伦敦眼 (London Eye) - ¥180
- **Best Time**: May-September

### 7. 西安 (Xi'an) - China
- **Region**: Asia
- **Type**: History, Culture, Art
- **Popularity**: 87/100
- **Budget**: ¥2,000 - ¥6,000
- **Key Attractions**:
  - 秦兵马俑 (Terracotta Army) - ¥150
  - 古城墙 (Ancient City Wall) - ¥54
  - 大雁塔 (Big Wild Goose Pagoda) - ¥50
- **Best Time**: March-May or September-November

### 8. 迪拜 (Dubai) - UAE
- **Region**: Asia
- **Type**: Modern, Shopping, Resort, Adventure
- **Popularity**: 90/100
- **Budget**: ¥8,000 - ¥25,000
- **Key Attractions**:
  - 哈利法塔 (Burj Khalifa) - ¥200
  - 棕榈岛 (Palm Island) - Free
  - 迪拜购物中心 (Dubai Mall) - Free
- **Best Time**: November-March (Cool weather)

### 9. 阿姆斯特丹 (Amsterdam) - Netherlands
- **Region**: Europe
- **Type**: Culture, Art, Food, Shopping
- **Popularity**: 89/100
- **Budget**: ¥6,000 - ¥15,000
- **Key Attractions**:
  - 梵高美术馆 (Van Gogh Museum) - ¥120
  - 安妮之家 (Anne Frank House) - ¥100
  - 运河游船 (Canal Cruise) - ¥80
- **Best Time**: April-May (Tulip season) or September-October

### 10. 新加坡 (Singapore) - Singapore
- **Region**: Asia
- **Type**: Modern, Food, Shopping, Nature
- **Popularity**: 91/100
- **Budget**: ¥5,000 - ¥15,000
- **Key Attractions**:
  - 滨海湾花园 (Gardens by the Bay) - ¥100
  - 圣淘沙岛 (Sentosa Island) - Free
  - 滨海湾金沙酒店 (Marina Bay Sands) - Free to view
- **Best Time**: February-April or July-September

### 11. 罗马 (Rome) - Italy
- **Region**: Europe
- **Type**: History, Culture, Art, Food
- **Popularity**: 95/100
- **Budget**: ¥6,000 - ¥16,000
- **Key Attractions**:
  - 斗兽场 (Colosseum) - ¥120
  - 梵蒂冈圣彼得大教堂 (St. Peter's Basilica) - ¥100
  - 许愿池 (Trevi Fountain) - Free
- **Best Time**: April-June or September-October

### 12. 悉尼 (Sydney) - Australia
- **Region**: Oceania
- **Type**: Beach, Resort, Nature, Modern
- **Popularity**: 93/100
- **Budget**: ¥7,000 - ¥18,000
- **Key Attractions**:
  - 悉尼歌剧院 (Sydney Opera House) - ¥150
  - 邦迪海滩 (Bondi Beach) - Free
  - 悉尼港大桥 (Sydney Harbour Bridge) - ¥200
- **Best Time**: September-November (Spring) or March-May (Autumn)

## Admin User Account

### Default Credentials

- **Email**: `admin@travel-assistant.com`
- **Username**: `admin`
- **Password**: `Admin@123456`
- **Preferences**: Culture, Food, Adventure

### Important Notes

1. **Change Password After First Login**: The default password should be changed immediately after first login for security reasons.

2. **Admin Permissions**: The admin user has the following capabilities:
   - Create, read, update, and delete destinations
   - Manage user accounts
   - View system logs and analytics
   - Configure system settings

3. **Idempotent Creation**: The script checks if the admin user already exists before creating it. If the admin user exists, it will display the existing credentials without creating a duplicate.

## Data Schema

### Destination Schema

Each destination record includes:

```typescript
{
  name: string;                    // Destination name (unique)
  nameEn: string;                  // English name
  region: string;                  // Geographic region
  country: string;                 // Country name
  type: string[];                  // Types (e.g., 'Beach', 'Culture', 'Food')
  description: string;             // Detailed description
  images: string[];                // Image URLs
  attractions: {
    name: string;
    description: string;
    image?: string;
    ticketPrice?: number;
    openingHours?: string;
  }[];
  bestTimeToVisit: string;         // Best time to visit
  averageBudget: {
    min: number;
    max: number;
    currency: string;
  };
  climate: string;                 // Climate description
  transportation: string;          // Transportation info
  tips: string[];                  // Travel tips
  popularity: number;              // Popularity score (0-100)
  createdAt: Date;                 // Auto-generated
  updatedAt: Date;                 // Auto-generated
}
```

## Troubleshooting

### Connection Issues

If you encounter MongoDB connection errors:

1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check `MONGODB_URI` in `.env` file
3. Ensure database credentials are correct

### Duplicate Key Error

If you get a duplicate key error:

1. The script clears existing destinations before seeding
2. If the error persists, manually clear the collection:
   ```javascript
   db.destinations.deleteMany({})
   ```

### Admin User Already Exists

If the admin user already exists:

1. The script will display the existing admin credentials
2. To reset the admin password, delete the user and re-run the script:
   ```javascript
   db.users.deleteOne({ email: 'admin@travel-assistant.com' })
   ```

## Verification

After running the seed script, verify the data:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use ai-travel-assistant

# Check destinations
db.destinations.countDocuments()  # Should return 12

# Check admin user
db.users.findOne({ email: 'admin@travel-assistant.com' })

# Check destination details
db.destinations.findOne({ name: '东京' })
```

## API Integration

Once seeded, the destinations are available through the API:

```bash
# Get all destinations
GET /api/destinations

# Get popular destinations
GET /api/destinations/popular

# Get specific destination
GET /api/destinations/:id

# Search destinations
GET /api/search/destinations?query=Tokyo
```

## Maintenance

### Updating Seed Data

To add or modify destinations:

1. Edit the `sampleDestinations` array in `seed-destinations.ts`
2. Re-run the seed script
3. The script will clear existing data and insert new data

### Backing Up Seed Data

To export current destinations:

```bash
mongoexport --db ai-travel-assistant --collection destinations --out destinations-backup.json
```

To restore from backup:

```bash
mongoimport --db ai-travel-assistant --collection destinations --file destinations-backup.json
```

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 6.7**: Displays at least 10 popular destinations on the homepage
- **Requirement 6.5**: Admin can create and manage destinations
- **Requirement 6.6**: Admin has appropriate permissions configured
- **Requirement 6.2**: Each destination includes complete information (attractions, images, budget)

## Next Steps

1. Run the seed script to populate the database
2. Log in with admin credentials
3. Verify destinations appear in the UI
4. Update admin password for security
5. Add additional destinations as needed through the admin interface
