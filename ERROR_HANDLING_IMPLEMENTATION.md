# 错误处理和提示系统实现文档

## 概述

本文档描述了AI旅游攻略助手系统中的错误处理和Toast通知系统的实现。该系统确保用户在遇到错误时能够获得友好的提示信息，同时系统能够正确处理各种类型的错误。

## 实现的功能

### 1. Toast通知组件系统

#### 1.1 useToast 组合式函数 (`src/composables/useToast.ts`)

提供全局的Toast通知管理功能：

```typescript
const { toasts, addToast, removeToast, success, error, warning, info, clearAll } = useToast()

// 添加成功提示（3秒自动关闭）
success('操作成功', '成功')

// 添加错误提示（5秒自动关闭）
error('操作失败', '错误')

// 添加警告提示（4秒自动关闭）
warning('请注意', '警告')

// 添加信息提示（3秒自动关闭）
info('这是一条信息', '信息')

// 自定义选项
addToast('自定义消息', {
  type: 'success',
  title: '自定义标题',
  duration: 5000
})

// 清空所有提示
clearAll()
```

**特点：**
- 全局单例状态管理
- 自动超时关闭
- 支持自定义标题和持续时间
- 不同类型的提示有不同的默认持续时间

#### 1.2 Toast 组件 (`src/components/Toast.vue`)

单个Toast通知的UI组件：

- 支持4种类型：success（绿色）、error（红色）、warning（黄色）、info（蓝色）
- 自动关闭功能
- 手动关闭按钮
- 平滑的进出动画
- 响应式设计

#### 1.3 ToastContainer 组件 (`src/components/ToastContainer.vue`)

Toast容器组件，管理多个Toast的显示：

- 固定在屏幕右上角
- 支持多个Toast同时显示
- 使用Vue的transition-group实现动画
- 自动处理Toast的添加和移除

### 2. API客户端错误处理 (`src/api/client.ts`)

#### 2.1 错误消息提取

系统实现了智能的错误消息提取逻辑：

```typescript
function extractErrorMessage(error: AxiosError<ApiResponse<any>>): string {
  // 1. 尝试从API响应的message字段获取
  // 2. 尝试从error字段获取
  // 3. 回退到axios错误消息
  // 4. 根据HTTP状态码返回默认消息
}
```

#### 2.2 错误分类处理

系统根据HTTP状态码对错误进行分类处理：

| 状态码 | 类型 | 处理方式 |
|--------|------|--------|
| 400 | 请求参数错误 | 显示错误提示 |
| 401 | 认证失败 | 清除token，显示错误提示，重定向到登录页 |
| 403 | 权限不足 | 显示错误提示 |
| 404 | 资源不存在 | 显示错误提示 |
| 429 | 请求过于频繁 | 显示警告提示 |
| 500 | 服务器错误 | 显示错误提示 |
| 503 | 服务不可用 | 显示错误提示 |
| 网络错误 | 连接失败 | 显示错误提示 |
| 超时 | 请求超时 | 显示错误提示 |

#### 2.3 Toast通知集成

API客户端通过`setToastNotifier`函数与Toast系统集成：

```typescript
// 在App.vue中初始化
setToastNotifier((message: string, type: string, title?: string) => {
  if (type === 'error') {
    error(message, title)
  } else if (type === 'warning') {
    warning(message, title)
  }
})
```

### 3. 全局错误处理集成

#### 3.1 App.vue集成

在应用启动时初始化Toast通知器：

```typescript
onMounted(() => {
  setToastNotifier((message: string, type: string, title?: string) => {
    if (type === 'error') {
      error(message, title)
    } else if (type === 'warning') {
      warning(message, title)
    }
  })
})
```

#### 3.2 自动错误显示

所有API调用失败时，系统会自动显示相应的Toast提示：

- 网络错误：显示"网络连接失败"
- 超时错误：显示"请求超时"
- 认证错误：显示"认证已过期，请重新登录"
- 权限错误：显示"您没有权限执行此操作"
- 其他错误：显示具体的错误消息

### 4. 在视图中使用

#### 4.1 Chat.vue中的错误处理

```typescript
async function handleSendMessage(message: string) {
  try {
    await chatStore.sendMessage(message, currentConversation.value?._id)
    await scrollToBottom()
  } catch (error) {
    // 错误已由API客户端自动处理并显示Toast
    console.error('Failed to send message:', error)
  }
}
```

