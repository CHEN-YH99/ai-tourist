# 技术设计文档 - AI旅游攻略助手

## Overview

AI旅游攻略助手是一个基于AI技术的智能旅游规划平台，采用前后端分离架构。系统通过集成第三方AI服务（OpenAI API）为用户提供智能问答、自动生成旅行攻略等功能，同时提供完整的用户管理、内容收藏和目的地信息浏览能力。

### 技术栈

**前端:**
- Vue 3 (Composition API)
- TypeScript
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router (路由管理)
- Axios (HTTP客户端)
- TailwindCSS (UI样式)

**后端:**
- Node.js 18+
- Express.js (Web框架)
- TypeScript
- MongoDB (数据库)
- Mongoose (ODM)
- JWT (身份认证)
- bcrypt (密码加密)
- Winston (日志管理)

**第三方服务:**
- OpenAI API (AI问答和攻略生成)

### 核心设计原则

1. **关注点分离**: 前后端完全分离，通过RESTful API通信
2. **类型安全**: 全栈TypeScript确保类型安全
3. **可测试性**: 组件化设计，支持单元测试和属性测试
4. **安全性**: JWT认证、密码加密、输入验证
5. **可扩展性**: 模块化架构，易于添加新功能
6. **性能优化**: 数据库索引、响应缓存、懒加载

## Architecture

### 系统架构图

```mermaid
graph TB
    subgraph "客户端层"
        A[Vue 3 应用]
        B[Pinia Store]
        C[Vue Router]
    end
    
    subgraph "API网关层"
        D[Express Server]
        E[认证中间件]
        F[错误处理中间件]
    end
    
    subgraph "业务逻辑层"
        G[User Service]
        H[AI Service]
        I[Destination Service]
        J[Collection Service]
        K[Search Service]
    end
    
    subgraph "数据访问层"
        L[User Repository]
        M[Conversation Repository]
        N[Itinerary Repository]
        O[Destination Repository]
    end
    
    subgraph "数据存储层"
        P[(MongoDB)]
    end
    
    subgraph "外部服务"
        Q[OpenAI API]
    end
    
    A --> B
    A --> C
    A --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    G --> L
    H --> M
    H --> N
    H --> Q
    I --> O
    J --> M
    J --> N
    K --> M
    K --> N
    K --> O
    L --> P
    M --> P
    N --> P
    O --> P
```

### 架构层次说明

**1. 客户端层 (Client Layer)**
- 负责用户界面渲染和交互
- 使用Pinia管理应用状态
- 通过Axios与后端API通信

**2. API网关层 (API Gateway Layer)**
- Express服务器处理HTTP请求
- 认证中间件验证JWT token
- 统一错误处理和响应格式化

**3. 业务逻辑层 (Business Logic Layer)**
- 各个Service模块实现核心业务逻辑
- 与外部AI服务集成
- 数据验证和业务规则执行

**4. 数据访问层 (Data Access Layer)**
- Repository模式封装数据库操作
- 提供统一的数据访问接口
- 处理数据转换和映射

**5. 数据存储层 (Data Storage Layer)**
- MongoDB存储所有持久化数据
- 支持文档型数据结构
- 提供索引和查询优化

## Components and Interfaces

### 前端组件架构

```mermaid
graph TD
    A[App.vue] --> B[Layout组件]
    B --> C[Header.vue]
    B --> D[Sidebar.vue]
    B --> E[RouterView]
    
    E --> F[Home.vue]
    E --> G[Chat.vue]
    E --> H[ItineraryGenerator.vue]
    E --> I[Destinations.vue]
    E --> J[Profile.vue]
    E --> K[Collections.vue]
    
    G --> L[ChatMessage.vue]
    G --> M[ChatInput.vue]
    
    H --> N[ItineraryForm.vue]
    H --> O[ItineraryDisplay.vue]
    
    I --> P[DestinationCard.vue]
    I --> Q[DestinationDetail.vue]
    
    K --> R[CollectionItem.vue]
```

### 核心前端组件

#### 1. Chat.vue - AI问答界面
```typescript
// 组件接口
interface ChatProps {
  conversationId?: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  inputText: string;
}

// 主要方法
async function sendMessage(text: string): Promise<void>
async function loadConversation(id: string): Promise<void>
function clearChat(): void
```

#### 2. ItineraryGenerator.vue - 攻略生成器
```typescript
// 组件接口
interface ItineraryFormData {
  destination: string;
  days: number;
  budget: number;
  preferences: string[];
}

interface ItineraryState {
  formData: ItineraryFormData;
  generatedItinerary: Itinerary | null;
  generating: boolean;
}

// 主要方法
async function generateItinerary(data: ItineraryFormData): Promise<Itinerary>
async function saveItinerary(itinerary: Itinerary): Promise<void>
```

#### 3. Destinations.vue - 目的地浏览
```typescript
// 组件接口
interface DestinationsState {
  destinations: Destination[];
  selectedDestination: Destination | null;
  filters: DestinationFilters;
  loading: boolean;
}

// 主要方法
async function loadDestinations(filters?: DestinationFilters): Promise<void>
async function selectDestination(id: string): Promise<void>
function sortDestinations(sortBy: SortOption): void
```

### 后端服务接口

#### 1. UserService - 用户服务
```typescript
interface IUserService {
  // 注册新用户
  register(data: RegisterDTO): Promise<UserResponse>;
  
  // 用户登录
  login(credentials: LoginDTO): Promise<AuthResponse>;
  
  // 获取用户资料
  getProfile(userId: string): Promise<UserProfile>;
  
  // 更新用户资料
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile>;
  
  // 验证token
  verifyToken(token: string): Promise<TokenPayload>;
}

// DTO定义
interface RegisterDTO {
  email: string;
  password: string;
  username: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface UpdateProfileDTO {
  username?: string;
  avatar?: string;
  preferences?: string[];
  contactInfo?: ContactInfo;
}
```

