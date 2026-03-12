# 实现计划：AI旅游攻略助手

## 概述

本实现计划基于已完成的需求文档和技术设计文档，将AI旅游攻略助手系统分解为可执行的开发任务。系统采用Vue 3 + TypeScript + Vite + Pinia（前端）和Node.js + Express + MongoDB（后端）技术栈，包含10个核心需求模块、70+条验收标准和47个属性测试规范。

实现策略：
- 采用增量开发方式，每个任务构建在前一个任务之上
- 优先实现核心功能，确保早期验证
- 测试任务标记为可选（*），可根据项目进度选择性实施
- 在关键节点设置检查点，确保质量

## 任务列表

- [x] 1. 项目初始化和基础架构搭建
  - 创建前后端项目目录结构
  - 安装和配置所有依赖包
  - 配置TypeScript、ESLint、Prettier
  - 设置环境变量和配置文件
  - 配置MongoDB连接
  - _需求: 8.1, 8.2_

- [x] 2. 数据库层实现
  - [x] 2.1 实现User Schema和模型
    - 创建User Schema，包含邮箱、密码、用户名、头像、偏好等字段
    - 添加邮箱格式验证和密码强度验证
    - 配置索引（email, username）
    - _需求: 3.1, 3.2, 3.3_

  - [x] 2.2 实现Conversation Schema和模型
    - 创建Conversation Schema，包含userId、messages数组、title
    - 定义Message子Schema（role, content, timestamp）
    - 配置索引（userId + createdAt, 全文搜索）
    - _需求: 1.3, 1.4_

  - [x] 2.3 实现Itinerary Schema和模型
    - 创建Itinerary Schema，包含目的地、天数、预算、内容等
    - 定义DayPlan、Activity、Meal子Schema
    - 添加预算验证（min >= 0）
    - 配置索引（userId + createdAt, destination, 全文搜索）
    - _需求: 2.1, 2.2, 2.4, 2.8_

  - [x] 2.4 实现Destination Schema和模型
    - 创建Destination Schema，包含名称、地区、国家、类型、描述等
    - 定义Attraction子Schema
    - 添加预算验证（max >= min, 都 > 0）
    - 配置索引（name, region + country, popularity, 全文搜索）
    - _需求: 6.1, 6.2, 6.5, 6.8_

  - [x] 2.5 实现Collection Schema和模型
    - 创建Collection Schema，包含userId、itemId、itemType
    - 配置唯一索引（userId + itemId）
    - 配置索引（userId + createdAt, itemId + itemType）
    - _需求: 5.1, 5.2_

  - [ ]*2.6 编写数据模型属性测试
    - **属性 7: 数据持久化往返**
    - **属性 26: 目的地数据完整性**
    - **属性 36: 唯一标识符生成**
    - **属性 37: 时间戳自动记录**
    - **验证需求: 1.7, 4.2, 6.2, 6.8, 8.4, 8.5, 8.8**

- [x] 3. 检查点 - 数据库层验证
  - 确保所有Schema定义正确，索引配置完成
  - 验证数据验证规则工作正常
  - 如有问题请向用户询问

- [x] 4. 后端认证系统实现
  - [x] 4.1 实现密码加密工具
    - 使用bcrypt实现hashPassword和comparePassword函数
    - 配置SALT_ROUNDS = 10
    - _需求: 3.6_

  - [x] 4.2 实现JWT工具
    - 实现generateToken函数（24小时过期）
    - 实现verifyToken函数
    - _需求: 3.5, 3.8_

  - [x] 4.3 实现认证中间件
    - 创建authenticate中间件（必须登录）
    - 创建optionalAuth中间件（可选登录）
    - 处理token验证和错误响应
    - _需求: 3.9_

  - [x] 4.4 实现UserService
    - 实现register方法（邮箱唯一性检查、密码加密）
    - 实现login方法（凭证验证、token生成）
    - 实现getProfile方法
    - 实现updateProfile方法（禁止修改邮箱）
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

  - [x] 4.5 实现认证API端点
    - POST /api/auth/register - 用户注册
    - POST /api/auth/login - 用户登录
    - POST /api/auth/logout - 用户登出
    - GET /api/auth/verify - 验证token
    - 添加输入验证中间件
    - _需求: 3.1, 3.5_

  - [ ]*4.6 编写认证系统属性测试
    - **属性 13: 邮箱格式验证**
    - **属性 14: 密码强度验证**
    - **属性 15: 邮箱唯一性**
    - **属性 16: 登录令牌生成**
    - **属性 17: 密码加密存储**
    - **属性 18: 令牌过期验证**
    - **验证需求: 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9**

