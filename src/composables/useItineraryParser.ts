/**
 * 攻略解析Composable
 * 从AI回答中提取和解析旅游攻略信息
 */

import { logger } from '@/utils/logger'
import type { Itinerary, ItineraryParams } from '@/types'

export function useItineraryParser() {
  /**
   * 尝试从AI回答中解析JSON格式的攻略
   */
  function tryParseJsonItinerary(
    aiContent: string,
    params: ItineraryParams,
    userId: string
  ): Itinerary | null {
    try {
      logger.debug('尝试解析JSON格式攻略', { contentLength: aiContent.length })

      // 提取JSON字符串
      const jsonStr = extractJsonString(aiContent)
      if (!jsonStr) {
        logger.debug('未找到JSON格式内容')
        return null
      }

      // 解析JSON
      const parsed = parseJsonSafely(jsonStr)
      if (!parsed) {
        return null
      }

      // 验证结构
      if (!validateItineraryStructure(parsed)) {
        logger.debug('JSON结构不符合攻略格式')
        return null
      }

      // 转换为Itinerary格式
      const itinerary = convertToItinerary(parsed, params, userId)
      logger.info('攻略解析成功', { days: itinerary.content.length })

      return itinerary
    } catch (error) {
      logger.error('tryParseJsonItinerary异常', error)
      return null
    }
  }

  /**
   * 从文本中提取JSON字符串（优化版）
   */
  function extractJsonString(text: string): string | null {
    // 快速检查：如果文本中没有大括号，直接返回
    if (!text.includes('{')) {
      return null
    }

    // 方法1: 代码块提取（优先级最高）
    const codeBlockMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)

    if (codeBlockMatch) {
      logger.debug('从代码块中提取JSON')
      return codeBlockMatch[1].trim()
    }

    // 方法2: 大括号匹配（优化版）
    return extractByBracesOptimized(text)
  }

  /**
   * 通过大括号匹配提取JSON（优化版）
   */
  function extractByBracesOptimized(text: string): string | null {
    const firstBrace = text.indexOf('{')
    if (firstBrace === -1) return null

    // 预分配足够的空间
    const maxLength = text.length - firstBrace
    if (maxLength > 100000) {
      logger.warn('JSON内容过大，可能影响性能')
    }

    let braceCount = 0
    let inString = false
    let escapeNext = false

    for (let i = firstBrace; i < text.length; i++) {
      const char = text[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"' && !escapeNext) {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            logger.debug('从文本中提取JSON对象（大括号匹配）')
            return text.substring(firstBrace, i + 1)
          }
        }
      }
    }

    return null
  }

  /**
   * 安全解析JSON
   */
  function parseJsonSafely(jsonStr: string): any | null {
    try {
      return JSON.parse(jsonStr)
    } catch (error) {
      logger.debug('JSON解析失败，尝试修复', error)

      // 尝试修复常见问题
      const fixed = fixJsonString(jsonStr)
      try {
        return JSON.parse(fixed)
      } catch (fixError) {
        logger.error('JSON修复后仍然失败', fixError)
        return null
      }
    }
  }

  /**
   * 修复常见的JSON格式问题
   */
  function fixJsonString(jsonStr: string): string {
    return jsonStr
      .replace(/,(\s*[}\]])/g, '$1') // 移除尾部逗号
      .replace(/\/\/.*$/gm, '') // 移除单行注释
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .trim()
  }

  /**
   * 验证攻略结构
   */
  function validateItineraryStructure(parsed: any): boolean {
    return parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0
  }

  /**
   * 转换为Itinerary格式
   */
  function convertToItinerary(
    parsed: any,
    params: ItineraryParams,
    userId: string
  ): Itinerary {
    const itinerary: Itinerary = {
      _id: 'chat-' + Date.now(),
      userId,
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
    itinerary.content = parsed.days.map((day: any, index: number) => {
      const dayPlan: any = {
        day: day.day || day.Day || index + 1,
        activities: convertActivities(day, params.destination),
        meals: convertMeals(day, params.budget, params.days),
        accommodation:
          day.accommodation || day.Accommodation || day.hotel || day.Hotel || '当地酒店',
        dailyBudget: Math.floor(params.budget / params.days)
      }

      // 如果没有餐饮，添加默认值
      if (dayPlan.meals.length === 0) {
        dayPlan.meals = getDefaultMeals(dayPlan.dailyBudget)
      }

      return dayPlan
    })

    // 确保天数匹配
    ensureDaysMatch(itinerary, params)

    return itinerary
  }

  /**
   * 转换活动数据
   */
  function convertActivities(day: any, destination: string): any[] {
    const activitiesData =
      day.activities || day.Activities || day.itinerary || day.Itinerary || []

    if (!Array.isArray(activitiesData)) {
      return []
    }

    return activitiesData.map((act: any) => ({
      time: act.time || act.Time || act.startTime || act.StartTime || '09:00',
      name: act.name || act.Name || act.title || act.Title || '活动',
      description: act.description || act.Description || act.desc || act.Desc || '',
      location: act.location || act.Location || act.place || act.Place || destination,
      cost: act.cost || act.Cost || act.price || act.Price || 0,
      duration: act.duration || act.Duration || act.time || '2小时'
    }))
  }

  /**
   * 转换餐饮数据
   */
  function convertMeals(day: any, budget: number, days: number): any[] {
    const mealsData = day.meals || day.Meals || day.dining || day.Dining || day.food || day.Food || []

    if (!Array.isArray(mealsData)) {
      return []
    }

    return mealsData.map((meal: any) => {
      let mealType = (
        meal.type ||
        meal.Type ||
        meal.mealType ||
        meal.MealType ||
        'lunch'
      ).toLowerCase()

      // 标准化餐饮类型
      if (mealType.includes('早') || mealType.includes('breakfast')) mealType = 'breakfast'
      else if (mealType.includes('午') || mealType.includes('lunch')) mealType = 'lunch'
      else if (mealType.includes('晚') || mealType.includes('dinner')) mealType = 'dinner'

      return {
        type: mealType,
        restaurant:
          meal.restaurant || meal.Restaurant || meal.place || meal.Place || '当地餐厅',
        cuisine: meal.cuisine || meal.Cuisine || meal.food || meal.Food || '当地特色',
        estimatedCost:
          meal.estimatedCost ||
          meal.EstimatedCost ||
          meal.cost ||
          meal.Cost ||
          meal.price ||
          meal.Price ||
          50
      }
    })
  }

  /**
   * 获取默认餐饮
   */
  function getDefaultMeals(dailyBudget: number): any[] {
    return [
      {
        type: 'breakfast',
        restaurant: '酒店早餐',
        cuisine: '当地特色',
        estimatedCost: Math.floor(dailyBudget * 0.1)
      },
      {
        type: 'lunch',
        restaurant: '当地餐厅',
        cuisine: '当地特色',
        estimatedCost: Math.floor(dailyBudget * 0.15)
      },
      {
        type: 'dinner',
        restaurant: '当地餐厅',
        cuisine: '当地特色',
        estimatedCost: Math.floor(dailyBudget * 0.15)
      }
    ]
  }

  /**
   * 确保天数匹配
   */
  function ensureDaysMatch(itinerary: Itinerary, params: ItineraryParams): void {
    while (itinerary.content.length < params.days) {
      const dayNum = itinerary.content.length + 1
      itinerary.content.push({
        day: dayNum,
        activities: [
          {
            time: '09:00',
            name: '自由活动',
            description: '根据个人兴趣安排',
            location: params.destination,
            cost: 0,
            duration: '全天'
          }
        ],
        meals: getDefaultMeals(Math.floor(params.budget / params.days)),
        accommodation: '当地酒店',
        dailyBudget: Math.floor(params.budget / params.days)
      })
    }
  }

  return {
    tryParseJsonItinerary,
    extractJsonString,
    parseJsonSafely,
    fixJsonString
  }
}