#### 4.2 ItineraryGenerator.vue中的错误处理

```typescript
async function handleGenerateItinerary(params: ItineraryParams) {
  error.value = null
  lastParams.value = params

  try {
    await itineraryStore.generateItinerary(params)
  } catch (err) {
    // 错误已由API客户端自动处理并显示Toast
    const errorMessage = err instanceof Error ? err.message : '生成攻略失败，请重试'
    error.value = errorMessage
    console.error('Failed to generate itinerary:', err)
  }
}
```

## 需求满足情况

### 需求 1.5: AI服务处理失败时显示友好提示

✅ **已实现**

- API客户端拦截所有错误响应
- 自动提取错误消息
- 通过Toast组件显示友好的错误提示
- 错误消息包含具体的失败原因

### 需求 2.7: 攻略生成失败时返回具体失败原因

✅ **已实现**

- API客户端提取并返回具体的错误消息
- 错误消息通过Toast通知显示给用户
- 在ItineraryGenerator.vue中显示错误状态
- 用户可以看到具体的失败原因并重新尝试

## 测试覆盖

### useToast 组合式函数测试

- ✅ 添加Toast通知
- ✅ 移除Toast通知
- ✅ 不同类型的Toast（success, error, warning, info）
- ✅ 自定义标题和持续时间
- ✅ 唯一ID生成
- ✅ 清空所有Toast

### API客户端错误处理测试

- ✅ 错误消息提取
- ✅ 各种HTTP状态码处理
- ✅ 网络错误处理
- ✅ 超时错误处理

## 使用示例

### 示例1：在组件中手动显示提示

```typescript
import { useToast } from '@/composables/useToast'

export default {
  setup() {
    const { success, error, warning, info } = useToast()

    function handleSuccess() {
      success('操作成功！', '成功')
    }

    function handleError() {
      error('操作失败，请重试', '错误')
    }

    return { handleSuccess, handleError }
  }
}
```

### 示例2：API调用自动错误处理

```typescript
// 无需手动处理错误，API客户端会自动显示Toast
async function loadData() {
  try {
    const response = await chatAPI.sendMessage({ message: 'Hello' })
    // 处理成功响应
  } catch (error) {
    // 错误已由API客户端自动处理并显示Toast
    console.error('Error:', error)
  }
}
```

### 示例3：自定义错误处理

```typescript
async function customOperation() {
  const { error } = useToast()
  
  try {
    // 执行操作
  } catch (err) {
    // 自定义错误处理
    error('自定义错误消息', '操作失败')
  }
}
```

## 最佳实践

1. **让API客户端处理错误**：大多数情况下，API客户端会自动处理错误并显示Toast，无需在每个组件中重复处理。

2. **在需要时添加本地错误状态**：对于需要显示错误状态UI的组件（如ItineraryGenerator.vue），可以在本地维护错误状态。

3. **使用适当的Toast类型**：
   - `success`: 操作成功
   - `error`: 操作失败或系统错误
   - `warning`: 需要用户注意的情况
   - `info`: 一般信息提示

4. **提供有意义的错误消息**：确保错误消息清晰、具体，帮助用户理解发生了什么。

5. **处理特殊情况**：对于某些特殊的业务逻辑错误，可以在组件中捕获并显示自定义的Toast提示。

## 文件清单

- `src/composables/useToast.ts` - Toast管理组合式函数
- `src/components/Toast.vue` - 单个Toast组件
- `src/components/ToastContainer.vue` - Toast容器组件
- `src/api/client.ts` - Axios客户端配置和错误处理
- `src/App.vue` - 应用入口，初始化Toast通知器
- `src/composables/__tests__/useToast.test.ts` - useToast测试
- `src/api/__tests__/client.test.ts` - API客户端错误处理测试

## 总结

该实现提供了一个完整的、用户友好的错误处理和通知系统，确保：

1. ✅ 所有API错误都能被正确捕获和处理
2. ✅ 用户能够看到清晰、友好的错误提示
3. ✅ 系统能够根据不同的错误类型采取相应的处理措施
4. ✅ 代码易于维护和扩展
5. ✅ 充分的测试覆盖确保系统的可靠性