- [ ] 5. 后端用户管理实现
  - [ ] 5.1 实现用户资料API端点
    - GET /api/users/profile - 获取当前用户资料
    - PUT /api/users/profile - 更新用户资料
    - DELETE /api/users/account - 删除账号（级联删除）
    - 添加认证中间件保护
    - _需求: 4.1, 4.2, 4.3, 8.6_

  - [ ] 5.2 实现头像上传功能
    - 配置multer中间件（5MB限制，JPEG/PNG/WebP）
    - POST /api/users/avatar - 上传头像
    - 实现文件类型和大小验证
    - _需求: 4.5, 4.6_

  - [ ]*5.3 编写用户管理属性测试
    - **属性 19: 个人资料字段保护**
    - **属性 20: 头像上传验证**
    - **属性 21: 资料更新原子性**
    - **属性 38: 用户删除级联**
    - **验证需求: 4.3, 4.4, 4.5, 4.6, 4.7, 8.6**

- [ ] 6. 检查点 - 认证和用户管理验证
  - 确保注册、登录、资料管理功能正常
  - 验证JWT认证流程工作正确
  - 测试头像上传和验证
  - 如有问题请向用户询问

- [ ] 7. 后端AI服务集成
  - [ ] 7.1 配置OpenAI客户端
    - 安装openai SDK
    - 配置API密钥和基础设置
    - 实现请求队列（限制并发和速率）
    - _需求: 1.1, 2.3_

  - [ ] 7.2 实现AIService - 智能问答
    - 实现chat方法（处理用户问题）
    - 集成目的地数据到AI回答
    - 保存对话记录（仅登录用户）
    - 实现5秒超时处理
    - 添加错误处理和友好提示
    - _需求: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [ ] 7.3 实现AIService - 攻略生成
    - 实现generateItinerary方法
    - 生成包含每日行程、景点、餐饮、预算的完整攻略
    - 根据用户偏好调整推荐内容
    - 实现10秒超时或进度提示
    - 验证总预算不超过用户指定上限
    - _需求: 2.1, 2.2, 2.3, 2.5, 2.6, 2.8_

  - [ ] 7.4 实现对话管理方法
    - 实现getConversations方法（分页、倒序）
    - 实现getConversation方法
    - 实现deleteConversation方法
    - _需求: 1.4_

  - [ ] 7.5 实现AI相关API端点
    - POST /api/chat - 发送消息（支持未登录用户）
    - GET /api/chat/conversations - 获取对话列表
    - GET /api/chat/conversations/:id - 获取特定对话
    - DELETE /api/chat/conversations/:id - 删除对话
    - POST /api/itineraries/generate - 生成攻略
    - 添加速率限制中间件
    - _需求: 1.1, 1.3, 1.4, 2.1_

  - [ ]*7.6 编写AI服务属性测试
    - **属性 1: AI问答响应时间**
    - **属性 3: 对话持久化**
    - **属性 5: AI服务错误处理**
    - **属性 6: 未登录用户问答**
    - **属性 8: 攻略生成完整性**
    - **属性 9: 攻略生成响应时间**
    - **属性 10: 攻略持久化**
    - **属性 12: 预算约束不变性**
    - **验证需求: 1.1, 1.2, 1.3, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.8**