#### 2. AIService - AI服务
```typescript
interface IAIService {
  // 处理AI问答
  chat(userId: string | null, message: string, conversationId?: string): Promise<ChatResponse>;
  
  // 生成旅游攻略
  generateItinerary(userId: string, params: ItineraryParams): Promise<Itinerary>;
  
  // 获取对话历史
  getConversations(userId: string, page: number, pageSize: number): Promise<PaginatedResponse<Conversation>>;
  
  // 获取特定对话
  getConversation(conversationId: string): Promise<Conversation>;
}

interface ItineraryParams {
  destination: string;
  days: number;
  budget: number;
  preferences?: string[];
}

interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: Date;
}
```

#### 3. DestinationService - 目的地服务
```typescript
interface IDestinationService {
  // 获取目的地列表
  getDestinations(filters?: DestinationFilters): Promise<Destination[]>;
  
  // 获取目的地详情
  getDestinationById(id: string): Promise<Destination>;
  
  // 创建目的地（管理员）
  createDestination(data: CreateDestinationDTO): Promise<Destination>;
  
  // 更新目的地（管理员）
  updateDestination(id: string, data: UpdateDestinationDTO): Promise<Destination>;
  
  // 获取热门目的地
  getPopularDestinations(limit: number): Promise<Destination[]>;
}

interface DestinationFilters {
  region?: string;
  type?: string;
  sortBy?: 'popularity' | 'name' | 'budget';
}
```

#### 4. CollectionService - 收藏服务
```typescript
interface ICollectionService {
  // 添加收藏
  addToCollection(userId: string, itemId: string, itemType: CollectionType): Promise<Collection>;
  
  // 移除收藏
  removeFromCollection(userId: string, itemId: string): Promise<void>;
  
  // 获取用户收藏列表
  getUserCollections(userId: string, type?: CollectionType): Promise<Collection[]>;
  
  // 检查是否已收藏
  isCollected(userId: string, itemId: string): Promise<boolean>;
}

type CollectionType = 'itinerary' | 'conversation';
```

#### 5. SearchService - 搜索服务
```typescript
interface ISearchService {
  // 全局搜索
  search(query: string, userId?: string, filters?: SearchFilters): Promise<SearchResults>;
  
  // 搜索目的地
  searchDestinations(query: string): Promise<Destination[]>;
  
  // 搜索攻略
  searchItineraries(query: string, userId?: string): Promise<Itinerary[]>;
  
  // 搜索对话
  searchConversations(query: string, userId: string): Promise<Conversation[]>;
}

interface SearchFilters {
  type?: 'destination' | 'itinerary' | 'conversation';
  sortBy?: 'relevance' | 'date';
}

interface SearchResults {
  destinations: Destination[];
  itineraries: Itinerary[];
  conversations: Conversation[];
  total: number;
}
```

### RESTful API端点设计

#### 认证相关 API
```
POST   /api/auth/register          - 用户注册
POST   /api/auth/login             - 用户登录
POST   /api/auth/logout            - 用户登出
GET    /api/auth/verify            - 验证token
```

#### 用户相关 API
```
GET    /api/users/profile          - 获取当前用户资料
PUT    /api/users/profile          - 更新用户资料
POST   /api/users/avatar           - 上传头像
DELETE /api/users/account          - 删除账号
```

#### AI问答相关 API
```
POST   /api/chat                   - 发送消息
GET    /api/chat/conversations     - 获取对话列表
GET    /api/chat/conversations/:id - 获取特定对话
DELETE /api/chat/conversations/:id - 删除对话
```

#### 攻略生成相关 API
```
POST   /api/itineraries/generate   - 生成攻略
GET    /api/itineraries            - 获取攻略列表
GET    /api/itineraries/:id        - 获取特定攻略
PUT    /api/itineraries/:id        - 更新攻略
DELETE /api/itineraries/:id        - 删除攻略
```

#### 目的地相关 API
```
GET    /api/destinations           - 获取目的地列表
GET    /api/destinations/:id       - 获取目的地详情
GET    /api/destinations/popular   - 获取热门目的地
POST   /api/destinations           - 创建目的地（管理员）
PUT    /api/destinations/:id       - 更新目的地（管理员）
```

#### 收藏相关 API
```
GET    /api/collections            - 获取收藏列表
POST   /api/collections            - 添加收藏
DELETE /api/collections/:id        - 移除收藏
GET    /api/collections/check/:id  - 检查是否已收藏
```

#### 搜索相关 API
```
GET    /api/search                 - 全局搜索
GET    /api/search/destinations    - 搜索目的地
GET    /api/search/itineraries     - 搜索攻略
GET    /api/search/conversations   - 搜索对话
```

## Data Models

### MongoDB Schema设计

#### 1. User Schema
```typescript
interface IUser {
  _id: ObjectId;
  email: string;              // 唯一，必填
  password: string;           // 加密存储
  username: string;           // 必填
  avatar?: string;            // 头像URL
  preferences: string[];      // 旅行偏好
  contactInfo?: {
    phone?: string;
    wechat?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: '邮箱格式不正确'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  username: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  avatar: { 
    type: String,
    default: null
  },
  preferences: [{ 
    type: String 
  }],
  contactInfo: {
    phone: String,
    wechat: String
  }
}, {
  timestamps: true
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
```

#### 2. Conversation Schema
```typescript
interface IConversation {
  _id: ObjectId;
  userId?: ObjectId;          // 可选，未登录用户为null
  messages: IMessage[];       // 消息数组
  title?: string;             // 对话标题（从首条消息生成）
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mongoose Schema
const MessageSchema = new Schema<IMessage>({
  role: { 
    type: String, 
    enum: ['user', 'assistant'],
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  messages: [MessageSchema],
  title: { 
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true
});

// 索引
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ 'messages.content': 'text', title: 'text' });
```

