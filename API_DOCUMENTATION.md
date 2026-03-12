# API文档 - AI旅游攻略助手

## 概述

本文档详细说明了AI旅游攻略助手系统的所有API端点、请求/响应格式和使用示例。

## 基础信息

- **基础URL**: `http://localhost:5000/api` (开发环境)
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON
- **字符编码**: UTF-8

## 响应格式

所有API响应都遵循统一的JSON格式：

### 成功响应 (200)
```json
{
  "status": "success",
  "data": {
    // 响应数据
  },
  "message": "操作成功"
}
```

### 错误响应 (4xx/5xx)
```json
{
  "status": "error",
  "message": "错误描述信息",
  "code": "ERROR_CODE"
}
```

### 分页响应
```json
{
  "status": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

## 认证

大多数API端点需要JWT认证。在请求头中添加Authorization：

```
Authorization: Bearer <your-jwt-token>
```

## API端点

### 1. 认证相关 (Authentication)

#### 1.1 用户注册

**端点**: `POST /auth/register`

**认证**: 不需要

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "username": "john_doe"
}
```

**响应** (201):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "john_doe",
      "avatar": null,
      "preferences": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**验证规则**:
- 邮箱格式必须有效
- 密码长度至少8个字符
- 用户名长度2-50个字符
- 邮箱必须唯一

#### 1.2 用户登录

**端点**: `POST /auth/login`

**认证**: 不需要

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "john_doe",
      "avatar": "https://...",
      "preferences": ["美食", "文化"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### 1.3 验证Token

**端点**: `GET /auth/verify`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### 1.4 用户登出

**端点**: `POST /auth/logout`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "message": "登出成功"
}
```

### 2. 用户管理 (User Management)

#### 2.1 获取用户资料

**端点**: `GET /users/profile`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "avatar": "https://...",
    "preferences": ["美食", "文化"],
    "contactInfo": {
      "phone": "+86 1234567890",
      "wechat": "wechat_id"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

#### 2.2 更新用户资料

**端点**: `PUT /users/profile`

**认证**: 需要

**请求体**:
```json
{
  "username": "new_username",
  "preferences": ["美食", "冒险", "文化"],
  "contactInfo": {
    "phone": "+86 1234567890",
    "wechat": "wechat_id"
  }
}
```

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "new_username",
    "avatar": "https://...",
    "preferences": ["美食", "冒险", "文化"],
    "contactInfo": {
      "phone": "+86 1234567890",
      "wechat": "wechat_id"
    },
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

**注意**: 邮箱不能修改

#### 2.3 上传头像

**端点**: `POST /users/avatar`

**认证**: 需要

**请求**: multipart/form-data
- `avatar`: 图片文件 (JPEG/PNG/WebP, 最大5MB)

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "avatar": "https://example.com/uploads/avatar_123.jpg"
  }
}
```

#### 2.4 删除账号

**端点**: `DELETE /users/account`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "message": "账号已删除"
}
```

**注意**: 删除账号会级联删除所有相关数据（对话、攻略、收藏等）

### 3. AI问答 (Chat)

#### 3.1 发送消息

**端点**: `POST /chat`

**认证**: 可选 (未登录用户不保存对话)

**请求体**:
```json
{
  "message": "请推荐一个适合冬季旅游的目的地",
  "conversationId": "507f1f77bcf86cd799439011"
}
```

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "conversationId": "507f1f77bcf86cd799439011",
    "message": "根据您的需求，我推荐以下冬季旅游目的地...",
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

**限制**: 1分钟内最多10次请求

#### 3.2 获取对话列表

**端点**: `GET /chat/conversations?page=1&pageSize=20`

**认证**: 需要

**查询参数**:
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认20)

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "冬季旅游推荐",
        "messages": [
          {
            "role": "user",
            "content": "请推荐冬季旅游目的地",
            "timestamp": "2024-01-20T16:30:00Z"
          },
          {
            "role": "assistant",
            "content": "根据您的需求...",
            "timestamp": "2024-01-20T16:30:05Z"
          }
        ],
        "createdAt": "2024-01-20T16:30:00Z",
        "updatedAt": "2024-01-20T16:30:05Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 3.3 获取特定对话

**端点**: `GET /chat/conversations/:id`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "冬季旅游推荐",
    "messages": [
      {
        "role": "user",
        "content": "请推荐冬季旅游目的地",
        "timestamp": "2024-01-20T16:30:00Z"
      },
      {
        "role": "assistant",
        "content": "根据您的需求...",
        "timestamp": "2024-01-20T16:30:05Z"
      }
    ],
    "createdAt": "2024-01-20T16:30:00Z",
    "updatedAt": "2024-01-20T16:30:05Z"
  }
}
```

#### 3.4 删除对话

