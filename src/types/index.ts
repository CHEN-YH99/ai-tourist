export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface Destination {
  name: string
  emoji: string
  description: string
}