- [ ] 8. 后端目的地管理实现
  - [ ] 8.1 实现DestinationService
    - 实现getDestinations方法（支持筛选和排序）
    - 实现getDestinationById方法
    - 实现getPopularDestinations方法
    - 实现createDestination方法（管理员）
    - 实现updateDestination方法（管理员）
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 8.2 实现目的地API端点
    - GET /api/destinations - 获取目的地列表（支持筛选）
    - GET /api/destinations/:id - 获取目的地详情
    - GET /api/destinations/popular - 获取热门目的地
    - POST /api/destinations - 创建目的地（管理员）
    - PUT /api/destinations/:id - 更新目的地（管理员）
    - 添加响应缓存（热门目的地缓存1小时）
    - _需求: 6.1, 6.3, 6.7_

  - [ ]*8.3 编写目的地服务属性测试
    - **属性 2: 目的地数据集成**
    - **属性 27: 目的地排序**
    - **属性 28: 目的地必填字段验证**
    - **验证需求: 1.2, 6.4, 6.5**

- [ ] 9. 后端收藏功能实现
  - [ ] 9.1 实现CollectionService
    - 实现addToCollection方法（幂等性处理）
    - 实现removeFromCollection方法
    - 实现getUserCollections方法（支持类型筛选、倒序）
    - 实现isCollected方法
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 9.2 实现收藏API端点
    - GET /api/collections - 获取收藏列表（支持类型筛选）
    - POST /api/collections - 添加收藏
    - DELETE /api/collections/:id - 移除收藏
    - GET /api/collections/check/:id - 检查是否已收藏
    - 添加认证中间件保护
    - _需求: 5.1, 5.4, 5.5, 5.6, 5.8_

  - [ ]*9.3 编写收藏功能属性测试
    - **属性 22: 收藏功能基本操作**
    - **属性 23: 收藏幂等性**
    - **属性 24: 收藏类型筛选**
    - **属性 25: 未登录用户收藏限制**
    - **验证需求: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8**

- [ ] 10. 检查点 - 后端核心功能验证
  - 确保AI问答、攻略生成、目的地管理、收藏功能正常
  - 验证所有API端点响应正确
  - 测试错误处理和边界情况
  - 如有问题请向用户询问

- [ ] 11. 后端搜索功能实现
  - [ ] 11.1 实现SearchService
    - 实现search方法（全局搜索，支持模糊匹配）
    - 实现searchDestinations方法
    - 实现searchItineraries方法（优先显示用户自己的）
    - 实现searchConversations方法
    - 实现2秒超时控制
    - 添加空白搜索词验证
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ] 11.2 实现搜索API端点
    - GET /api/search - 全局搜索（支持类型筛选）
    - GET /api/search/destinations - 搜索目的地
    - GET /api/search/itineraries - 搜索攻略
    - GET /api/search/conversations - 搜索对话
    - 添加输入验证
    - _需求: 7.1, 7.6_

  - [ ]*11.3 编写搜索功能属性测试
    - **属性 29: 搜索响应时间**
    - **属性 30: 模糊搜索匹配**
    - **属性 31: 搜索类型筛选**
    - **属性 32: 个性化搜索排序**
    - **属性 33: 空白搜索词验证**
    - **属性 34: 搜索幂等性**
    - **验证需求: 7.2, 7.3, 7.6, 7.7, 7.8, 7.9**

- [ ] 12. 后端中间件和工具实现
  - [ ] 12.1 实现错误处理中间件
    - 创建AppError类
    - 实现errorHandler中间件
    - 实现asyncHandler包装器
    - 分类处理各种错误（验证、认证、资源、冲突等）
    - _需求: 10.1, 10.2, 10.3, 10.4_

  - [ ] 12.2 实现日志系统
    - 配置Winston日志器
    - 实现日志轮转（100MB，保留30天）
    - 配置不同环境的日志级别
    - 实现访问日志记录
    - _需求: 10.1, 10.2, 10.5, 10.6, 10.7, 10.8_

  - [ ] 12.3 实现速率限制中间件
    - 配置通用API限制（15分钟100次）
    - 配置认证API限制（15分钟5次）
    - 配置AI API限制（1分钟10次）
    - _需求: 1.1, 2.3_

  - [ ] 12.4 实现CORS和安全配置
    - 配置CORS中间件
    - 配置helmet安全头
    - 配置请求体大小限制
    - _需求: 4.5_

  - [ ] 12.5 实现分页工具
    - 创建paginate通用函数
    - 实现PaginatedResponse接口
    - _需求: 9.6_

  - [ ] 12.6 实现响应缓存中间件
    - 创建cacheMiddleware
    - 配置缓存时长
    - _需求: 性能优化_

  - [ ]*12.7 编写中间件和工具属性测试
    - **属性 35: 数据库连接错误处理**
    - **属性 39: API响应格式统一**
    - **属性 40: HTTP状态码正确性**
    - **属性 41: JSON响应头**
    - **属性 42: 分页信息完整性**
    - **属性 43: JSON序列化往返**
    - **属性 44: 错误日志完整性**
    - **属性 45: 日志级别区分**
    - **属性 46: 未捕获异常处理**
    - **属性 47: 访问日志记录**
    - **验证需求: 8.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 13. 后端攻略管理API实现
  - [ ] 13.1 实现攻略管理API端点
    - GET /api/itineraries - 获取攻略列表（分页）
    - GET /api/itineraries/:id - 获取特定攻略
    - PUT /api/itineraries/:id - 更新攻略
    - DELETE /api/itineraries/:id - 删除攻略
    - 添加认证中间件保护
    - _需求: 2.4, 2.5_

  - [ ]*13.2 编写攻略管理单元测试
    - 测试攻略CRUD操作
    - 测试权限验证
    - 测试边界情况
    - _需求: 2.4, 2.5_

