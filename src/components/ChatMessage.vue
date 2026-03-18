<template>
  <div :class="['message', message.role]">
    <div class="message-content">
      <Avatar 
        v-if="message.role === 'user'"
        :src="userAvatar"
        :username="username"
        size="sm"
        class="avatar"
      />
      <span v-else class="avatar">🤖</span>
      <div class="message-bubble">
        <p class="message-text">{{ message.content }}</p>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        
        <!-- Generate Route Map Button for AI responses -->
        <div v-if="message.role === 'assistant' && showGenerateButton" class="action-buttons">
          <Button
            variant="primary"
            size="sm"
            @click="handleGenerateRouteMap"
            :loading="generatingRouteMap"
            class="generate-btn route-map-btn"
          >
            <span class="btn-icon">🗺️</span>
            {{ generatingRouteMap ? '生成中...' : '一键生成路线图' }}
          </Button>
          <Button
            variant="primary"
            size="sm"
            @click="handleGenerateItinerary"
            :loading="generatingItinerary"
            class="generate-btn itinerary-btn"
          >
            <span class="btn-icon">📋</span>
            {{ generatingItinerary ? '生成中...' : '一键生成攻略' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useItineraryStore } from '@/stores/itinerary'
import { routeMapAPI } from '@/api/routeMap'
import Avatar from '@/components/ui/Avatar.vue'
import Button from '@/components/ui/Button.vue'
import type { Message } from '@/types'

interface Props {
  message: Message
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const chatStore = useChatStore()
const itineraryStore = useItineraryStore()
const router = useRouter()
const generatingRouteMap = ref(false)
const generatingItinerary = ref(false)

const username = computed(() => authStore.user?.username || '游客')
const userAvatar = computed(() => authStore.user?.avatar)

// Check if message contains travel-related keywords
const showGenerateButton = computed(() => {
  const content = props.message.content.toLowerCase()
  const travelKeywords = [
    '旅游', '旅行', '攻略', '行程', '目的地', '景点', '天数', '预算',
    '巴黎', '东京', '纽约', '伦敦', '罗马', '北京', '上海', '杭州',
    '游玩', '游览', '参观', '住宿', '酒店', '餐厅', '美食', '路线'
  ]
  return travelKeywords.some(keyword => content.includes(keyword))
})

function formatTime(date: Date | string): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '刚刚'
  }
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

async function handleGenerateRouteMap() {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    router.push({ name: 'Login', query: { redirect: '/chat' } })
    return
  }

  generatingRouteMap.value = true
  try {
    // Get the original travel content
    const originalContent = props.message.content
    
    // Call the dedicated route map API (Gemini)
    const response = await routeMapAPI.generateRouteMap(originalContent)
    
    if (response.data.status === 'success' && response.data.data) {
      // Add the route map response to chat
      chatStore.addMessage({
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date(response.data.data.timestamp)
      })
      
      // Scroll to bottom to show the new response
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages')
        if (messagesContainer) {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    } else {
      throw new Error('生成路线图失败')
    }
    
  } catch (error: any) {
    console.error('Failed to generate route map:', error)
    const errorMessage = error.response?.data?.message || '生成路线图失败，请重试'
    alert(errorMessage)
  } finally {
    generatingRouteMap.value = false
  }
}

async function handleGenerateItinerary() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/chat' } })
    return
  }

  generatingItinerary.value = true
  try {
    // 获取用户的原始提问（从当前对话的消息历史中查找）
    const conversation = chatStore.currentConversation
    let userQuestion = ''
    
    if (conversation && conversation.messages) {
      // 找到当前AI回答之前的用户消息
      const currentIndex = conversation.messages.findIndex(
        msg => msg.role === 'assistant' && msg.content === props.message.content
      )
      if (currentIndex > 0) {
        // 获取前一条用户消息
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (conversation.messages[i].role === 'user') {
            userQuestion = conversation.messages[i].content
            break
          }
        }
      }
    }
    
    // 从AI回答和用户提问中提取旅行信息
    const aiContent = props.message.content
    const params = extractItineraryParams(aiContent, userQuestion)
    
    console.log('提取的参数:', params)
    console.log('用户提问:', userQuestion)
    console.log('AI回答:', aiContent)
    
    if (!params.destination) {
      // 如果无法提取目的地，让用户手动输入
      const userDestination = prompt('请输入目的地城市：')
      if (!userDestination) {
        return
      }
      params.destination = userDestination.trim()
    }

    // 将AI回答内容解析为结构化攻略
    // 方案1：尝试使用AI API进行结构化提取（推荐）
    // 方案2：使用正则表达式解析（fallback）
    let parsedItinerary
    
    try {
      // 尝试调用AI API进行结构化提取
      parsedItinerary = await parseWithAI(aiContent, params)
    } catch (error) {
      console.log('AI解析失败，使用正则表达式解析:', error)
      // fallback到正则表达式解析
      parsedItinerary = parseAIContentToItinerary(aiContent, params)
    }
    
    // 设置为当前攻略（直接显示，不调用API）
    itineraryStore.setCurrentItinerary(parsedItinerary)
    itineraryStore.setItineraryFromChat({
      params,
      aiContent,
      userQuestion
    })
    
    // 跳转到攻略生成页面
    router.push('/itinerary')
    
  } catch (error: any) {
    console.error('Failed to generate itinerary:', error)
    const errorMessage = error.response?.data?.message || '生成攻略失败，请重试'
    alert(errorMessage)
  } finally {
    generatingItinerary.value = false
  }
}

