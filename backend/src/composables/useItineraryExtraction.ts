/**
 * Composable for extracting itinerary parameters from AI messages
 * 从AI消息中提取攻略参数的可复用逻辑
 */

export interface ItineraryParams {
  destination: string;
  days: number;
  budget: number;
  preferences?: string[];
}

/**
 * Extract destination from text
 */
function extractDestination(text: string): string | null {
  const patterns = [
    /(?:去|到|前往|游览|参观|旅游|旅行)\s*([^\s，。！？,.\n]{2,10})/,
    /([^\s，。！？,.\n]{2,10})\s*(?:旅游|旅行|游玩|攻略|行程)/,
    /目的地[：:]\s*([^\s，。！？,.\n]{2,10})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract days from text
 */
function extractDays(text: string): number | null {
  const patterns = [
    /(\d+)\s*天/,
    /(\d+)\s*日/,
    /天数[：:]\s*(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const days = parseInt(match[1], 10);
      if (days > 0 && days <= 30) {
        return days;
      }
    }
  }

  return null;
}

/**
 * Extract budget from text
 */
function extractBudget(text: string): number | null {
  const patterns = [
    /预算[：:]\s*(\d+)/,
    /(\d+)\s*元/,
    /(\d+)\s*块/,
    /(\d{3,6})\s*(?:左右|以内|以下)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const budget = parseInt(match[1], 10);
      if (budget >= 100 && budget <= 1000000) {
        return budget;
      }
    }
  }

  return null;
}

/**
 * Extract preferences from text
 */
function extractPreferences(text: string): string[] {
  const preferences: string[] = [];
  const keywords = {
    '美食': ['美食', '吃', '餐厅', '小吃', '特色菜'],
    '购物': ['购物', '买', '商场', '市场'],
    '文化': ['文化', '历史', '博物馆', '古迹', '遗址'],
    '自然': ['自然', '风景', '山', '海', '湖', '公园'],
    '娱乐': ['娱乐', '游乐', '主题公园', '夜生活'],
    '摄影': ['摄影', '拍照', '打卡'],
    '亲子': ['亲子', '儿童', '家庭'],
    '休闲': ['休闲', '放松', '度假'],
  };

  for (const [pref, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      preferences.push(pref);
    }
  }

  return preferences;
}

/**
 * Main extraction function
 */
export function extractItineraryParams(text: string): Partial<ItineraryParams> {
  const params: Partial<ItineraryParams> = {};

  const destination = extractDestination(text);
  if (destination) {
    params.destination = destination;
  }

  const days = extractDays(text);
  if (days) {
    params.days = days;
  }

  const budget = extractBudget(text);
  if (budget) {
    params.budget = budget;
  }

  const preferences = extractPreferences(text);
  if (preferences.length > 0) {
    params.preferences = preferences;
  }

  return params;
}

/**
 * Validate extracted parameters
 */
export function validateItineraryParams(params: Partial<ItineraryParams>): {
  isValid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!params.destination) {
    missing.push('目的地');
  }
  if (!params.days) {
    missing.push('天数');
  }
  if (!params.budget) {
    missing.push('预算');
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Format missing parameters message
 */
export function formatMissingParamsMessage(missing: string[]): string {
  if (missing.length === 0) {
    return '';
  }

  return `请提供以下信息：${missing.join('、')}`;
}
