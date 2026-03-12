# AI旅游攻略助手 (AI Travel Assistant)

智能旅游规划平台，通过AI技术为用户提供个性化的旅游建议、自动生成旅行攻略，并提供目的地信息管理和内容收藏功能。

## 📋 目录

- [项目介绍](#项目介绍)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
- [API文档](#api文档)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 项目介绍

AI旅游攻略助手是一个全栈Web应用，集成了OpenAI API提供智能旅游规划服务。用户可以：

- 与AI助手进行实时对话，获取旅游建议
- 自动生成个性化的旅行攻略
- 浏览和管理旅游目的地信息
- 收藏喜欢的攻略和对话记录
- 搜索相关的旅游内容

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架，使用Composition API
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具，提供快速开发体验
- **Pinia** - Vue 3官方状态管理库
- **Vue Router** - Vue官方路由管理器
- **Axios** - HTTP客户端，用于API通信
- **TailwindCSS** - 实用优先的CSS框架

### 后端
- **Node.js 18+** - JavaScript运行时
- **Express.js** - 轻量级Web应用框架
- **TypeScript** - 类型安全
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB ODM，提供Schema验证
- **JWT** - 身份认证令牌
- **bcrypt** - 密码加密库
- **Winston** - 日志管理系统
- **OpenAI SDK** - AI服务集成

### 第三方服务
- **OpenAI API** - 提供AI问答和攻略生成能力

## 功能特性

- ✅ **AI智能问答** - 向AI助手提问旅游相关问题，获取实时回答
- ✅ **旅游攻略生成** - 根据目的地、天数、预算自动生成完整旅行路线
- ✅ **用户注册与认证** - 安全的用户管理系统，支持JWT认证
- ✅ **个人资料管理** - 管理用户偏好、头像和联系方式
- ✅ **攻略收藏功能** - 收藏喜欢的攻略和对话记录
- ✅ **目的地信息管理** - 浏览热门旅游目的地，支持筛选和排序
- ✅ **搜索功能** - 全局搜索目的地、攻略和对话记录
- ✅ **错误处理** - 完善的错误处理和用户提示
- ✅ **日志记录** - 详细的系统日志和访问日志
- ✅ **速率限制** - 防止API滥用的速率限制

## 项目结构

```
.
├── backend/                          # 后端项目
│   ├── src/
│   │   ├── config/                  # 配置文件
│   │   │   ├── cors.ts              # CORS配置
│   │   │   ├── database.ts          # MongoDB连接
│   │   │   ├── openai.ts            # OpenAI客户端配置
│   │   │   └── security.ts          # 安全配置
│   │   ├── controllers/             # 控制器（请求处理）
│   │   │   ├── authController.ts    # 认证控制器
│   │   │   ├── aiController.ts      # AI问答控制器
│   │   │   ├── itineraryController.ts # 攻略控制器
│   │   │   ├── destinationController.ts # 目的地控制器
│   │   │   ├── collectionController.ts # 收藏控制器
│   │   │   └── searchController.ts  # 搜索控制器
│   │   ├── middleware/              # Express中间件
│   │   │   ├── auth.ts              # JWT认证中间件
│   │   │   ├── errorHandler.ts      # 错误处理中间件
│   │   │   ├── rateLimit.ts         # 速率限制中间件
│   │   │   ├── validation.ts        # 输入验证中间件
│   │   │   ├── cache.ts             # 响应缓存中间件
│   │   │   └── upload.ts            # 文件上传中间件
│   │   ├── models/                  # Mongoose数据模型
│   │   │   ├── User.ts              # 用户模型
│   │   │   ├── Conversation.ts      # 对话模型
│   │   │   ├── Itinerary.ts         # 攻略模型
│   │   │   ├── Destination.ts       # 目的地模型
│   │   │   └── Collection.ts        # 收藏模型
│   │   ├── routes/                  # API路由
│   │   │   ├── authRoutes.ts        # 认证路由
│   │   │   ├── ai.ts                # AI问答路由
│   │   │   ├── itineraryRoutes.ts   # 攻略路由
│   │   │   ├── destinationRoutes.ts # 目的地路由
│   │   │   ├── collectionRoutes.ts  # 收藏路由
│   │   │   ├── searchRoutes.ts      # 搜索路由
│   │   │   └── userRoutes.ts        # 用户路由
│   │   ├── services/                # 业务逻辑层
│   │   │   ├── userService.ts       # 用户服务
│   │   │   ├── aiService.ts         # AI服务
│   │   │   ├── destinationService.ts # 目的地服务
│   │   │   ├── collectionService.ts # 收藏服务
│   │   │   └── searchService.ts     # 搜索服务
│   │   ├── types/                   # TypeScript类型定义
│   │   ├── utils/                   # 工具函数
│   │   │   ├── jwt.ts               # JWT工具
│   │   │   ├── password.ts          # 密码加密工具
│   │   │   ├── logger.ts            # 日志工具
│   │   │   ├── pagination.ts        # 分页工具
│   │   │   └── aiQueue.ts           # AI请求队列
│   │   ├── __tests__/               # 集成测试
│   │   └── server.ts                # 服务器入口
│   ├── uploads/                     # 文件上传目录
│   ├── logs/                        # 日志目录
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                    # 后端文档
├── src/                             # 前端项目
│   ├── assets/                      # 静态资源
│   ├── components/                  # Vue组件
│   │   ├── Header.vue               # 头部导航
│   │   ├── Sidebar.vue              # 侧边栏
│   │   ├── ChatMessage.vue          # 聊天消息组件
│   │   ├── ChatInput.vue            # 聊天输入组件
│   │   ├── DestinationCard.vue      # 目的地卡片
│   │   ├── DestinationDetail.vue    # 目的地详情
│   │   ├── ItineraryForm.vue        # 攻略表单
│   │   ├── ItineraryDisplay.vue     # 攻略显示
│   │   ├── CollectionItem.vue       # 收藏项组件
│   │   └── ...其他组件
│   ├── views/                       # 页面组件
│   │   ├── Home.vue                 # 首页
│   │   ├── Chat.vue                 # AI问答页面
│   │   ├── ItineraryGenerator.vue   # 攻略生成页面
│   │   ├── Destinations.vue         # 目的地浏览页面
│   │   ├── Collections.vue          # 收藏页面
│   │   ├── SearchResults.vue        # 搜索结果页面
│   │   ├── Login.vue                # 登录页面
│   │   ├── Register.vue             # 注册页面
│   │   └── Profile.vue              # 个人资料页面
│   ├── stores/                      # Pinia状态管理
│   │   ├── auth.ts                  # 认证Store
│   │   ├── chat.ts                  # 聊天Store
│   │   ├── itinerary.ts             # 攻略Store
│   │   ├── destination.ts           # 目的地Store
│   │   └── collection.ts            # 收藏Store
│   ├── api/                         # API客户端
│   │   ├── auth.ts                  # 认证API
│   │   ├── chat.ts                  # 聊天API
│   │   ├── itinerary.ts             # 攻略API
│   │   ├── destination.ts           # 目的地API
│   │   ├── collection.ts            # 收藏API
│   │   └── search.ts                # 搜索API
│   ├── types/                       # TypeScript类型
│   ├── router/                      # Vue Router配置
│   ├── App.vue                      # 根组件
│   └── main.ts                      # 入口文件
├── .kiro/                           # Kiro规范文档
│   └── specs/
│       └── ai-travel-assistant/
│           ├── requirements.md      # 需求文档
│           ├── design.md            # 设计文档
│           └── tasks.md             # 任务列表
├── docker-compose.yml               # Docker Compose配置
├── Dockerfile                       # 前端Docker镜像
├── nginx.conf                       # Nginx配置
├── package.json                     # 前端依赖
├── tsconfig.json                    # TypeScript配置
├── vite.config.ts                   # Vite配置
└── README.md                        # 项目说明
```

## 环境要求

- **Node.js** 18.0.0 或更高版本
- **MongoDB** 6.0 或更高版本
- **npm** 9.0 或更高版本
- **OpenAI API密钥** (用于AI功能)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel-assistant
```

### 2. 安装依赖

#### 安装前端依赖
```bash
npm install
```

#### 安装后端依赖
```bash
cd backend
npm install
cd ..
```

### 3. 配置环境变量

#### 后端环境变量

在 `backend` 目录下创建 `.env` 文件（参考 `.env.example`）：

```env
# 服务器配置
NODE_ENV=development
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/ai-travel-assistant

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key-here

# CORS配置
CORS_ORIGIN=http://localhost:3000

# 日志配置
LOG_LEVEL=debug

# 文件上传配置
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

#### 前端环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# macOS (使用Homebrew)
brew services start mongodb-community

# Linux (使用systemd)
sudo systemctl start mongod

# Windows
# 启动MongoDB服务或运行mongod.exe

# Docker方式
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. 初始化数据库

运行种子数据脚本初始化目的地数据：

```bash
cd backend
npm run seed
cd ..
```

### 6. 启动开发服务器

#### 启动后端服务器

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:5000` 运行

#### 启动前端开发服务器

在新的终端窗口中：

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 运行

### 7. 访问应用

打开浏览器访问 `http://localhost:3000`

## 环境变量配置

### 后端环境变量详解

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `development` / `production` |
| `PORT` | 服务器端口 | `5000` |
| `MONGODB_URI` | MongoDB连接字符串 | `mongodb://localhost:27017/ai-travel-assistant` |
| `JWT_SECRET` | JWT签名密钥 | 任意长字符串（生产环境必须修改） |
| `JWT_EXPIRES_IN` | JWT过期时间 | `24h` |
| `OPENAI_API_KEY` | OpenAI API密钥 | 从OpenAI获取 |
| `CORS_ORIGIN` | CORS允许的源 | `http://localhost:3000` |
| `LOG_LEVEL` | 日志级别 | `debug` / `info` / `warn` / `error` |
| `MAX_FILE_SIZE` | 最大文件上传大小（字节） | `5242880` (5MB) |
| `UPLOAD_DIR` | 文件上传目录 | `uploads` |

### 前端环境变量详解

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API基础URL | `http://localhost:5000/api` |

## API文档

详细的API文档请参考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 快速API参考

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/verify` - 验证token

#### 用户相关
- `GET /api/users/profile` - 获取当前用户资料
- `PUT /api/users/profile` - 更新用户资料
- `POST /api/users/avatar` - 上传头像
- `DELETE /api/users/account` - 删除账号

#### AI问答相关
- `POST /api/chat` - 发送消息
- `GET /api/chat/conversations` - 获取对话列表
- `GET /api/chat/conversations/:id` - 获取特定对话
- `DELETE /api/chat/conversations/:id` - 删除对话

#### 攻略生成相关
- `POST /api/itineraries/generate` - 生成攻略
- `GET /api/itineraries` - 获取攻略列表
- `GET /api/itineraries/:id` - 获取特定攻略
- `PUT /api/itineraries/:id` - 更新攻略
- `DELETE /api/itineraries/:id` - 删除攻略

#### 目的地相关
- `GET /api/destinations` - 获取目的地列表
- `GET /api/destinations/:id` - 获取目的地详情
- `GET /api/destinations/popular` - 获取热门目的地
- `POST /api/destinations` - 创建目的地（管理员）
- `PUT /api/destinations/:id` - 更新目的地（管理员）

#### 收藏相关
- `GET /api/collections` - 获取收藏列表
- `POST /api/collections` - 添加收藏
- `DELETE /api/collections/:id` - 移除收藏
- `GET /api/collections/check/:id` - 检查是否已收藏

#### 搜索相关
- `GET /api/search` - 全局搜索
- `GET /api/search/destinations` - 搜索目的地
- `GET /api/search/itineraries` - 搜索攻略
- `GET /api/search/conversations` - 搜索对话

## 开发指南

详细的开发指南请参考 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

### 代码规范

项目使用ESLint和Prettier进行代码规范检查和格式化。

**运行代码检查：**
```bash
# 前端
npm run lint

# 后端
cd backend
npm run lint
```

**格式化代码：**
```bash
# 前端
npm run format

# 后端
cd backend
npm run format
```

### Git提交规范

使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

示例：
```bash
git commit -m "feat: 添加用户注册功能"
git commit -m "fix: 修复登录token过期问题"
git commit -m "docs: 更新API文档"
```

## 部署指南

详细的部署指南请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Docker部署

项目支持Docker容器化部署。

**构建镜像：**
```bash
docker-compose build
```

**启动容器：**
```bash
docker-compose up -d
```

**停止容器：**
```bash
docker-compose down
```

### 传统部署

1. 构建前后端项目
2. 配置生产环境变量
3. 使用PM2或类似工具管理Node.js进程
4. 配置Nginx反向代理
5. 配置HTTPS证书

## 常见问题

### Q: 如何获取OpenAI API密钥？

A: 访问 [OpenAI官网](https://platform.openai.com/api-keys) 注册账号并创建API密钥。

### Q: MongoDB连接失败怎么办？

A: 
1. 确保MongoDB服务正在运行
2. 检查MONGODB_URI是否正确
3. 检查防火墙设置
4. 查看后端日志获取详细错误信息

### Q: 如何修改JWT过期时间？

A: 修改 `backend/.env` 中的 `JWT_EXPIRES_IN` 变量，例如 `48h` 表示48小时。

### Q: 如何增加文件上传大小限制？

A: 修改 `backend/.env` 中的 `MAX_FILE_SIZE` 变量，单位为字节。例如 `10485760` 表示10MB。

### Q: 生产环境如何配置HTTPS？

A: 参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 中的HTTPS配置部分。

### Q: 如何查看系统日志？

A: 日志文件存储在 `backend/logs/` 目录下，可以使用以下命令查看：
```bash
tail -f backend/logs/combined.log
```

## 安全注意事项

- ⚠️ **生产环境必须修改 `JWT_SECRET`** - 使用强随机字符串
- ⚠️ **不要将 `.env` 文件提交到版本控制** - 已在 `.gitignore` 中配置
- ⚠️ **使用HTTPS保护API通信** - 生产环境必须启用
- ⚠️ **定期更新依赖包** - 修复安全漏洞
- ⚠️ **配置适当的CORS策略** - 限制允许的源
- ⚠️ **实施速率限制** - 防止API滥用
- ⚠️ **验证所有用户输入** - 防止注入攻击
- ⚠️ **不要在日志中记录敏感信息** - 如密码、token等

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题，请通过以下方式联系：
- 提交Issue
- 发送邮件至：[your-email@example.com]