**端点**: `DELETE /chat/conversations/:id`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "message": "对话已删除"
}
```

### 4. 攻略生成 (Itinerary)

#### 4.1 生成攻略

**端点**: `POST /itineraries/generate`

**认证**: 需要

**请求体**:
```json
{
  "destination": "巴黎",
  "days": 5,
  "budget": 10000,
  "preferences": ["美食", "文化", "购物"]
}
```

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "destination": "巴黎",
    "days": 5,
    "budget": 10000,
    "preferences": ["美食", "文化", "购物"],
    "content": [
      {
        "day": 1,
        "activities": [
          {
            "time": "09:00",
            "name": "参观卢浮宫",
            "description": "世界著名美术馆",
            "location": "卢浮宫",
            "cost": 1500,
            "duration": "3小时"
          }
        ],
        "meals": [
          {
            "type": "lunch",
            "restaurant": "Le Comptoir du Relais",
            "cuisine": "法式",
            "estimatedCost": 800
          }
        ],
        "accommodation": "四星酒店",
        "dailyBudget": 3000
      }
    ],
    "generatedAt": "2024-01-20T16:30:00Z",
    "createdAt": "2024-01-20T16:30:00Z"
  }
}
```

**限制**: 1分钟内最多10次请求

#### 4.2 获取攻略列表

**端点**: `GET /itineraries?page=1&pageSize=20`

**认证**: 需要

**查询参数**:
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认20)

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "destination": "巴黎",
        "days": 5,
        "budget": 10000,
        "preferences": ["美食", "文化"],
        "createdAt": "2024-01-20T16:30:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 4.3 获取特定攻略

**端点**: `GET /itineraries/:id`

**认证**: 需要

**响应** (200): 同4.1

#### 4.4 更新攻略

**端点**: `PUT /itineraries/:id`

**认证**: 需要

**请求体**:
```json
{
  "destination": "巴黎",
  "days": 6,
  "budget": 12000,
  "preferences": ["美食", "文化", "购物", "艺术"]
}
```

**响应** (200): 同4.1

#### 4.5 删除攻略

**端点**: `DELETE /itineraries/:id`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "message": "攻略已删除"
}
```

### 5. 目的地管理 (Destination)

#### 5.1 获取目的地列表

**端点**: `GET /destinations?region=亚洲&type=海滨&sortBy=popularity`

**认证**: 不需要

**查询参数**:
- `region`: 地区筛选
- `type`: 类型筛选
- `sortBy`: 排序方式 (popularity/name/budget)
- `page`: 页码
- `pageSize`: 每页数量

**响应** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "巴黎",
      "nameEn": "Paris",
      "region": "欧洲",
      "country": "法国",
      "type": ["文化", "购物"],
      "description": "浪漫之都，艺术之城",
      "images": ["https://..."],
      "attractions": [
        {
          "name": "卢浮宫",
          "description": "世界著名美术馆",
          "image": "https://...",
          "ticketPrice": 1500,
          "openingHours": "09:00-18:00"
        }
      ],
      "bestTimeToVisit": "4月-10月",
      "averageBudget": {
        "min": 5000,
        "max": 15000,
        "currency": "CNY"
      },
      "climate": "温带海洋性气候",
      "transportation": "飞机、火车、地铁",
      "tips": ["带上舒适的鞋子", "学习基本法语"],
      "popularity": 95,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 5.2 获取目的地详情

**端点**: `GET /destinations/:id`

**认证**: 不需要

**响应** (200): 同5.1中的单个对象

#### 5.3 获取热门目的地

**端点**: `GET /destinations/popular?limit=10`

**认证**: 不需要

**查询参数**:
- `limit`: 返回数量 (默认10)

**响应** (200): 同5.1

**缓存**: 此端点响应缓存1小时

#### 5.4 创建目的地 (管理员)

**端点**: `POST /destinations`

**认证**: 需要 (管理员)

**请求体**:
```json
{
  "name": "东京",
  "nameEn": "Tokyo",
  "region": "亚洲",
  "country": "日本",
  "type": ["现代", "美食"],
  "description": "日本首都，现代与传统的完美结合",
  "images": ["https://..."],
  "attractions": [
    {
      "name": "浅草寺",
      "description": "东京最古老的寺庙",
      "ticketPrice": 0,
      "openingHours": "06:00-17:00"
    }
  ],
  "bestTimeToVisit": "3月-5月, 9月-11月",
  "averageBudget": {
    "min": 8000,
    "max": 20000,
    "currency": "CNY"
  },
  "climate": "温带季风气候",
  "transportation": "飞机、新干线、地铁",
  "tips": ["学习基本日语", "尊重当地文化"],
  "popularity": 90
}
```

**响应** (201): 同5.1中的单个对象

#### 5.5 更新目的地 (管理员)

**端点**: `PUT /destinations/:id`

**认证**: 需要 (管理员)

**请求体**: 同5.4

**响应** (200): 同5.1中的单个对象

### 6. 收藏管理 (Collection)

#### 6.1 获取收藏列表

**端点**: `GET /collections?type=itinerary&page=1&pageSize=20`

**认证**: 需要

**查询参数**:
- `type`: 类型筛选 (itinerary/conversation)
- `page`: 页码
- `pageSize`: 每页数量

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "itemId": "507f1f77bcf86cd799439013",
        "itemType": "itinerary",
        "createdAt": "2024-01-20T16:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 6.2 添加收藏

**端点**: `POST /collections`

**认证**: 需要

**请求体**:
```json
{
  "itemId": "507f1f77bcf86cd799439013",
  "itemType": "itinerary"
}
```

**响应** (201):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "itemId": "507f1f77bcf86cd799439013",
    "itemType": "itinerary",
    "createdAt": "2024-01-20T16:30:00Z"
  }
}
```