// 从AI回答和用户提问中提取攻略参数
function extractItineraryParams(aiContent: string, userQuestion: string = '') {
  const params: any = {
    destination: '',
    days: 3,
    budget: 5000,
    preferences: []
  }

  console.log('=== 提取参数 ===')
  console.log('用户提问:', userQuestion)
  console.log('AI回答:', aiContent.substring(0, 100) + '...')

  // 扩展的目的地列表（包括国内外主要城市和地区）
  const destinations = [
    // 国内城市
    '北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '重庆', '南京', '苏州',
    '武汉', '长沙', '厦门', '青岛', '大连', '哈尔滨', '昆明', '丽江', '三亚', '桂林',
    '张家界', '黄山', '九寨沟', '西藏', '拉萨', '香港', '澳门', '台北', '高雄', '天津',
    '郑州', '济南', '福州', '南昌', '合肥', '太原', '石家庄', '呼和浩特', '银川', '兰州',
    '西宁', '乌鲁木齐', '贵阳', '南宁', '海口', '长春', '沈阳', '无锡', '宁波', '温州',
    '云南', '四川', '贵州', '广西', '海南', '新疆', '西藏', '青海', '甘肃', '陕西',
    // 亚洲
    '东京', '京都', '大阪', '北海道', '冲绳', '名古屋', '横滨', '神户', '奈良', '镰仓',
    '首尔', '釜山', '济州岛', '仁川', '曼谷', '清迈', '普吉岛', '芭提雅', '华欣',
    '新加坡', '吉隆坡', '槟城', '巴厘岛', '雅加达', '马尼拉', '长滩岛',
    '马尔代夫', '迪拜', '阿布扎比', '多哈', '耶路撒冷', '特拉维夫',
    // 欧洲
    '巴黎', '伦敦', '罗马', '威尼斯', '佛罗伦萨', '米兰', '那不勒斯',
    '巴塞罗那', '马德里', '塞维利亚', '格拉纳达', '瓦伦西亚',
    '阿姆斯特丹', '鹿特丹', '布鲁塞尔', '布鲁日',
    '布拉格', '维也纳', '慕尼黑', '柏林', '法兰克福', '汉堡', '科隆',
    '苏黎世', '日内瓦', '因特拉肯', '卢塞恩',
    '雅典', '圣托里尼', '米克诺斯', '伊斯坦布尔', '莫斯科', '圣彼得堡',
    '里斯本', '波尔图', '哥本哈根', '斯德哥尔摩', '奥斯陆', '赫尔辛基',
    '都柏林', '爱丁堡', '曼彻斯特', '利物浦',
    // 美洲
    '纽约', '洛杉矶', '旧金山', '拉斯维加斯', '迈阿密', '芝加哥', '西雅图', '波士顿',
    '华盛顿', '费城', '圣地亚哥', '奥兰多', '夏威夷', '阿拉斯加',
    '温哥华', '多伦多', '蒙特利尔', '魁北克',
    '墨西哥城', '坎昆', '里约热内卢', '圣保罗', '布宜诺斯艾利斯', '利马', '圣地亚哥',
    // 大洋洲
    '悉尼', '墨尔本', '黄金海岸', '布里斯班', '珀斯', '凯恩斯',
    '奥克兰', '皇后镇', '惠灵顿', '基督城',
    // 非洲
    '开普敦', '约翰内斯堡', '开罗', '卢克索', '马拉喀什', '卡萨布兰卡', '内罗毕'
  ]
  
  // 优先从用户提问中提取目的地（最高优先级）
  if (userQuestion) {
    const userPatterns = [
      /去\s*([^\s，。！？,\.!?、]{2,10})\s*(?:玩|旅游|旅行)/,
      /到\s*([^\s，。！？,\.!?、]{2,10})\s*(?:玩|旅游|旅行)/,
      /在\s*([^\s，。！？,\.!?、]{2,10})\s*(?:玩|旅游|旅行)/,
      /想去\s*([^\s，。！？,\.!?、]{2,10})/,
      /([^\s，。！？,\.!?、]{2,10})\s*(?:几天|多少天|\d+天)/
    ]
    
    for (const pattern of userPatterns) {
      const match = userQuestion.match(pattern)
      if (match) {
        const dest = match[1].trim()
        // 检查是否在目的地列表中
        if (destinations.includes(dest)) {
          params.destination = dest
          console.log('从用户提问提取目的地:', dest)
          break
        }
      }
    }
  }
  
  // 如果用户提问中没有找到，再从AI回答中提取
  if (!params.destination) {
    // 优先尝试从固定格式中提取："以下是一个XXX N天深度游攻略"
    const fixedPatterns = [
      /在\s*([^\s，。！？,\.!?、]{2,10})\s*(\d+)\s*天/,
      /去\s*([^\s，。！？,\.!?、]{2,10})\s*玩\s*(\d+)\s*天/,
      /([^\s，。！？,\.!?、]{2,10})\s*(\d+)\s*天.*?(?:深度游|游玩|旅游|旅行|行程).*?攻略/,
      /以下是.*?([^\s，。！？,\.!?、]{2,10})\s*(\d+)\s*天.*?攻略/,
      /为您.*?([^\s，。！？,\.!?、]{2,10})\s*(\d+)\s*天.*?攻略/
    ]
    
    for (const pattern of fixedPatterns) {
      const match = aiContent.match(pattern)
      if (match) {
        const dest = match[1].trim()
        // 排除一些常见的非地名词
        const excludeWords = ['这里', '那里', '哪里', '什么', '怎么', '如何', '多少', '几天', '时间', '预算', '费用', '价格', '推荐', '建议', '攻略', '行程', '路线', '景点', '酒店', '住宿', '交通', '美食', '购物']
        if (!excludeWords.includes(dest) && destinations.includes(dest)) {
          params.destination = dest
          const days = parseInt(match[2])
          if (days > 0 && days <= 30) {
            params.days = days
          }
          console.log('从AI回答固定格式提取:', params.destination, params.days)
          break
        }
      }
    }
  }
  
  // 如果固定格式没有匹配，尝试从内容中提取目的地（按长度排序，优先匹配长地名）
  if (!params.destination) {
    const sortedDestinations = destinations.sort((a, b) => b.length - a.length)
    // 优先在用户提问中查找
    if (userQuestion) {
      for (const dest of sortedDestinations) {
        if (userQuestion.includes(dest)) {
          params.destination = dest
          console.log('从用户提问匹配目的地:', dest)
          break
        }
      }
    }
    // 如果用户提问中没有，再在AI回答中查找
    if (!params.destination) {
      for (const dest of sortedDestinations) {
        if (aiContent.includes(dest)) {
          params.destination = dest
          console.log('从AI回答匹配目的地:', dest)
          break
        }
      }
    }
  }

  // 合并AI回答和用户提问的内容进行分析（用于提取天数、预算、偏好）
  const content = aiContent + ' ' + userQuestion

  // 如果没有找到精确匹配，尝试更宽松的匹配
  if (!params.destination) {
    // 尝试匹配各种模式
    const patterns = [
      /(?:去|到|在|游|玩|访问|参观|探索)\s*([^\s，。！？,\.!?、]{2,10})(?:\s*(?:旅游|旅行|游玩|玩|看看|逛逛|走走|度假|观光))?/g,
      /([^\s，。！？,\.!?、]{2,10})\s*(?:旅游|旅行|游玩|之旅|行程|攻略)/g,
      /推荐\s*([^\s，。！？,\.!?、]{2,10})\s*(?:的|作为)/g,
      /([^\s，。！？,\.!?、]{2,10})\s*(?:是|有|拥有|以|著名|闻名).*?(?:城市|地方|景点|目的地)/g,
      /(?:想|打算|计划|准备)\s*(?:去|到)\s*([^\s，。！？,\.!?、]{2,10})/g,
      /([^\s，。！？,\.!?、]{2,10})\s*(?:怎么样|如何|好玩吗|值得去吗)/g
    ]
    
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)]
      for (const match of matches) {
        if (match[1]) {
          const candidate = match[1].trim()
          // 过滤掉一些常见的非地名词
          const excludeWords = ['什么', '哪里', '怎么', '如何', '多少', '几天', '时间', '预算', '费用', '价格', '推荐', '建议', '攻略', '行程', '路线', '景点', '酒店', '住宿', '交通', '美食', '购物']
          if (candidate.length >= 2 && candidate.length <= 10 && !excludeWords.includes(candidate)) {
            params.destination = candidate
            break
          }
        }
      }
      if (params.destination) break
    }
  }

  // 提取天数
  const daysPatterns = [
    /(\d+)\s*天/g,
    /(\d+)\s*日/g,
    /(\d+)天\d+夜/g,
    /[一二三四五六七八九十]+天/g
  ]
  
  const chineseNumbers: Record<string, number> = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  }
  
  for (const pattern of daysPatterns) {
    const matches = [...content.matchAll(pattern)]
    for (const match of matches) {
      let days = 0
      if (match[1]) {
        days = parseInt(match[1])
      } else {
        // 处理中文数字
        const chineseDay = match[0].replace('天', '')
        if (chineseNumbers[chineseDay]) {
          days = chineseNumbers[chineseDay]
        }
      }
      if (days > 0 && days <= 30) {
        params.days = days
        break
      }
    }
    if (params.days !== 3) break
  }

  // 提取预算
  const budgetPatterns = [
    /(\d+)\s*元/g,
    /¥\s*(\d+)/g,
    /预算.*?(\d+)/g,
    /(\d+)\s*块/g,
    /大概.*?(\d+)/g,
    /(\d+)\s*万/g
  ]
  
  for (const pattern of budgetPatterns) {
    const matches = [...content.matchAll(pattern)]
    for (const match of matches) {
      let budget = parseInt(match[1])
      // 如果是万元，转换为元
      if (match[0].includes('万')) {
        budget = budget * 10000
      }
      if (budget >= 100) {
        params.budget = budget
        break
      }
    }
    if (params.budget !== 5000) break
  }

  // 提取偏好
  const preferenceKeywords = {
    '美食': ['美食', '吃', '餐厅', '小吃', '特色菜', '美味', '料理', '菜系', '品尝', '食物'],
    '文化': ['文化', '历史', '博物馆', '古迹', '寺庙', '遗产', '传统', '艺术', '展览', '文物'],
    '自然': ['自然', '风景', '山', '海', '湖', '公园', '森林', '海滩', '沙滩', '瀑布', '峡谷'],
    '购物': ['购物', '商场', '买', '逛街', '奢侈品', '免税', '市场', '商店'],
    '夜生活': ['夜生活', '酒吧', '夜市', '夜景', '夜晚', 'bar', '夜店', '俱乐部'],
    '亲子': ['亲子', '儿童', '家庭', '孩子', '小朋友', '乐园', '游乐场', '动物园'],
    '摄影': ['摄影', '拍照', '打卡', '网红', '美景', '照片', '相机'],
    '休闲': ['休闲', '放松', '度假', '悠闲', '慢节奏', '舒适', '惬意'],
    '冒险': ['冒险', '刺激', '极限', '户外', '探险', '徒步', '登山', '潜水']
  }

  for (const [pref, keywords] of Object.entries(preferenceKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      params.preferences.push(pref)
    }
  }

  // 如果没有提取到偏好，添加默认值
  if (params.preferences.length === 0) {
    params.preferences = ['文化', '美食']
  }

  // 去重
  params.preferences = [...new Set(params.preferences)]

  return params
}

