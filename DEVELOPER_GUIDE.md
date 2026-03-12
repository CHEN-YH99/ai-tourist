# 开发者指南 - AI旅游攻略助手

## 目录

- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 项目结构

### 后端项目结构

```
backend/
├── src/
│   ├── config/              # 配置文件
│   │   ├── cors.ts          # CORS配置
│   │   ├── database.ts      # MongoDB连接配置
│   │   ├── openai.ts        # OpenAI客户端配置
│   │   └── security.ts      # 安全配置（helmet、速率限制等）
│   │
│   ├── controllers/         # 控制器层（请求处理）
│   │   ├── authController.ts    # 认证相关
│   │   ├── aiController.ts      # AI问答相关
│   │   ├── itineraryController.ts # 攻略相关
│   │   ├── destinationController.ts # 目的地相关
│   │   ├── collectionController.ts # 收藏相关
│   │   └── searchController.ts  # 搜索相关
│   │
│   ├── middleware/          # Express中间件
│   │   ├── auth.ts          # JWT认证中间件
│   │   ├── errorHandler.ts  # 全局错误处理
│   │   ├── rateLimit.ts     # 速率限制
│   │   ├── validation.ts    # 输入验证
│   │   ├── cache.ts         # 响应缓存
│   │   ├── responseFormatter.ts # 响应格式化
│   │   └── upload.ts        # 文件上传处理
│   │
│   ├── models/              # Mongoose数据模型
│   │   ├── User.ts          # 用户模型
│   │   ├── Conversation.ts  # 对话模型
│   │   ├── Itinerary.ts     # 攻略模型
│   │   ├── Destination.ts   # 目的地模型
│   │   ├── Collection.ts    # 收藏模型
│   │   └── index.ts         # 模型导出
│   │
│   ├── routes/              # API路由
│   │   ├── authRoutes.ts    # 认证路由
│   │   ├── ai.ts            # AI问答路由
│   │   ├── itineraryRoutes.ts # 攻略路由
│   │   ├── destinationRoutes.ts # 目的地路由
│   │   ├── collectionRoutes.ts # 收藏路由
│   │   ├── searchRoutes.ts  # 搜索路由
│   │   └── userRoutes.ts    # 用户路由
│   │
│   ├── services/            # 业务逻辑层
│   │   ├── userService.ts   # 用户服务
│   │   ├── aiService.ts     # AI服务
│   │   ├── destinationService.ts # 目的地服务
│   │   ├── collectionService.ts # 收藏服务
│   │   └── searchService.ts # 搜索服务
│   │
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts         # 类型导出
│   │
│   ├── utils/               # 工具函数
│   │   ├── jwt.ts           # JWT工具
│   │   ├── password.ts      # 密码加密工具
│   │   ├── logger.ts        # 日志工具
│   │   ├── pagination.ts    # 分页工具
│   │   └── aiQueue.ts       # AI请求队列
│   │
│   ├── __tests__/           # 测试文件
│   │   ├── integration/     # 集成测试
│   │   └── setup.ts         # 测试配置
│   │
│   └── server.ts            # 服务器入口
│
├── uploads/                 # 文件上传目录
├── logs/                    # 日志目录
├── package.json
├── tsconfig.json
└── README.md
```

### 前端项目结构

```
src/
├── assets/                  # 静态资源
│   ├── images/
│   └── styles/
│
├── components/              # Vue组件
│   ├── Header.vue           # 头部导航
│   ├── Sidebar.vue          # 侧边栏
│   ├── ChatMessage.vue      # 聊天消息
│   ├── ChatInput.vue        # 聊天输入
│   ├── DestinationCard.vue  # 目的地卡片
│   ├── DestinationDetail.vue # 目的地详情
│   ├── ItineraryForm.vue    # 攻略表单
│   ├── ItineraryDisplay.vue # 攻略显示
│   ├── CollectionItem.vue   # 收藏项
│   └── ...其他组件
│
├── views/                   # 页面组件
│   ├── Home.vue             # 首页
│   ├── Chat.vue             # AI问答页面
│   ├── ItineraryGenerator.vue # 攻略生成页面
│   ├── Destinations.vue     # 目的地浏览页面
│   ├── Collections.vue      # 收藏页面
│   ├── SearchResults.vue    # 搜索结果页面
│   ├── Login.vue            # 登录页面
│   ├── Register.vue         # 注册页面
│   └── Profile.vue          # 个人资料页面
│
├── stores/                  # Pinia状态管理
│   ├── auth.ts              # 认证Store
│   ├── chat.ts              # 聊天Store
│   ├── itinerary.ts         # 攻略Store
│   ├── destination.ts       # 目的地Store
│   └── collection.ts        # 收藏Store
│
├── api/                     # API客户端
│   ├── auth.ts              # 认证API
│   ├── chat.ts              # 聊天API
│   ├── itinerary.ts         # 攻略API
│   ├── destination.ts       # 目的地API
│   ├── collection.ts        # 收藏API
│   └── search.ts            # 搜索API
│
├── types/                   # TypeScript类型
│   └── index.ts
│
├── router/                  # Vue Router配置
│   └── index.ts
│
├── App.vue                  # 根组件
└── main.ts                  # 入口文件
```

