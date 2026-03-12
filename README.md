# AI旅游攻略助手 (AI Travel Assistant)

智能旅游规划平台，通过AI技术为用户提供个性化的旅游建议、自动生成旅行攻略，并提供目的地信息管理和内容收藏功能。

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 3状态管理库
- **Vue Router** - Vue官方路由管理器
- **Axios** - HTTP客户端
- **TailwindCSS** - 实用优先的CSS框架

### 后端
- **Node.js 18+** - JavaScript运行时
- **Express.js** - Web应用框架
- **TypeScript** - 类型安全
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcrypt** - 密码加密
- **Winston** - 日志管理

### 第三方服务
- **OpenAI API** - AI问答和攻略生成

## 功能特性

- ✅ AI智能问答 - 向AI助手提问旅游相关问题
- ✅ 旅游攻略生成 - 根据需求自动生成旅行路线和攻略
- ✅ 用户注册与认证 - 安全的用户管理系统
- ✅ 个人资料管理 - 管理用户偏好和信息
- ✅ 攻略收藏功能 - 收藏喜欢的攻略和对话
- ✅ 目的地信息管理 - 浏览热门旅游目的地
- ✅ 搜索功能 - 搜索目的地、攻略和对话记录

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── types/          # TypeScript类型定义
│   │   ├── utils/          # 工具函数
│   │   └── server.ts       # 服务器入口
│   ├── uploads/            # 文件上传目录
│   ├── logs/               # 日志目录
│   ├── package.json
│   └── tsconfig.json
├── src/                     # 前端项目
│   ├── assets/             # 静态资源
│   ├── composables/        # 组合式函数
│   ├── types/              # TypeScript类型
│   ├── views/              # 页面组件
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .kiro/                   # Kiro规范文档
│   └── specs/
│       └── ai-travel-assistant/
│           ├── requirements.md  # 需求文档
│           ├── design.md        # 设计文档
│           └── tasks.md         # 任务列表
├── package.json             # 前端依赖
└── README.md               # 项目说明
```

## 环境要求

- Node.js 18+
- MongoDB 6+
- OpenAI API密钥

## 安装和运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel-assistant
```

### 2. 安装依赖

#### 前端依赖
```bash
npm install
```

#### 后端依赖
```bash
cd backend
npm install
```

### 3. 配置环境变量

#### 后端环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-travel-assistant

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# File Upload
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
```

### 5. 运行项目

#### 开发模式

**启动后端服务器：**
```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:5000` 运行

**启动前端开发服务器：**
```bash
# 在项目根目录
npm run dev
```

前端应用将在 `http://localhost:3000` 运行

#### 生产模式

**构建后端：**
```bash
cd backend
npm run build
npm start
```

**构建前端：**
```bash
npm run build
npm run preview
```

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/verify` - 验证token

### 用户相关
- `GET /api/users/profile` - 获取当前用户资料
- `PUT /api/users/profile` - 更新用户资料
- `POST /api/users/avatar` - 上传头像
- `DELETE /api/users/account` - 删除账号

### AI问答相关
- `POST /api/chat` - 发送消息
- `GET /api/chat/conversations` - 获取对话列表
- `GET /api/chat/conversations/:id` - 获取特定对话
- `DELETE /api/chat/conversations/:id` - 删除对话

### 攻略生成相关
- `POST /api/itineraries/generate` - 生成攻略
- `GET /api/itineraries` - 获取攻略列表
- `GET /api/itineraries/:id` - 获取特定攻略
- `PUT /api/itineraries/:id` - 更新攻略
- `DELETE /api/itineraries/:id` - 删除攻略

### 目的地相关
- `GET /api/destinations` - 获取目的地列表
- `GET /api/destinations/:id` - 获取目的地详情
- `GET /api/destinations/popular` - 获取热门目的地

### 收藏相关
- `GET /api/collections` - 获取收藏列表
- `POST /api/collections` - 添加收藏
- `DELETE /api/collections/:id` - 移除收藏
- `GET /api/collections/check/:id` - 检查是否已收藏

### 搜索相关
- `GET /api/search` - 全局搜索
- `GET /api/search/destinations` - 搜索目的地
- `GET /api/search/itineraries` - 搜索攻略
- `GET /api/search/conversations` - 搜索对话

## 开发指南

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
```

## 部署

### Docker部署

项目支持Docker容器化部署（配置文件待添加）。

### 传统部署

1. 构建前后端项目
2. 配置生产环境变量
3. 使用PM2或类似工具管理Node.js进程
4. 配置Nginx反向代理
5. 配置HTTPS证书

## 安全注意事项

- ⚠️ 生产环境必须修改 `JWT_SECRET`
- ⚠️ 不要将 `.env` 文件提交到版本控制
- ⚠️ 使用HTTPS保护API通信
- ⚠️ 定期更新依赖包以修复安全漏洞
- ⚠️ 配置适当的CORS策略
- ⚠️ 实施速率限制防止滥用

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题，请通过以下方式联系：
- 提交Issue
- 发送邮件至：[your-email@example.com]