// 使用AI API进行结构化提取
async function parseWithAI(aiContent: string, params: any): Promise<any> {
  console.log('=== 使用AI API进行结构化提取 ===')
  
  // 构建提示词
  const prompt = `请将以下旅游攻略文本解析为JSON格式。

旅游攻略文本：
${aiContent}

请严格按照以下JSON格式输出，不要添加任何其他文字：
{
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "name": "活动名称",
          "description": "活动描述",
          "cost": 0,
          "duration": "2小时"
        }
      ],
      "meals": [
        {
          "type": "breakfast",
          "restaurant": "餐厅名称",
          "cuisine": "菜系",
          "estimatedCost": 30
        }
      ],
      "accommodation": "住宿信息"
    }
  ]
}

注意：
1. time格式为HH:MM（如09:00）或时间段（如上午、下午）
2. type只能是breakfast、lunch、dinner之一
3. cost和estimatedCost为数字
4. 如果文本中没有明确信息，请合理推测
5. 只输出JSON，不要有其他内容`

  try {
    // 调用聊天API进行解析
    const response = await chatStore.sendMessage(prompt)
    
    // 提取JSON
    let jsonStr = response.message || ''
    
    // 尝试提取JSON（可能被包裹在代码块中）
    const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || 
                      jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
                      jsonStr.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      jsonStr = jsonMatch[1] || jsonMatch[0] || jsonStr
    }
    
    const parsed = JSON.parse(jsonStr)
    
    // 转换为Itinerary格式
    const itinerary: any = {
      _id: 'chat-' + Date.now(),
      userId: authStore.user?.id || '',
      destination: params.destination,
      days: params.days,
      budget: params.budget,
      preferences: params.preferences || [],
      content: [],
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // 转换每一天的数据
    if (parsed.days && Array.isArray(parsed.days)) {
      itinerary.content = parsed.days.map((day: any) => ({
        day: day.day,
        activities: day.activities || [],
        meals: day.meals || [],
        accommodation: day.accommodation || '当地酒店',
        dailyBudget: Math.floor(params.budget / params.days)
      }))
    }
    
    // 确保每天都有完整数据
    itinerary.content.forEach((day: any) => {
      if (day.meals.length === 0) {
        day.meals = [
          { type: 'breakfast', restaurant: '酒店早餐或当地餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.1) },
          { type: 'lunch', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.15) },
          { type: 'dinner', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.15) }
        ]
      }
      if (!day.accommodation) {
        day.accommodation = '当地酒店'
      }
      // 确保活动有location字段
      day.activities.forEach((activity: any) => {
        if (!activity.location) {
          activity.location = params.destination
        }
      })
    })
    
    console.log('AI解析成功:', itinerary)
    return itinerary
    
  } catch (error) {
    console.error('AI解析失败:', error)
    throw error
  }
}

