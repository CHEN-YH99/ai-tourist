import { ref, nextTick, type Ref } from 'vue'
import type { Message } from '../types'

export function useChat() {
  const messages: Ref<Message[]> = ref([
    { 
      role: 'assistant', 
      content: '你好！我是你的AI旅游助手。有什么旅行问题我可以帮你解答吗？',
      timestamp: Date.now()
    }
  ])

  const userInput = ref('')
  const loading = ref(false)
  const messagesContainer: Ref<HTMLElement | undefined> = ref()

  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('日本')) {
      return '日本7日游推荐路线：\n\n第1-3天：东京（浅草寺、晴空塔、秋叶原）\n第4-5天：京都（清水寺、金阁寺、伏见稻荷）\n第6-7天：大阪（道顿堀、大阪城、环球影城）\n\n建议购买JR Pass，方便城市间移动。'
    } else if (lowerQuestion.includes('巴黎')) {
      return '巴黎必去景点：\n\n1. 埃菲尔铁塔 - 巴黎地标\n2. 卢浮宫 - 世界三大博物馆之一\n3. 凯旋门 - 香榭丽舍大街起点\n4. 圣母院 - 哥特式建筑杰作\n5. 塞纳河游船 - 欣赏两岸风光\n\n建议购买巴黎博物馆通票，节省排队时间。'
    } else if (lowerQuestion.includes('潜水')) {
      return '东南亚潜水推荐地点：\n\n1. 泰国涛岛 - 考证天堂，价格实惠\n2. 菲律宾薄荷岛 - 可看沙丁鱼风暴\n3. 印尼巴厘岛 - 看Mola Mola翻车鱼\n4. 马来西亚仙本那 - 海水清澈见底\n\n最佳潜水季节：11月-次年4月'
    }
    
    return '这是一个很好的问题！根据你的需求，我建议你可以考虑以下几点：\n\n1. 提前规划行程，预订机票和酒店\n2. 了解当地文化和习俗\n3. 准备必要的旅行证件\n4. 购买旅行保险\n\n还有其他问题吗？'
  }

  const sendMessage = async () => {
    if (!userInput.value.trim() || loading.value) return

    const question = userInput.value
    messages.value.push({ 
      role: 'user', 
      content: question,
      timestamp: Date.now()
    })
    userInput.value = ''
    loading.value = true
    scrollToBottom()

    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const response = generateResponse(question)
    messages.value.push({ 
      role: 'assistant', 
      content: response,
      timestamp: Date.now()
    })
    loading.value = false
    scrollToBottom()
  }

  const askQuestion = (question: string) => {
    userInput.value = question
    sendMessage()
  }

  return {
    messages,
    userInput,
    loading,
    messagesContainer,
    sendMessage,
    askQuestion
  }
}
