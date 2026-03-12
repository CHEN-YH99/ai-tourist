// Auth Types
export interface UserProfile {
  _id: string
  email: string
  username: string
  avatar?: string
  preferences: string[]
  contactInfo?: {
    phone?: string
    wechat?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
  username: string
}

export interface UpdateProfileDTO {
  username?: string
  avatar?: string
  preferences?: string[]
  contactInfo?: {
    phone?: string
    wechat?: string
  }
}

export interface AuthResponse {
  token: string
  user: UserProfile
}

// Message & Conversation Types
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  _id: string
  userId?: string
  messages: Message[]
  title?: string
  createdAt: Date
  updatedAt: Date
}

// Itinerary Types
export interface Activity {
  time: string
  name: string
  description: string
  location: string
  cost: number
  duration: string
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner'
  restaurant: string
  cuisine: string
  estimatedCost: number
}

export interface DayPlan {
  day: number
  activities: Activity[]
  meals: Meal[]
  accommodation?: string
  dailyBudget: number
}

export interface Itinerary {
  _id: string
  userId: string
  destination: string
  days: number
  budget: number
  preferences: string[]
  content: DayPlan[]
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ItineraryParams {
  destination: string
  days: number
  budget: number
  preferences?: string[]
}

// Destination Types
export interface Attraction {
  name: string
  description: string
  image?: string
  ticketPrice?: number
  openingHours?: string
}

export interface Destination {
  _id: string
  name: string
  nameEn?: string
  region: string
  country: string
  type: string[]
  description: string
  images: string[]
  attractions: Attraction[]
  bestTimeToVisit: string
  averageBudget: {
    min: number
    max: number
    currency: string
  }
  climate?: string
  transportation?: string
  tips: string[]
  popularity: number
  createdAt: Date
  updatedAt: Date
}

export interface DestinationFilters {
  region?: string
  type?: string
  sortBy?: 'popularity' | 'name' | 'budget'
}

// Collection Types
export type CollectionType = 'itinerary' | 'conversation'

export interface Collection {
  _id: string
  userId: string
  itemId: string
  itemType: CollectionType
  createdAt: Date
}

// Search Types
export interface SearchFilters {
  type?: 'destination' | 'itinerary' | 'conversation'
  sortBy?: 'relevance' | 'date'
}

export interface SearchResults {
  destinations: Destination[]
  itineraries: Itinerary[]
  conversations: Conversation[]
  total: number
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
