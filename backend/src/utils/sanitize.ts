/**
 * Input sanitization utilities
 * 防止XSS和注入攻击
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Escape regex special characters for safe regex construction
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove control characters and trim
  return query
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 200); // Limit length
}

/**
 * Validate and sanitize MongoDB ObjectId
 */
export function sanitizeObjectId(id: string): string | null {
  // MongoDB ObjectId is 24 hex characters
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return null;
  }
  return id;
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  return escapeHtml(input.trim().slice(0, maxLength));
}