// 解析AI回答内容为结构化攻略
function parseAIContentToItinerary(aiContent: string, params: any): any {
  console.log('=== 开始解析AI内容 ===')
  console.log('AI内容:', aiContent.substring(0, 200) + '...')
  console.log('参数:', params)
  
  const itinerary: any = {
    _id: 'chat-' + Date.now(),
    userId: authStore.user?.id || '',
    destination: params.destination,
    days: params.days,
    budget: params.budget,
    preferences: params.preferences || [],
    content: [],
    generatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // 按行分割内容
  const lines = aiContent.split('\n').map(line => line.trim()).filter(line => line)
  console.log('总行数:', lines.length)
  
  let currentDay: any = null
  let currentSection = 'activities' // 默认为活动章节
  let activityBuffer: any = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 匹配"第X天"或"Day X"
    const dayMatch = line.match(/第\s*(\d+)\s*天|Day\s*(\d+)/i)
    if (dayMatch) {
      console.log('找到新的一天:', line)
      
      // 保存上一个活动
      if (activityBuffer && currentDay) {
        currentDay.activities.push(activityBuffer)
        activityBuffer = null
      }
      
      // 保存上一天的数据
      if (currentDay) {
        console.log('保存第', currentDay.day, '天，活动数:', currentDay.activities.length)
        itinerary.content.push(currentDay)
      }
      
      // 创建新的一天
      const dayNum = parseInt(dayMatch[1] || dayMatch[2])
      currentDay = {
        day: dayNum,
        activities: [],
        meals: [],
        accommodation: '',
        dailyBudget: Math.floor(params.budget / params.days)
      }
      currentSection = 'activities' // 重置为活动章节
      continue
    }
    
    // 如果还没有创建当天，跳过
    if (!currentDay) {
      continue
    }
    
    // 识别章节标题
    if (line.match(/活动|行程|安排|景点/)) {
      currentSection = 'activities'
      // 保存之前的活动
      if (activityBuffer) {
        currentDay.activities.push(activityBuffer)
        activityBuffer = null
      }
      continue
    }
    if (line.match(/餐饮|美食|用餐|吃/)) {
      currentSection = 'meals'
      // 保存之前的活动
      if (activityBuffer) {
        currentDay.activities.push(activityBuffer)
        activityBuffer = null
      }
      continue
    }
    if (line.match(/住宿|酒店|客栈/)) {
      currentSection = 'accommodation'
      // 保存之前的活动
      if (activityBuffer) {
        currentDay.activities.push(activityBuffer)
        activityBuffer = null
      }
      continue
    }
    
    // 解析活动（匹配时间格式或序号）
    const timeMatch = line.match(/^(\d{1,2}:\d{2}|上午|下午|早上|中午|晚上|傍晚|\d+\.)/)
    if (timeMatch || (currentSection === 'activities' && line.match(/^[-•\d]/))) {
      console.log('找到活动:', line)
      
      // 保存上一个活动
      if (activityBuffer) {
        currentDay.activities.push(activityBuffer)
      }
      
      // 提取时间
      let time = '09:00'
      let restOfLine = line
      if (timeMatch) {
        time = timeMatch[1].replace('.', ':')
        if (!time.includes(':')) {
          time = time + ':00'
        }
        restOfLine = line.substring(timeMatch[0].length).trim()
      }
      
      // 提取活动名称（去掉前缀符号和冒号）
      let activityName = restOfLine.replace(/^[：:\-\s•]+/, '').trim()
      
      // 如果名称太长，截取第一句
      const firstSentence = activityName.split(/[，。；]/)[0]
      if (firstSentence.length < activityName.length && firstSentence.length > 5) {
        activityName = firstSentence
      }
      
      // 创建新活动
      activityBuffer = {
        time: time,
        name: activityName || '活动',
        description: '',
        location: params.destination,
        cost: 0,
        duration: '2小时'
      }
      
      // 尝试提取费用
      const costMatch = line.match(/[¥￥]\s*(\d+)|(\d+)\s*元|门票.*?(\d+)/)
      if (costMatch) {
        activityBuffer.cost = parseInt(costMatch[1] || costMatch[2] || costMatch[3])
      }
      
      // 尝试提取时长
      const durationMatch = line.match(/(\d+)\s*小时|(\d+)\s*h/)
      if (durationMatch) {
        activityBuffer.duration = (durationMatch[1] || durationMatch[2]) + '小时'
      }
      
      continue
    }
    
    // 如果是活动的描述行（以-或•开头，或者是缩进的文本）
    if (activityBuffer && currentSection === 'activities' && (line.startsWith('-') || line.startsWith('•') || line.startsWith('  ') || line.length < 50)) {
      const desc = line.replace(/^[-•\s]+/, '').trim()
      if (desc && !desc.match(/^第\d+天/)) {
        activityBuffer.description += (activityBuffer.description ? ' ' : '') + desc
      }
      continue
    }
    
    // 解析餐饮
    if (currentSection === 'meals' || line.match(/(早餐|午餐|晚餐|breakfast|lunch|dinner)/i)) {
      const mealMatch = line.match(/(早餐|午餐|晚餐|breakfast|lunch|dinner)/i)
      if (mealMatch) {
        console.log('找到餐饮:', line)
        
        const mealType = mealMatch[1].toLowerCase()
        const typeMap: Record<string, 'breakfast' | 'lunch' | 'dinner'> = {
          '早餐': 'breakfast',
          '午餐': 'lunch',
          '晚餐': 'dinner',
          'breakfast': 'breakfast',
          'lunch': 'lunch',
          'dinner': 'dinner'
        }
        
        const meal: any = {
          type: typeMap[mealType] || 'lunch',
          restaurant: '当地推荐餐厅',
          cuisine: '当地特色菜系',
          estimatedCost: 50
        }
        
        // 提取餐厅名称（冒号后面的内容）
        const restaurantMatch = line.match(/[:：]\s*(.+?)(?:[（(¥￥]|$)/)
        if (restaurantMatch) {
          meal.restaurant = restaurantMatch[1].trim()
        } else {
          // 尝试提取餐饮类型后面的内容
          const afterMeal = line.substring(line.indexOf(mealType) + mealType.length).trim()
          if (afterMeal && afterMeal.length > 0) {
            meal.restaurant = afterMeal.replace(/^[:：\-\s]+/, '').split(/[（(¥￥]/)[0].trim()
          }
        }
        
        // 提取费用
        const costMatch = line.match(/[¥￥]\s*(\d+)|(\d+)\s*元/)
        if (costMatch) {
          meal.estimatedCost = parseInt(costMatch[1] || costMatch[2])
        }
        
        currentDay.meals.push(meal)
        continue
      }
    }
    
    // 解析住宿
    if (currentSection === 'accommodation') {
      if (!currentDay.accommodation) {
        currentDay.accommodation = line.replace(/^[:：\-\s]+/, '')
      } else {
        currentDay.accommodation += ' ' + line
      }
      continue
    }
  }
  
  // 保存最后一个活动和最后一天
  if (activityBuffer && currentDay) {
    console.log('保存最后一个活动')
    currentDay.activities.push(activityBuffer)
  }
  if (currentDay) {
    console.log('保存最后一天，第', currentDay.day, '天')
    itinerary.content.push(currentDay)
  }
  
  console.log('解析完成，共', itinerary.content.length, '天')
  
  // 如果没有解析到任何天数，创建默认结构
  if (itinerary.content.length === 0) {
    console.log('没有解析到内容，创建默认结构')
    for (let day = 1; day <= params.days; day++) {
      itinerary.content.push({
        day: day,
        activities: [{
          time: '09:00',
          name: '自由活动',
          description: '根据个人兴趣安排活动',
          location: params.destination,
          cost: Math.floor(params.budget / params.days * 0.5),
          duration: '全天'
        }],
        meals: [
          { type: 'breakfast', restaurant: '酒店早餐或当地餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(params.budget / params.days * 0.1) },
          { type: 'lunch', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(params.budget / params.days * 0.15) },
          { type: 'dinner', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(params.budget / params.days * 0.15) }
        ],
        accommodation: '当地酒店',
        dailyBudget: Math.floor(params.budget / params.days)
      })
    }
  }
  
  // 确保每天都有餐饮建议
  itinerary.content.forEach((day: any) => {
    if (day.meals.length === 0) {
      day.meals = [
        { type: 'breakfast', restaurant: '酒店早餐或当地餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.1) },
        { type: 'lunch', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.15) },
        { type: 'dinner', restaurant: '当地推荐餐厅', cuisine: '当地特色菜系', estimatedCost: Math.floor(day.dailyBudget * 0.15) }
      ]
    }
    if (!day.accommodation) {
      day.accommodation = '当地酒店'
    }
  })
  
  return itinerary
}
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 1rem;
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  gap: 0.75rem;
  max-width: 70%;
  align-items: flex-end;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  font-size: 1.5rem;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant .message-text {
  background: #f0f4f8;
  color: #2d3748;
}

.timestamp {
  font-size: 0.75rem;
  color: #a0aec0;
  padding: 0 1rem;
}

.message.user .timestamp {
  text-align: right;
}

.action-buttons {
  padding: 0.5rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generate-btn {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 1;
  min-width: 140px;
  justify-content: center;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.itinerary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.itinerary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .generate-btn {
    font-size: 0.75rem;
    min-width: 120px;
  }
  
  .btn-icon {
    font-size: 0.875rem;
  }
  
  .action-buttons {
    padding: 0.5rem 0.5rem;
  }
}
</style>