## 开发环境设置

### 1. 安装Node.js和npm

```bash
# 检查版本
node --version  # 应该是18.0.0或更高
npm --version   # 应该是9.0或更高
```

### 2. 安装MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. 克隆项目并安装依赖

```bash
git clone <repository-url>
cd ai-travel-assistant

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 4. 配置环境变量

```bash
# 后端环境变量
cp backend/.env.example backend/.env

# 前端环境变量
cp .env.example .env
```

### 5. 启动开发服务器

```bash
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端
npm run dev
```

## 开发流程

### 添加新功能的步骤

#### 1. 后端开发

**步骤1: 定义数据模型**

在 `backend/src/models/` 中创建或修改Mongoose模型：

```typescript
// backend/src/models/Example.ts
import { Schema, model } from 'mongoose';

interface IExample {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const exampleSchema = new Schema<IExample>({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

export const Example = model<IExample>('Example', exampleSchema);
```

**步骤2: 创建Service**

在 `backend/src/services/` 中创建业务逻辑：

```typescript
// backend/src/services/exampleService.ts
import { Example } from '../models/Example';

export class ExampleService {
  async create(data: any) {
    const example = new Example(data);
    return await example.save();
  }

  async getById(id: string) {
    return await Example.findById(id);
  }

  async update(id: string, data: any) {
    return await Example.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Example.findByIdAndDelete(id);
  }
}
```

**步骤3: 创建Controller**

在 `backend/src/controllers/` 中创建请求处理器：

```typescript
// backend/src/controllers/exampleController.ts
import { Request, Response } from 'express';
import { ExampleService } from '../services/exampleService';

const exampleService = new ExampleService();

export const createExample = async (req: Request, res: Response) => {
  try {
    const example = await exampleService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: example
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getExample = async (req: Request, res: Response) => {
  try {
    const example = await exampleService.getById(req.params.id);
    res.json({
      status: 'success',
      data: example
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
```

**步骤4: 创建路由**

在 `backend/src/routes/` 中创建API路由：

```typescript
// backend/src/routes/exampleRoutes.ts
import { Router } from 'express';
import { createExample, getExample } from '../controllers/exampleController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createExample);
router.get('/:id', getExample);

export default router;
```

**步骤5: 注册路由**

在 `backend/src/server.ts` 中注册新路由：

```typescript
import exampleRoutes from './routes/exampleRoutes';

app.use('/api/examples', exampleRoutes);
```

#### 2. 前端开发

**步骤1: 创建API客户端**

在 `src/api/` 中创建API调用函数：

```typescript
// src/api/example.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

export const exampleAPI = {
  create: (data: any) => api.post('/examples', data),
  getById: (id: string) => api.get(`/examples/${id}`),
  update: (id: string, data: any) => api.put(`/examples/${id}`, data),
  delete: (id: string) => api.delete(`/examples/${id}`)
};
```

**步骤2: 创建Pinia Store**

在 `src/stores/` 中创建状态管理：

```typescript
// src/stores/example.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { exampleAPI } from '@/api/example';

export const useExampleStore = defineStore('example', () => {
  const examples = ref([]);
  const loading = ref(false);

  async function loadExamples() {
    loading.value = true;
    try {
      const response = await exampleAPI.getList();
      examples.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function createExample(data: any) {
    const response = await exampleAPI.create(data);
    examples.value.push(response.data);
    return response.data;
  }

  return {
    examples,
    loading,
    loadExamples,
    createExample
  };
});
```

**步骤3: 创建Vue组件**

在 `src/components/` 或 `src/views/` 中创建Vue组件：

```vue
<!-- src/components/ExampleList.vue -->
<template>
  <div class="example-list">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="list">
      <div v-for="example in examples" :key="example._id" class="item">
        {{ example.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useExampleStore } from '@/stores/example';

const store = useExampleStore();

onMounted(() => {
  store.loadExamples();
});
</script>

<style scoped>
.example-list {
  padding: 20px;
}
</style>
```

## 代码规范

### TypeScript规范

1. **类型定义**: 始终为函数参数和返回值定义类型

```typescript
// ✅ 好
function add(a: number, b: number): number {
  return a + b;
}

// ❌ 不好
function add(a, b) {
  return a + b;
}
```

2. **接口定义**: 使用接口定义数据结构

```typescript
// ✅ 好
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ 不好
type User = {
  id: any;
  name: any;
  email: any;
};
```

3. **避免使用any**: 尽可能使用具体类型

```typescript
// ✅ 好
function processData(data: Record<string, unknown>): void {
  // ...
}

// ❌ 不好
function processData(data: any): void {
  // ...
}
```

### 命名规范

- **文件名**: 使用PascalCase（组件）或camelCase（工具函数）
- **变量名**: 使用camelCase
- **常量**: 使用UPPER_SNAKE_CASE
- **类名**: 使用PascalCase
- **接口名**: 使用PascalCase，前缀为I

```typescript
// ✅ 好
const MAX_RETRY_COUNT = 3;
const userName = 'John';
class UserService {}
interface IUser {}

// ❌ 不好
const max_retry_count = 3;
const user_name = 'John';
class userService {}
interface User {}
```

### 代码格式化

使用Prettier自动格式化代码：

```bash
# 前端
npm run format

# 后端
cd backend
npm run format
```

### ESLint检查

运行ESLint检查代码质量：

```bash
# 前端
npm run lint

# 后端
cd backend
npm run lint
```

## 测试指南

### 后端测试

#### 单元测试

```bash
cd backend
npm test
```

#### 集成测试

集成测试位于 `backend/src/__tests__/integration/`

```typescript
// backend/src/__tests__/integration/example.test.ts
import request from 'supertest';
import app from '../../server';

describe('Example API', () => {
  it('should create an example', async () => {
    const response = await request(app)
      .post('/api/examples')
      .send({
        name: 'Test Example',
        description: 'Test Description'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
  });
});
```

### 前端测试

#### 单元测试

```bash
npm run test
```

#### 组件测试

```typescript
// src/components/__tests__/Example.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Example from '../Example.vue';

describe('Example Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Example);
    expect(wrapper.text()).toContain('Example');
  });
});
```

## 部署指南

### Docker部署

#### 构建镜像

```bash
# 构建所有镜像
docker-compose build

# 构建特定镜像
docker-compose build backend
docker-compose build frontend
```

#### 启动容器

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

#### 1. 构建项目

```bash
# 后端
cd backend
npm run build

# 前端
npm run build
```

#### 2. 配置生产环境变量

```bash
# backend/.env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=your-production-secret-key
OPENAI_API_KEY=your-openai-key
CORS_ORIGIN=https://yourdomain.com
```

#### 3. 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动后端
pm2 start backend/dist/server.js --name "api"

# 查看进程
pm2 list

# 查看日志
pm2 logs api
```

#### 4. 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 常见问题

### Q: 如何调试后端代码？

A: 使用VS Code调试器：

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/node_modules/.bin/tsx",
      "args": ["watch", "src/server.ts"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### Q: 如何处理CORS错误？

A: 检查 `backend/src/config/cors.ts` 中的CORS配置，确保前端URL在允许列表中。

### Q: 如何添加新的环境变量？

A: 
1. 在 `.env.example` 中添加变量
2. 在 `.env` 中设置值
3. 在代码中使用 `process.env.VARIABLE_NAME`

### Q: 如何优化数据库查询性能？

A: 
1. 添加适当的索引
2. 使用投影限制返回字段
3. 使用分页处理大量数据
4. 使用缓存减少数据库查询

### Q: 如何处理API超时？

A: 在 `backend/src/utils/aiQueue.ts` 中配置超时时间，或在中间件中设置。

## 资源链接

- [Vue 3文档](https://vuejs.org/)
- [Express.js文档](https://expressjs.com/)
- [MongoDB文档](https://docs.mongodb.com/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Pinia文档](https://pinia.vuejs.org/)

## 支持

如有问题，请提交Issue或联系开发团队。