- [ ] 14. 检查点 - 后端完整性验证
  - 确保所有后端API端点工作正常
  - 验证错误处理、日志记录、速率限制功能
  - 测试搜索和分页功能
  - 如有问题请向用户询问

- [ ] 15. 前端项目初始化
  - [ ] 15.1 创建Vue 3项目和配置
    - 使用Vite创建Vue 3 + TypeScript项目
    - 安装依赖（Vue Router, Pinia, Axios, TailwindCSS）
    - 配置TailwindCSS
    - 配置路径别名（@指向src）
    - _需求: 前端架构_

  - [ ] 15.2 配置Axios和API客户端
    - 创建Axios实例，配置baseURL
    - 实现请求拦截器（添加Authorization头）
    - 实现响应拦截器（处理错误）
    - 创建API模块（auth, chat, itinerary, destination, collection, search）
    - _需求: 9.1, 9.2, 9.3_

  - [ ] 15.3 配置Vue Router
    - 创建路由配置（Home, Chat, Itinerary, Destinations, Profile, Collections, Login, Register）
    - 实现路由懒加载
    - 实现路由守卫（requiresAuth）
    - _需求: 前端架构_

- [ ] 16. 前端状态管理实现
  - [ ] 16.1 实现Auth Store
    - 定义state（token, user, loading）
    - 实现getters（isAuthenticated, userPreferences）
    - 实现actions（login, register, logout, fetchProfile, updateProfile）
    - 实现token持久化（localStorage）
    - _需求: 3.1, 3.5, 4.1, 4.2_

  - [ ] 16.2 实现Chat Store
    - 定义state（conversations, currentConversation, loading, sending）
    - 实现actions（sendMessage, loadConversations, loadConversation, clearCurrentConversation, deleteConversation）
    - _需求: 1.1, 1.3, 1.4_

  - [ ] 16.3 实现Itinerary Store
    - 定义state（itineraries, currentItinerary, generating, loading）
    - 实现actions（generateItinerary, loadItineraries, loadItinerary, deleteItinerary）
    - _需求: 2.1, 2.4_

  - [ ] 16.4 实现Destination Store
    - 定义state（destinations, popularDestinations, selectedDestination, loading）
    - 实现actions（loadDestinations, loadPopularDestinations, loadDestination, clearSelectedDestination）
    - _需求: 6.1, 6.3, 6.7_

  - [ ] 16.5 实现Collection Store
    - 定义state（collections, loading）
    - 实现actions（loadCollections, addToCollection, removeFromCollection, isCollected）
    - _需求: 5.1, 5.2, 5.4, 5.5_

  - [ ]*16.6 编写Store单元测试
    - 测试Auth Store的登录、登出、资料更新
    - 测试Chat Store的消息发送和对话管理
    - 测试Itinerary Store的攻略生成
    - 测试Destination Store的数据加载
    - 测试Collection Store的收藏操作
    - _需求: 所有前端功能_