#### 3. Itinerary Schema
```typescript
interface IItinerary {
  _id: ObjectId;
  userId: ObjectId;           // 必填
  destination: string;        // 目的地
  days: number;               // 旅行天数
  budget: number;             // 预算
  preferences: string[];      // 偏好
  content: IDayPlan[];        // 每日计划
  generatedAt: Date;          // 生成时间
  createdAt: Date;
  updatedAt: Date;
}

interface IDayPlan {
  day: number;
  activities: IActivity[];
  meals: IMeal[];
  accommodation?: string;
  dailyBudget: number;
}

interface IActivity {
  time: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
}

interface IMeal {
  type: 'breakfast' | 'lunch' | 'dinner';
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
}

// Mongoose Schema
const ActivitySchema = new Schema<IActivity>({
  time: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  duration: { type: String, required: true }
}, { _id: false });

const MealSchema = new Schema<IMeal>({
  type: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true 
  },
  restaurant: { type: String, required: true },
  cuisine: { type: String, required: true },
  estimatedCost: { type: Number, required: true, min: 0 }
}, { _id: false });

const DayPlanSchema = new Schema<IDayPlan>({
  day: { type: Number, required: true, min: 1 },
  activities: [ActivitySchema],
  meals: [MealSchema],
  accommodation: String,
  dailyBudget: { type: Number, required: true, min: 0 }
}, { _id: false });

const ItinerarySchema = new Schema<IItinerary>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  destination: { 
    type: String, 
    required: true,
    trim: true
  },
  days: { 
    type: Number, 
    required: true,
    min: 1,
    max: 30
  },
  budget: { 
    type: Number, 
    required: true,
    min: 0
  },
  preferences: [String],
  content: [DayPlanSchema],
  generatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// 索引
ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ destination: 1 });
ItinerarySchema.index({ destination: 'text' });

// 虚拟字段：计算总预算
ItinerarySchema.virtual('totalBudget').get(function() {
  return this.content.reduce((sum, day) => sum + day.dailyBudget, 0);
});
```

#### 4. Destination Schema
```typescript
interface IDestination {
  _id: ObjectId;
  name: string;               // 目的地名称
  nameEn?: string;            // 英文名称
  region: string;             // 地区（如：亚洲、欧洲）
  country: string;            // 国家
  type: string[];             // 类型（如：海滨、文化、冒险）
  description: string;        // 描述
  images: string[];           // 图片URL数组
  attractions: IAttraction[]; // 热门景点
  bestTimeToVisit: string;    // 最佳旅行时间
  averageBudget: {
    min: number;
    max: number;
    currency: string;
  };
  climate: string;            // 气候描述
  transportation: string;     // 交通信息
  tips: string[];             // 旅行贴士
  popularity: number;         // 热度评分（0-100）
  createdAt: Date;
  updatedAt: Date;
}

interface IAttraction {
  name: string;
  description: string;
  image?: string;
  ticketPrice?: number;
  openingHours?: string;
}

// Mongoose Schema
const AttractionSchema = new Schema<IAttraction>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  ticketPrice: { type: Number, min: 0 },
  openingHours: String
}, { _id: false });

const DestinationSchema = new Schema<IDestination>({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  nameEn: { 
    type: String,
    trim: true
  },
  region: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  type: [{ 
    type: String,
    enum: ['海滨', '文化', '冒险', '美食', '购物', '自然', '历史', '现代']
  }],
  description: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  images: [{ 
    type: String 
  }],
  attractions: [AttractionSchema],
  bestTimeToVisit: { 
    type: String, 
    required: true 
  },
  averageBudget: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'CNY' }
  },
  climate: String,
  transportation: String,
  tips: [String],
  popularity: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// 索引
DestinationSchema.index({ name: 1 });
DestinationSchema.index({ region: 1, country: 1 });
DestinationSchema.index({ popularity: -1 });
DestinationSchema.index({ name: 'text', description: 'text' });

// 验证：确保max >= min
DestinationSchema.pre('save', function(next) {
  if (this.averageBudget.max < this.averageBudget.min) {
    next(new Error('最大预算不能小于最小预算'));
  }
  next();
});
```

#### 5. Collection Schema
```typescript
interface ICollection {
  _id: ObjectId;
  userId: ObjectId;           // 必填
  itemId: ObjectId;           // 收藏项ID
  itemType: CollectionType;   // 收藏类型
  createdAt: Date;
}

type CollectionType = 'itinerary' | 'conversation';

// Mongoose Schema
const CollectionSchema = new Schema<ICollection>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  itemId: { 
    type: Schema.Types.ObjectId,
    required: true
  },
  itemType: { 
    type: String,
    enum: ['itinerary', 'conversation'],
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// 索引
CollectionSchema.index({ userId: 1, createdAt: -1 });
CollectionSchema.index({ userId: 1, itemId: 1 }, { unique: true });
CollectionSchema.index({ itemId: 1, itemType: 1 });
```

### 数据关系图

```mermaid
erDiagram
    User ||--o{ Conversation : creates
    User ||--o{ Itinerary : generates
    User ||--o{ Collection : has
    Collection }o--|| Itinerary : references
    Collection }o--|| Conversation : references
    
    User {
        ObjectId _id PK
        string email UK
        string password
        string username
        string avatar
        array preferences
        object contactInfo
        date createdAt
        date updatedAt
    }
    
    Conversation {
        ObjectId _id PK
        ObjectId userId FK
        array messages
        string title
        date createdAt
        date updatedAt
    }
    
    Itinerary {
        ObjectId _id PK
        ObjectId userId FK
        string destination
        number days
        number budget
        array preferences
        array content
        date generatedAt
        date createdAt
        date updatedAt
    }
    
    Destination {
        ObjectId _id PK
        string name UK
        string region
        string country
        array type
        string description
        array images
        array attractions
        string bestTimeToVisit
        object averageBudget
        number popularity
        date createdAt
        date updatedAt
    }
    
    Collection {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId itemId FK
        string itemType
        date createdAt
    }
```


### Pinia Store设计

#### 1. Auth Store
```typescript
// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile, LoginDTO, RegisterDTO } from '@/types';
import { authAPI } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userPreferences = computed(() => user.value?.preferences || []);

  // Actions
  async function login(credentials: LoginDTO) {
    loading.value = true;
    try {
      const response = await authAPI.login(credentials);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterDTO) {
    loading.value = true;
    try {
      const response = await authAPI.register(data);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  async function fetchProfile() {
    if (!token.value) return;
    const response = await authAPI.getProfile();
    user.value = response.data;
  }

  async function updateProfile(data: Partial<UserProfile>) {
    const response = await authAPI.updateProfile(data);
    user.value = response.data;
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    userPreferences,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile
  };
});
```

