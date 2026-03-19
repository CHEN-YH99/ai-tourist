/**
 * 输入清理和XSS防护工具
 */

/**
 * HTML特殊字符转义
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, m => map[m])
}

/**
 * 清理用户输入
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
    .substring(0, 10000) // 限制长度
}

/**
 * 清理搜索查询
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return ''

  return query
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
    .replace(/[<>]/g, '') // 移除尖括号
    .substring(0, 200) // 限制长度
}

/**
 * 验证URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 清理URL（仅允许http/https）
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  if (!isValidUrl(url)) return null
  return url
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 清理文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
}

/**
 * 验证ObjectId格式
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