- [ ] 17. 前端基础组件实现
  - [ ] 17.1 实现Layout组件
    - 创建Header.vue（导航栏、用户菜单）
    - 创建Sidebar.vue（侧边栏导航）
    - 创建Layout.vue（整体布局）
    - _需求: 前端架构_

  - [ ] 17.2 实现通用UI组件
    - 创建Button.vue（按钮组件）
    - 创建Input.vue（输入框组件）
    - 创建Card.vue（卡片组件）
    - 创建Loading.vue（加载指示器）
    - 创建Modal.vue（模态框组件）
    - _需求: 前端架构_

  - [ ]*17.3 编写基础组件单元测试
    - 测试组件渲染
    - 测试事件处理
    - 测试props传递
    - _需求: 前端架构_

- [ ] 18. 检查点 - 前端基础架构验证
  - 确保项目配置正确，依赖安装完成
  - 验证路由和状态管理工作正常
  - 测试基础组件渲染
  - 如有问题请向用户询问

- [ ] 19. 前端认证页面实现
  - [ ] 19.1 实现Login.vue
    - 创建登录表单（邮箱、密码）
    - 实现表单验证
    - 集成Auth Store的login action
    - 实现错误提示
    - 登录成功后跳转
    - _需求: 3.5_

  - [ ] 19.2 实现Register.vue
    - 创建注册表单（邮箱、密码、用户名）
    - 实现表单验证（邮箱格式、密码强度）
    - 集成Auth Store的register action
    - 实现错误提示
    - 注册成功后跳转
    - _需求: 3.1, 3.2, 3.3_

  - [ ] 19.3 实现Profile.vue
    - 显示用户资料信息
    - 实现资料编辑表单
    - 实现头像上传功能
    - 集成Auth Store的updateProfile action
    - _需求: 4.1, 4.2, 4.3, 4.5_

  - [ ]*19.4 编写认证页面单元测试
    - 测试表单验证
    - 测试登录和注册流程
    - 测试资料更新
    - _需求: 3.1, 3.5, 4.1_

- [ ] 20. 前端AI问答界面实现
  - [ ] 20.1 实现ChatMessage.vue组件
    - 显示单条消息（用户/助手）
    - 区分消息角色样式
    - 显示时间戳
    - _需求: 1.3_

  - [ ] 20.2 实现ChatInput.vue组件
    - 创建消息输入框
    - 实现发送按钮
    - 处理Enter键发送
    - 显示发送中状态
    - _需求: 1.1_

  - [ ] 20.3 实现Chat.vue页面
    - 显示消息列表（使用ChatMessage组件）
    - 集成ChatInput组件
    - 实现自动滚动到底部
    - 集成Chat Store的sendMessage action
    - 显示加载状态
    - 实现对话历史侧边栏
    - _需求: 1.1, 1.3, 1.4_

  - [ ]*20.4 编写AI问答界面单元测试
    - 测试消息显示
    - 测试消息发送
    - 测试对话历史加载
    - _需求: 1.1, 1.3, 1.4_

- [ ] 21. 前端攻略生成界面实现
  - [ ] 21.1 实现ItineraryForm.vue组件
    - 创建攻略生成表单（目的地、天数、预算、偏好）
    - 实现表单验证
    - 实现偏好多选
    - _需求: 2.1_

  - [ ] 21.2 实现ItineraryDisplay.vue组件
    - 显示生成的攻略内容
    - 按天展示行程
    - 显示景点、餐饮、预算信息
    - 实现收藏按钮
    - _需求: 2.2_

  - [ ] 21.3 实现ItineraryGenerator.vue页面
    - 集成ItineraryForm组件
    - 集成ItineraryDisplay组件
    - 集成Itinerary Store的generateItinerary action
    - 显示生成中状态和进度
    - 实现重新生成功能
    - _需求: 2.1, 2.3_

  - [ ]*21.4 编写攻略生成界面单元测试
    - 测试表单验证
    - 测试攻略生成流程
    - 测试攻略显示
    - _需求: 2.1, 2.2, 2.3_