#### 2. Chat Store
```typescript
// stores/chat.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Conversation, Message } from '@/types';
import { chatAPI } from '@/api/chat';

export const useChatStore = defineStore('chat', () => {
  // State
  const conversations = ref<Conversation[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const loading = ref(false);
  const sending = ref(false);

  // Actions
  async function sendMessage(text: string, conversationId?: string) {
    sending.value = true;
    try {
      const response = await chatAPI.sendMessage({ 
        message: text, 
        conversationId 
      });
      
      if (currentConversation.value) {
        currentConversation.value.messages.push({
          role: 'user',
          content: text,
          timestamp: new Date()
        });
        currentConversation.value.messages.push({
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(response.data.timestamp)
        });
      }
      
      return response.data;
    } finally {
      sending.value = false;
    }
  }

  async function loadConversations(page = 1, pageSize = 20) {
    loading.value = true;
    try {
      const response = await chatAPI.getConversations(page, pageSize);
      conversations.value = response.data.items;
    } finally {
      loading.value = false;
    }
  }

  async function loadConversation(id: string) {
    loading.value = true;
    try {
      const response = await chatAPI.getConversation(id);
      currentConversation.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentConversation() {
    currentConversation.value = null;
  }

  async function deleteConversation(id: string) {
    await chatAPI.deleteConversation(id);
    conversations.value = conversations.value.filter(c => c._id !== id);
    if (currentConversation.value?._id === id) {
      currentConversation.value = null;
    }
  }

  return {
    conversations,
    currentConversation,
    loading,
    sending,
    sendMessage,
    loadConversations,
    loadConversation,
    clearCurrentConversation,
    deleteConversation
  };
});
```

#### 3. Itinerary Store
```typescript
// stores/itinerary.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Itinerary, ItineraryParams } from '@/types';
import { itineraryAPI } from '@/api/itinerary';

export const useItineraryStore = defineStore('itinerary', () => {
  // State
  const itineraries = ref<Itinerary[]>([]);
  const currentItinerary = ref<Itinerary | null>(null);
  const generating = ref(false);
  const loading = ref(false);

  // Actions
  async function generateItinerary(params: ItineraryParams) {
    generating.value = true;
    try {
      const response = await itineraryAPI.generate(params);
      currentItinerary.value = response.data;
      return response.data;
    } finally {
      generating.value = false;
    }
  }

  async function loadItineraries(page = 1, pageSize = 20) {
    loading.value = true;
    try {
      const response = await itineraryAPI.getList(page, pageSize);
      itineraries.value = response.data.items;
    } finally {
      loading.value = false;
    }
  }

  async function loadItinerary(id: string) {
    loading.value = true;
    try {
      const response = await itineraryAPI.getById(id);
      currentItinerary.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItinerary(id: string) {
    await itineraryAPI.delete(id);
    itineraries.value = itineraries.value.filter(i => i._id !== id);
    if (currentItinerary.value?._id === id) {
      currentItinerary.value = null;
    }
  }

  return {
    itineraries,
    currentItinerary,
    generating,
    loading,
    generateItinerary,
    loadItineraries,
    loadItinerary,
    deleteItinerary
  };
});
```

#### 4. Destination Store
```typescript
// stores/destination.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Destination, DestinationFilters } from '@/types';
import { destinationAPI } from '@/api/destination';

export const useDestinationStore = defineStore('destination', () => {
  // State
  const destinations = ref<Destination[]>([]);
  const popularDestinations = ref<Destination[]>([]);
  const selectedDestination = ref<Destination | null>(null);
  const loading = ref(false);

  // Actions
  async function loadDestinations(filters?: DestinationFilters) {
    loading.value = true;
    try {
      const response = await destinationAPI.getList(filters);
      destinations.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function loadPopularDestinations(limit = 10) {
    loading.value = true;
    try {
      const response = await destinationAPI.getPopular(limit);
      popularDestinations.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function loadDestination(id: string) {
    loading.value = true;
    try {
      const response = await destinationAPI.getById(id);
      selectedDestination.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  function clearSelectedDestination() {
    selectedDestination.value = null;
  }

  return {
    destinations,
    popularDestinations,
    selectedDestination,
    loading,
    loadDestinations,
    loadPopularDestinations,
    loadDestination,
    clearSelectedDestination
  };
});
```

#### 5. Collection Store
```typescript
// stores/collection.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Collection, CollectionType } from '@/types';
import { collectionAPI } from '@/api/collection';

export const useCollectionStore = defineStore('collection', () => {
  // State
  const collections = ref<Collection[]>([]);
  const loading = ref(false);

  // Actions
  async function loadCollections(type?: CollectionType) {
    loading.value = true;
    try {
      const response = await collectionAPI.getList(type);
      collections.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function addToCollection(itemId: string, itemType: CollectionType) {
    const response = await collectionAPI.add(itemId, itemType);
    collections.value.unshift(response.data);
  }

  async function removeFromCollection(id: string) {
    await collectionAPI.remove(id);
    collections.value = collections.value.filter(c => c._id !== id);
  }

  async function isCollected(itemId: string): Promise<boolean> {
    const response = await collectionAPI.check(itemId);
    return response.data.isCollected;
  }

  return {
    collections,
    loading,
    loadCollections,
    addToCollection,
    removeFromCollection,
    isCollected
  };
});
```

### 安全性设计

#### 1. JWT认证实现

**Token生成:**
```typescript
// utils/jwt.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h'
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
```

**认证中间件:**
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: '未提供认证令牌'
      });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    req.userId = payload.userId;
    req.userEmail = payload.email;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: '认证令牌无效或已过期'
    });
  }
}

// 可选认证中间件（允许未登录用户访问）
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }
    
    next();
  } catch (error) {
    // 忽略认证错误，继续处理请求
    next();
  }
}
```

#### 2. 密码加密

```typescript
// utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

#### 3. 输入验证

```typescript
// validators/user.validator.ts
import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码长度至少为8个字符')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
  
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('用户名长度必须在2-50个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文')
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

export const updateProfileValidator: ValidationChain[] = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('用户名长度必须在2-50个字符之间'),
  
  body('preferences')
    .optional()
    .isArray()
    .withMessage('偏好必须是数组'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL')
];
```

#### 4. 文件上传安全

