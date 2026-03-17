/**
 * Generate a consistent color based on a string (username)
 * @param str - The string to generate color from
 * @returns Hex color code
 */
export function generateAvatarColor(str: string): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#ec4899', // pink
  ]
  
  // Generate consistent hash from string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Get initials from username
 * @param username - The username to extract initials from
 * @returns Initials (1-2 characters)
 */
export function getInitials(username: string): string {
  if (!username) return '?'
  
  const words = username.trim().split(/\s+/)
  
  if (words.length === 1) {
    // Single word: take first character
    return words[0].charAt(0).toUpperCase()
  } else {
    // Multiple words: take first character of first two words
    return words
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
  }
}