**注意**: 重复收藏同一项会返回已收藏提示

#### 6.3 移除收藏

**端点**: `DELETE /collections/:id`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "message": "收藏已移除"
}
```

#### 6.4 检查是否已收藏

**端点**: `GET /collections/check/:itemId`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "isCollected": true,
    "collectionId": "507f1f77bcf86cd799439011"
  }
}
```

### 7. 搜索 (Search)

#### 7.1 全局搜索

**端点**: `GET /search?query=巴黎&type=destination&page=1&pageSize=20`

**认证**: 可选

**查询参数**:
- `query`: 搜索关键词 (必需)
- `type`: 类型筛选 (destination/itinerary/conversation)
- `page`: 页码
- `pageSize`: 每页数量

**响应** (200):
```json
{
  "status": "success",
  "data": {
    "destinations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "巴黎",
        "description": "浪漫之都"
      }
    ],
    "itineraries": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "destination": "巴黎",
        "days": 5
      }
    ],
    "conversations": [],
    "total": 2
  }
}
```

**限制**: 2秒超时

#### 7.2 搜索目的地

**端点**: `GET /search/destinations?query=巴黎`

**认证**: 不需要

**响应** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "巴黎",
      "description": "浪漫之都",
      "popularity": 95
    }
  ]
}
```

#### 7.3 搜索攻略

**端点**: `GET /search/itineraries?query=巴黎`

**认证**: 可选

**响应** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "destination": "巴黎",
      "days": 5,
      "budget": 10000,
      "createdAt": "2024-01-20T16:30:00Z"
    }
  ]
}
```

**注意**: 已登录用户的攻略优先显示

#### 7.4 搜索对话

**端点**: `GET /search/conversations?query=旅游`

**认证**: 需要

**响应** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "旅游建议",
      "messages": [
        {
          "role": "user",
          "content": "请推荐旅游目的地"
        }
      ]
    }
  ]
}
```

## 错误处理

### 常见错误码

| 状态码 | 错误信息 | 说明 |
|--------|---------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权或token过期 |
| 403 | Forbidden | 禁止访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如邮箱已存在） |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器错误 |
| 503 | Service Unavailable | 服务不可用 |

### 错误响应示例

```json
{
  "status": "error",
  "message": "邮箱已被使用",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

## 速率限制

- **通用API**: 15分钟内100次请求
- **认证API**: 15分钟内5次请求
- **AI API**: 1分钟内10次请求

超过限制时返回429状态码。

## 使用示例

### 使用cURL

```bash
# 用户注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "username": "john_doe"
  }'

# 获取目的地列表
curl -X GET "http://localhost:5000/api/destinations?region=亚洲" \
  -H "Content-Type: application/json"

# 发送聊天消息（需要token）
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "请推荐一个适合冬季旅游的目的地"
  }'
```

### 使用JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// 添加token到请求头
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 用户注册
async function register(email, password, username) {
  const response = await api.post('/auth/register', {
    email,
    password,
    username
  });
  return response.data;
}

// 获取目的地列表
async function getDestinations(filters) {
  const response = await api.get('/destinations', { params: filters });
  return response.data;
}

// 发送聊天消息
async function sendMessage(message, conversationId) {
  const response = await api.post('/chat', {
    message,
    conversationId
  });
  return response.data;
}
```

## 最佳实践

1. **错误处理**: 始终检查响应状态和错误信息
2. **Token管理**: 安全存储token，定期刷新
3. **请求超时**: 设置合理的超时时间
4. **分页**: 处理大量数据时使用分页
5. **缓存**: 利用HTTP缓存减少请求
6. **日志**: 记录API调用用于调试

## 支持

如有问题，请提交Issue或联系开发团队。