```typescript
// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传JPEG、PNG或WebP格式的图片'));
  }
};

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

#### 5. CORS配置

```typescript
// config/cors.ts
import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24小时
};
```

#### 6. 速率限制

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

// 通用API速率限制
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 认证API速率限制（更严格）
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次登录尝试
  message: {
    status: 'error',
    message: '登录尝试次数过多，请15分钟后再试'
  },
  skipSuccessfulRequests: true
});

// AI API速率限制
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 最多10个请求
  message: {
    status: 'error',
    message: 'AI请求过于频繁，请稍后再试'
  }
});
```

### 性能优化方案

#### 1. 数据库查询优化

**索引策略:**
```typescript
// 已在Schema中定义的索引
// User: email, username
// Conversation: userId + createdAt, 全文搜索
// Itinerary: userId + createdAt, destination, 全文搜索
// Destination: name, region + country, popularity, 全文搜索
// Collection: userId + createdAt, userId + itemId (unique)

// 查询优化示例
async function getRecentConversations(userId: string, limit: number) {
  return Conversation.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title messages.0 createdAt') // 只选择需要的字段
    .lean(); // 返回普通JS对象而非Mongoose文档
}
```

#### 2. 响应缓存

```typescript
// middleware/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 600, // 默认10分钟
  checkperiod: 120 
});

export function cacheMiddleware(duration: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };
    
    next();
  };
}

// 使用示例
router.get('/destinations/popular', 
  cacheMiddleware(3600), // 缓存1小时
  getPopularDestinations
);
```

#### 3. 分页实现

```typescript
// utils/pagination.ts
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function paginate<T>(
  model: any,
  query: any,
  { page, pageSize }: PaginationParams,
  sort: any = { createdAt: -1 }
): Promise<PaginatedResponse<T>> {
  const skip = (page - 1) * pageSize;
  
  const [items, total] = await Promise.all([
    model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    model.countDocuments(query)
  ]);
  
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
```

#### 4. 前端性能优化

**路由懒加载:**
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/Chat.vue')
    },
    {
      path: '/itinerary',
      name: 'Itinerary',
      component: () => import('@/views/ItineraryGenerator.vue')
    },
    {
      path: '/destinations',
      name: 'Destinations',
      component: () => import('@/views/Destinations.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
```

**组件懒加载:**
```typescript
// 在组件中使用defineAsyncComponent
import { defineAsyncComponent } from 'vue';

export default {
  components: {
    HeavyComponent: defineAsyncComponent(() => 
      import('@/components/HeavyComponent.vue')
    )
  }
};
```

**虚拟滚动:**
```typescript
// 对于长列表使用虚拟滚动
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
  destinations,
  { itemHeight: 200 }
);
```

#### 5. AI服务优化

**请求队列:**
```typescript
// services/aiQueue.ts
import PQueue from 'p-queue';

const aiQueue = new PQueue({
  concurrency: 5, // 同时最多5个AI请求
  interval: 1000, // 每秒
  intervalCap: 10 // 每秒最多10个请求
});

export async function queueAIRequest<T>(
  fn: () => Promise<T>
): Promise<T> {
  return aiQueue.add(fn);
}
```

**响应流式传输:**
```typescript
// 对于长文本生成，使用流式响应
async function streamItineraryGeneration(
  req: Request,
  res: Response
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...],
    stream: true
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
}
```

### 部署架构

#### 1. 开发环境配置

```bash
# .env.development
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/travel-assistant-dev

# JWT
JWT_SECRET=your-dev-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# 日志
LOG_LEVEL=debug
```

#### 2. 生产环境配置

```bash
# .env.production
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# MongoDB (使用MongoDB Atlas或自建集群)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/travel-assistant

# JWT
JWT_SECRET=your-production-secret-key-change-this

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# 日志
LOG_LEVEL=info
```

#### 3. Docker部署

**Dockerfile (后端):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/server.js"]
```

**Dockerfile (前端):**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 使用nginx提供静态文件
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: travel-assistant-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: travel-assistant-api
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/travel-assistant?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: travel-assistant-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 4. CI/CD配置

**GitHub Actions示例:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # 部署脚本
          echo "Deploying to production..."
```

#### 5. 监控和日志

**日志配置:**
```typescript
// config/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // 错误日志
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '100m',
      maxFiles: '30d'
    }),
    // 所有日志
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '30d'
    })
  ]
});