- [ ] 22. 前端目的地浏览界面实现
  - [ ] 22.1 实现DestinationCard.vue组件
    - 显示目的地卡片（图片、名称、描述）
    - 显示热度和预算信息
    - 实现点击查看详情
    - _需求: 6.1, 6.2_

  - [ ] 22.2 实现DestinationDetail.vue组件
    - 显示目的地详细信息
    - 显示热门景点列表
    - 显示最佳旅行时间和预算
    - 显示旅行贴士
    - _需求: 6.2, 6.3_

  - [ ] 22.3 实现Destinations.vue页面
    - 显示目的地列表（使用DestinationCard组件）
    - 实现筛选功能（地区、类型）
    - 实现排序功能（热度、名称、预算）
    - 集成Destination Store
    - 实现目的地详情模态框（使用DestinationDetail组件）
    - _需求: 6.1, 6.3, 6.4, 6.7_

  - [ ]*22.4 编写目的地界面单元测试
    - 测试目的地列表显示
    - 测试筛选和排序
    - 测试详情查看
    - _需求: 6.1, 6.3, 6.4_

- [ ] 23. 检查点 - 前端核心页面验证
  - 确保认证、问答、攻略生成、目的地浏览功能正常
  - 验证页面交互和数据流
  - 测试响应式布局
  - 如有问题请向用户询问

- [ ] 24. 前端收藏和搜索功能实现
  - [ ] 24.1 实现CollectionItem.vue组件
    - 显示收藏项（攻略或对话）
    - 显示收藏时间
    - 实现取消收藏按钮
    - 实现点击查看详情
    - _需求: 5.4, 5.5_

  - [ ] 24.2 实现Collections.vue页面
    - 显示收藏列表（使用CollectionItem组件）
    - 实现类型筛选（攻略/对话）
    - 集成Collection Store
    - 实现空状态提示
    - _需求: 5.4, 5.5, 5.6_

  - [ ] 24.3 实现SearchBar.vue组件
    - 创建搜索输入框
    - 实现搜索建议
    - 处理搜索提交
    - _需求: 7.1_

  - [ ] 24.4 实现SearchResults.vue组件
    - 显示搜索结果（目的地、攻略、对话）
    - 实现类型标签筛选
    - 显示空结果提示
    - _需求: 7.1, 7.6_

  - [ ] 24.5 在Header中集成搜索功能
    - 添加SearchBar组件到Header
    - 实现搜索结果页面跳转
    - _需求: 7.1_

  - [ ]*24.6 编写收藏和搜索界面单元测试
    - 测试收藏列表显示
    - 测试收藏操作
    - 测试搜索功能
    - _需求: 5.4, 5.5, 7.1_

- [ ] 25. 前端Home页面实现
  - [ ] 25.1 实现Home.vue页面
    - 显示欢迎信息和功能介绍
    - 显示热门目的地（使用DestinationCard组件）
    - 实现快速入口（开始问答、生成攻略）
    - 集成Destination Store的loadPopularDestinations
    - _需求: 6.7_

  - [ ]*25.2 编写Home页面单元测试
    - 测试页面渲染
    - 测试热门目的地显示
    - 测试快速入口跳转
    - _需求: 6.7_

- [ ] 26. 前端优化和完善
  - [ ] 26.1 实现错误处理和提示
    - 创建Toast通知组件
    - 实现全局错误处理
    - 在API调用失败时显示友好提示
    - _需求: 1.5, 2.7_

  - [ ] 26.2 实现加载状态优化
    - 在数据加载时显示骨架屏
    - 实现按钮加载状态
    - 优化页面切换动画
    - _需求: 性能优化_

  - [ ] 26.3 实现响应式设计优化
    - 优化移动端布局
    - 实现侧边栏折叠
    - 优化触摸交互
    - _需求: 前端架构_

  - [ ] 26.4 实现性能优化
    - 实现虚拟滚动（长列表）
    - 优化图片懒加载
    - 实现组件懒加载
    - _需求: 性能优化_

- [ ] 27. 检查点 - 前端完整性验证
  - 确保所有前端页面和功能正常
  - 验证用户体验流畅
  - 测试响应式布局和性能
  - 如有问题请向用户询问