// 开发环境输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
```


## Correctness Properties

*属性是系统在所有有效执行中应该保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: AI问答响应时间

*对于任何*旅游相关问题，AI服务应该在5秒内返回回答。

**验证需求: 1.1**

### 属性 2: 目的地数据集成

*对于任何*包含目的地名称的问题，AI服务生成的回答应该包含来自目的地服务的相关数据（如景点、最佳旅行时间等）。

**验证需求: 1.2**

### 属性 3: 对话持久化

*对于任何*已登录用户的对话，发送消息后应该能在数据库中找到对应的Conversation记录。

**验证需求: 1.3**

### 属性 4: 时间倒序排序

*对于任何*用户的历史记录列表（对话或收藏），返回的列表应该按创建时间倒序排列，即最新的项排在最前面。

**验证需求: 1.4, 5.5**

### 属性 5: AI服务错误处理

*对于任何*AI服务处理失败的情况，系统应该返回友好的错误提示（不包含技术细节）并在日志中记录详细的错误信息。

**验证需求: 1.5**

### 属性 6: 未登录用户问答

*对于任何*未登录用户的问答请求，系统应该返回AI回答但不在数据库中创建Conversation记录。

**验证需求: 1.6**

### 属性 7: 数据持久化往返

*对于任何*数据实体（用户、对话、攻略、目的地、收藏），写入数据库后立即读取应该返回等效的数据（所有字段值相同，除了系统自动生成的时间戳和ID）。

**验证需求: 1.7, 4.2, 8.8**

### 属性 8: 攻略生成完整性

*对于任何*有效的攻略生成请求（包含目的地、天数、预算），AI服务应该生成包含每日行程、景点推荐、餐饮建议和预算分配的完整攻略。

**验证需求: 2.1, 2.2**

### 属性 9: 攻略生成响应时间

*对于任何*攻略生成请求，系统应该在10秒内返回完整结果或进度提示。

**验证需求: 2.3**

### 属性 10: 攻略持久化

*对于任何*成功生成的攻略，应该能在数据库中找到对应的Itinerary记录，且该记录属于请求用户。

**验证需求: 2.4**

### 属性 11: 攻略参数影响

*对于任何*两组不同的攻略参数（目的地、天数、预算或偏好不同），生成的攻略内容应该有明显差异。

**验证需求: 2.5, 2.6**

### 属性 12: 预算约束不变性

*对于任何*生成的攻略，计算所有每日预算的总和应该不超过用户指定的预算上限。

**验证需求: 2.8**

### 属性 13: 邮箱格式验证

*对于任何*注册或登录请求，系统应该验证邮箱格式符合标准规范（包含@符号，有域名部分），拒绝无效格式的邮箱。

**验证需求: 3.2**

### 属性 14: 密码强度验证

*对于任何*注册请求，系统应该验证密码长度至少8个字符且同时包含字母和数字，拒绝不符合要求的密码。

**验证需求: 3.3**

### 属性 15: 邮箱唯一性

*对于任何*已存在的邮箱地址，尝试使用该邮箱注册新账号应该失败并返回"邮箱已被使用"的错误提示。

**验证需求: 3.4**

### 属性 16: 登录令牌生成

*对于任何*有效的登录凭证（正确的邮箱和密码），系统应该返回一个有效的JWT令牌，该令牌可以通过验证并包含用户ID和邮箱信息。

**验证需求: 3.5**

### 属性 17: 密码加密存储

*对于任何*新注册的用户，数据库中存储的密码字段值应该与原始密码不同（已加密），且无法通过简单方式还原为原始密码。

**验证需求: 3.6**

### 属性 18: 令牌过期验证

*对于任何*生成的JWT令牌，其过期时间应该设置为生成时间后24小时，且使用过期令牌访问受保护资源应该返回401未授权错误。

**验证需求: 3.8, 3.9**

### 属性 19: 个人资料字段保护

*对于任何*个人资料更新请求，系统应该允许更新用户名、头像、偏好和联系方式，但应该忽略或拒绝对邮箱字段的修改。

**验证需求: 4.3, 4.4**

### 属性 20: 头像上传验证

*对于任何*头像上传请求，系统应该验证文件大小不超过5MB且格式为JPEG、PNG或WebP，拒绝不符合要求的文件。

**验证需求: 4.5, 4.6**

### 属性 21: 资料更新原子性

*对于任何*失败的个人资料更新操作，用户的资料应该保持更新前的状态不变，不应该出现部分字段更新的情况。

**验证需求: 4.7**

### 属性 22: 收藏功能基本操作

*对于任何*攻略或对话，已登录用户应该能够成功收藏该项，收藏后该项应该出现在用户的收藏列表中；取消收藏后该项应该从列表中移除。

**验证需求: 5.1, 5.2, 5.4**

### 属性 23: 收藏幂等性

*对于任何*已收藏的项，重复收藏操作应该返回"已收藏"提示且不在数据库中创建重复记录；多次执行收藏-取消-收藏序列后，最终状态应该只取决于最后一次操作。

**验证需求: 5.3, 5.7**

### 属性 24: 收藏类型筛选

*对于任何*用户的收藏列表，按类型筛选（攻略或对话）应该只返回该类型的收藏项，不包含其他类型。

**验证需求: 5.6**

### 属性 25: 未登录用户收藏限制

*对于任何*未登录用户，尝试收藏操作应该返回401未授权错误。

**验证需求: 5.8**

### 属性 26: 目的地数据完整性

*对于任何*目的地记录，应该包含名称、描述、图片、热门景点、最佳旅行时间和平均预算等必需字段，且平均预算的最小值和最大值都应该大于0。

**验证需求: 6.2, 6.8**

### 属性 27: 目的地排序

*对于任何*目的地列表查询，指定排序方式（按地区、类型或热度）后，返回的列表应该按照指定方式正确排序。

**验证需求: 6.4**

### 属性 28: 目的地必填字段验证

*对于任何*创建目的地的请求，如果缺少必填字段（名称、地区、国家、描述、最佳旅行时间、平均预算），系统应该拒绝请求并返回验证错误。

**验证需求: 6.5**

### 属性 29: 搜索响应时间

*对于任何*搜索请求，系统应该在2秒内返回搜索结果。

**验证需求: 7.2**

### 属性 30: 模糊搜索匹配

*对于任何*搜索关键词，系统应该能够找到包含该关键词的完整匹配项，以及包含该关键词部分的模糊匹配项。

**验证需求: 7.3**

### 属性 31: 搜索类型筛选

*对于任何*搜索请求，指定内容类型筛选（目的地、攻略或对话）后，返回的结果应该只包含该类型的项。

**验证需求: 7.6**

### 属性 32: 个性化搜索排序

*对于任何*已登录用户的搜索请求，如果搜索结果中包含该用户自己创建的攻略或对话，这些项应该排在其他用户的同类型项之前。

**验证需求: 7.7**

### 属性 33: 空白搜索词验证

*对于任何*空白或纯空格的搜索词，系统应该返回验证错误而不执行实际搜索操作。

**验证需求: 7.8**

### 属性 34: 搜索幂等性

*对于任何*搜索关键词，在数据未变化的情况下，连续多次执行相同搜索应该返回相同的结果集（顺序和内容都相同）。

**验证需求: 7.9**

### 属性 35: 数据库连接错误处理

*对于任何*数据库连接失败的情况，系统应该返回503服务不可用错误，而不是暴露数据库错误细节。

**验证需求: 8.3**

### 属性 36: 唯一标识符生成

*对于任何*新创建的数据记录，系统应该自动生成唯一的ID，且该ID在同类型记录中不重复。

**验证需求: 8.4**

### 属性 37: 时间戳自动记录

*对于任何*数据记录，创建时应该自动记录createdAt时间戳，更新时应该自动更新updatedAt时间戳，且updatedAt应该大于或等于createdAt。

**验证需求: 8.5**

### 属性 38: 用户删除级联

*对于任何*用户账号，删除该用户后，该用户的所有对话、攻略和收藏记录也应该从数据库中删除。

**验证需求: 8.6**

### 属性 39: API响应格式统一

*对于任何*API请求，响应应该是JSON格式，包含status字段（值为"success"或"error"），成功时包含data字段，失败时包含message字段。

**验证需求: 9.1, 9.2, 9.3**

### 属性 40: HTTP状态码正确性

*对于任何*API请求，成功操作应该返回2xx状态码（通常200），客户端错误应该返回4xx状态码（如400、401、404），服务器错误应该返回5xx状态码（如500、503）。

**验证需求: 9.4**

### 属性 41: JSON响应头

*对于任何*API响应，Content-Type响应头应该设置为"application/json"。

**验证需求: 9.5**

### 属性 42: 分页信息完整性

*对于任何*返回列表数据的API，响应应该包含total（总记录数）、page（当前页码）和pageSize（每页大小）字段。

**验证需求: 9.6**

### 属性 43: JSON序列化往返

*对于任何*API响应，对响应体进行JSON.parse()后再JSON.stringify()应该产生等效的JSON结构（字段和值都相同）。

**验证需求: 9.7**

### 属性 44: 错误日志完整性

*对于任何*系统错误，错误日志应该包含时间戳、错误类型、错误消息和堆栈跟踪信息。

**验证需求: 10.1**

### 属性 45: 日志级别区分

*对于任何*日志记录，系统应该根据严重程度正确分类为info、warn或error级别。

**验证需求: 10.2**

### 属性 46: 未捕获异常处理

*对于任何*未捕获的异常，系统应该返回500错误响应，在日志中记录详细信息，但不在API响应中暴露堆栈跟踪或数据库连接等敏感信息。

**验证需求: 10.3, 10.4**

### 属性 47: 访问日志记录

*对于任何*API请求，系统应该记录访问日志，包含请求时间、路径、HTTP方法和响应时间。

**验证需求: 10.5**


## Error Handling

### 错误分类

系统将错误分为以下几类：

1. **验证错误 (Validation Errors)** - 400 Bad Request
   - 输入格式不正确
   - 必填字段缺失
   - 数据类型不匹配
   - 业务规则违反

2. **认证错误 (Authentication Errors)** - 401 Unauthorized
   - Token缺失或无效
   - Token过期
   - 凭证错误

3. **授权错误 (Authorization Errors)** - 403 Forbidden
   - 无权访问资源
   - 无权执行操作

4. **资源错误 (Resource Errors)** - 404 Not Found
   - 请求的资源不存在

5. **冲突错误 (Conflict Errors)** - 409 Conflict
   - 邮箱已存在
   - 资源状态冲突

6. **速率限制错误 (Rate Limit Errors)** - 429 Too Many Requests
   - 请求过于频繁

7. **服务器错误 (Server Errors)** - 500 Internal Server Error
   - 未捕获的异常
   - 数据库错误
   - 第三方服务错误

8. **服务不可用错误 (Service Unavailable)** - 503 Service Unavailable
   - 数据库连接失败
   - 外部服务不可用

### 错误处理中间件

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 判断是否为已知的操作错误
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // 未知错误 - 不暴露细节
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  });
}

// 异步错误包装器
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### 特定错误处理示例

```typescript
// 验证错误
if (!email || !password) {
  throw new AppError(400, '邮箱和密码为必填项');
}

// 认证错误
if (!token) {
  throw new AppError(401, '未提供认证令牌');
}

// 资源不存在
const user = await User.findById(userId);
if (!user) {
  throw new AppError(404, '用户不存在');
}

// 冲突错误
const existingUser = await User.findOne({ email });
if (existingUser) {
  throw new AppError(409, '邮箱已被使用');
}

// 数据库连接错误
try {
  await mongoose.connect(MONGODB_URI);
} catch (error) {
  throw new AppError(503, '数据库服务不可用');
}
```


## Testing Strategy

### 测试方法概述

本项目采用双重测试策略，结合单元测试和基于属性的测试（Property-Based Testing），确保全面的代码覆盖和正确性验证。

**单元测试**：
- 验证特定示例和边界情况
- 测试组件集成点
- 验证错误条件处理
- 使用具体的输入输出对

**基于属性的测试**：
- 验证跨所有输入的通用属性
- 通过随机化实现全面的输入覆盖
- 发现边界情况和意外行为
- 每个测试最少运行100次迭代

两种方法互补：单元测试捕获具体的bug，属性测试验证通用正确性。

### 测试技术栈

**后端测试**：
- Jest - 测试框架
- fast-check - 属性测试库
- Supertest - HTTP API测试
- mongodb-memory-server - 内存数据库测试
- Sinon - Mock和Stub

**前端测试**：
- Vitest - 测试框架（与Vite集成）
- @vue/test-utils - Vue组件测试
- fast-check - 属性测试库
- MSW (Mock Service Worker) - API Mock

### 后端测试结构

```
backend/
├── src/
│   ├── services/
│   ├── controllers/
│   ├── models/
│   └── utils/
└── tests/
    ├── unit/
    │   ├── services/
    │   ├── controllers/
    │   └── utils/
    ├── property/
    │   ├── auth.property.test.ts
    │   ├── itinerary.property.test.ts
    │   ├── collection.property.test.ts
    │   └── search.property.test.ts
    └── integration/
        └── api/
```

### 前端测试结构

```
frontend/
├── src/
│   ├── components/
│   ├── stores/
│   └── views/
└── tests/
    ├── unit/
    │   ├── components/
    │   └── stores/
    └── property/
        ├── store.property.test.ts
        └── validation.property.test.ts
```

### 属性测试配置

每个属性测试必须：
1. 运行最少100次迭代
2. 使用注释标签引用设计文档中的属性
3. 使用fast-check生成随机测试数据

**标签格式**：
```typescript
// Feature: ai-travel-assistant, Property 7: 数据持久化往返
```

### 属性测试示例

#### 属性 7: 数据持久化往返

```typescript
// tests/property/persistence.property.test.ts
import fc from 'fast-check';
import { User, Conversation, Itinerary } from '../../src/models';