- [ ] 28. 集成测试和端到端测试
  - [ ]*28.1 编写后端集成测试
    - 测试认证流程（注册、登录、token验证）
    - 测试AI问答和攻略生成流程
    - 测试目的地管理流程
    - 测试收藏功能流程
    - 测试搜索功能流程
    - _需求: 所有后端功能_

  - [ ]*28.2 编写前端集成测试
    - 测试用户注册和登录流程
    - 测试AI问答完整流程
    - 测试攻略生成完整流程
    - 测试目的地浏览和收藏流程
    - 测试搜索功能
    - _需求: 所有前端功能_

  - [ ]*28.3 编写端到端测试（可选）
    - 使用Playwright或Cypress
    - 测试关键用户路径
    - 测试跨浏览器兼容性
    - _需求: 所有功能_

- [ ] 29. 部署准备和配置
  - [ ] 29.1 创建Docker配置
    - 编写后端Dockerfile（Node.js 18-alpine）
    - 编写前端Dockerfile（多阶段构建，nginx）
    - 编写docker-compose.yml（MongoDB, Backend, Frontend）
    - 配置环境变量
    - _需求: 部署架构_

  - [ ] 29.2 配置生产环境
    - 创建.env.production文件
    - 配置MongoDB连接（MongoDB Atlas）
    - 配置JWT密钥
    - 配置OpenAI API密钥
    - 配置CORS和域名
    - _需求: 部署架构_

  - [ ] 29.3 配置nginx
    - 编写nginx.conf
    - 配置静态文件服务
    - 配置API代理
    - 配置HTTPS（可选）
    - _需求: 部署架构_

  - [ ] 29.4 配置CI/CD（可选）
    - 创建GitHub Actions工作流
    - 配置自动测试
    - 配置自动部署
    - _需求: 部署架构_

- [ ] 30. 数据初始化和种子数据
  - [ ] 30.1 创建目的地种子数据
    - 准备至少10个热门目的地数据
    - 包含完整的景点、图片、预算信息
    - 编写数据导入脚本
    - _需求: 6.7_

  - [ ] 30.2 创建管理员账号
    - 创建管理员用户
    - 配置管理员权限
    - _需求: 6.5, 6.6_

- [ ] 31. 文档和README
  - [ ] 31.1 编写项目README
    - 项目介绍和功能说明
    - 技术栈说明
    - 安装和运行指南
    - 环境变量配置说明
    - API文档链接
    - _需求: 文档_

  - [ ] 31.2 编写API文档
    - 使用Swagger或Postman
    - 记录所有API端点
    - 包含请求/响应示例
    - _需求: 文档_

  - [ ] 31.3 编写开发者指南
    - 项目结构说明
    - 开发流程指南
    - 测试指南
    - 部署指南
    - _需求: 文档_

- [ ] 32. 最终检查点 - 系统完整性验证
  - 确保所有功能正常工作
  - 验证所有测试通过
  - 检查文档完整性
  - 进行性能测试
  - 进行安全检查
  - 如有问题请向用户询问

## 注意事项

1. **测试任务标记**：所有标记为`*`的测试任务为可选任务，可根据项目进度和质量要求选择性实施。核心实现任务必须完成。

2. **增量开发**：每个任务都建立在前一个任务的基础上，确保代码可以逐步运行和验证。

3. **检查点**：在关键节点设置检查点，确保功能正确性后再继续下一阶段。

4. **属性测试**：设计文档中定义了47个属性测试规范，这些测试验证系统的通用正确性，建议在核心功能完成后实施。

5. **需求追溯**：每个任务都标注了对应的需求编号，确保所有需求都被覆盖。

6. **时间估算**：每个主任务（1-32）预计需要1-3天完成，整个项目预计需要6-8周。

7. **依赖管理**：
   - 后端依赖：express, mongoose, jsonwebtoken, bcrypt, winston, express-rate-limit, cors, helmet, multer, openai
   - 前端依赖：vue, vue-router, pinia, axios, tailwindcss, @vueuse/core
   - 测试依赖：jest, fast-check, supertest, mongodb-memory-server, vitest, @vue/test-utils

8. **环境要求**：
   - Node.js 18+
   - MongoDB 6+
   - OpenAI API密钥

## 下一步

此工作流程仅用于创建设计和规划文档。要开始实施，请：
1. 打开tasks.md文件
2. 点击任务项旁边的"Start task"按钮
3. 系统将引导您完成每个任务的实现