describe('Property Tests - Data Persistence', () => {
  // Feature: ai-travel-assistant, Property 7: 数据持久化往返
  it('should preserve data through write-read cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          username: fc.string({ minLength: 2, maxLength: 50 })
        }),
        async (userData) => {
          // 写入数据
          const user = await User.create(userData);
          
          // 读取数据
          const retrieved = await User.findById(user._id).lean();
          
          // 验证往返一致性（除了自动生成的字段）
          expect(retrieved.email).toBe(userData.email);
          expect(retrieved.username).toBe(userData.username);
          // 密码应该被加密，所以不相等
          expect(retrieved.password).not.toBe(userData.password);
          
          // 清理
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 属性 12: 预算约束不变性

```typescript
// tests/property/itinerary.property.test.ts
import fc from 'fast-check';
import { generateItinerary } from '../../src/services/aiService';

describe('Property Tests - Itinerary Generation', () => {
  // Feature: ai-travel-assistant, Property 12: 预算约束不变性
  it('should never exceed user budget', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          destination: fc.constantFrom('东京', '巴黎', '纽约', '伦敦'),
          days: fc.integer({ min: 1, max: 10 }),
          budget: fc.integer({ min: 1000, max: 50000 }),
          preferences: fc.array(
            fc.constantFrom('美食', '文化', '冒险', '购物'),
            { maxLength: 3 }
          )
        }),
        async (params) => {
          const itinerary = await generateItinerary('test-user-id', params);
          
          // 计算总预算
          const totalBudget = itinerary.content.reduce(
            (sum, day) => sum + day.dailyBudget,
            0
          );
          
          // 验证不超过预算上限
          expect(totalBudget).toBeLessThanOrEqual(params.budget);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 属性 23: 收藏幂等性

```typescript
// tests/property/collection.property.test.ts
import fc from 'fast-check';
import { CollectionService } from '../../src/services/collectionService';

describe('Property Tests - Collection', () => {
  // Feature: ai-travel-assistant, Property 23: 收藏幂等性
  it('should be idempotent for repeated collection operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          itemId: fc.uuid(),
          itemType: fc.constantFrom('itinerary', 'conversation')
        }),
        async ({ userId, itemId, itemType }) => {
          const service = new CollectionService();
          
          // 多次收藏同一项
          await service.addToCollection(userId, itemId, itemType);
          await service.addToCollection(userId, itemId, itemType);
          await service.addToCollection(userId, itemId, itemType);
          
          // 查询收藏列表
          const collections = await service.getUserCollections(userId);
          
          // 验证只有一条记录
          const matchingCollections = collections.filter(
            c => c.itemId === itemId
          );
          expect(matchingCollections).toHaveLength(1);
          
          // 清理
          await service.removeFromCollection(userId, itemId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 属性 34: 搜索幂等性

```typescript
// tests/property/search.property.test.ts
import fc from 'fast-check';
import { SearchService } from '../../src/services/searchService';

describe('Property Tests - Search', () => {
  // Feature: ai-travel-assistant, Property 34: 搜索幂等性
  it('should return consistent results for repeated searches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (query) => {
          const service = new SearchService();
          
          // 执行多次相同搜索
          const result1 = await service.search(query);
          const result2 = await service.search(query);
          const result3 = await service.search(query);
          
          // 验证结果一致
          expect(result1.total).toBe(result2.total);
          expect(result2.total).toBe(result3.total);
          
          // 验证结果顺序一致
          expect(result1.destinations.map(d => d._id))
            .toEqual(result2.destinations.map(d => d._id));
          expect(result1.itineraries.map(i => i._id))
            .toEqual(result2.itineraries.map(i => i._id));
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 单元测试示例

#### 用户认证测试

```typescript
// tests/unit/services/userService.test.ts
import { UserService } from '../../../src/services/userService';
import { User } from '../../../src/models/User';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('register', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser'
      };

      const result = await userService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.user.username).toBe(userData.username);
      expect(result.token).toBeDefined();
    });

    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        username: 'testuser'
      };

      await userService.register(userData);

      await expect(
        userService.register(userData)
      ).rejects.toThrow('邮箱已被使用');
    });

    it('should reject weak passwords', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        username: 'testuser'
      };

      await expect(
        userService.register(userData)
      ).rejects.toThrow('密码长度至少为8个字符');
    });
  });
});
```

#### API集成测试

```typescript
// tests/integration/api/auth.test.ts
import request from 'supertest';
import app from '../../../src/app';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          username: 'newuser'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // 先注册
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'Password123',
          username: 'loginuser'
        });

      // 然后登录
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('密码错误');
    });
  });
});
```

### 前端组件测试

```typescript
// tests/unit/components/ChatMessage.test.ts
import { mount } from '@vue/test-utils';
import ChatMessage from '../../../src/components/ChatMessage.vue';

describe('ChatMessage', () => {
  it('should render user message correctly', () => {
    const wrapper = mount(ChatMessage, {
      props: {
        message: {
          role: 'user',
          content: 'Hello, AI!',
          timestamp: new Date()
        }
      }
    });

    expect(wrapper.text()).toContain('Hello, AI!');
    expect(wrapper.classes()).toContain('user-message');
  });

  it('should render assistant message correctly', () => {
    const wrapper = mount(ChatMessage, {
      props: {
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you?',
          timestamp: new Date()
        }
      }
    });

    expect(wrapper.text()).toContain('Hello! How can I help you?');
    expect(wrapper.classes()).toContain('assistant-message');
  });
});
```

### 前端Store测试

```typescript
// tests/unit/stores/auth.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../../src/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with no user', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('should set user after login', async () => {
    const store = useAuthStore();
    
    await store.login({
      email: 'test@example.com',
      password: 'Password123'
    });

    expect(store.user).not.toBeNull();
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBeDefined();
  });

  it('should clear user after logout', async () => {
    const store = useAuthStore();
    
    await store.login({
      email: 'test@example.com',
      password: 'Password123'
    });
    
    await store.logout();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
  });
});
```

### 测试覆盖率目标

- 整体代码覆盖率：≥ 80%
- 核心业务逻辑：≥ 90%
- API端点：100%
- 关键路径：100%

### 持续集成

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run property tests
        run: npm run test:property
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### 测试命令

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:property": "jest tests/property",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

