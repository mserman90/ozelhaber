export interface Source {
  id: string
  title: string
  name: string
  url: string
}

export interface Article {
  id: string
  category: string
  title: string
  url: string
  publishedAt: string
  imageURL?: string
  sources: Source[]
  weight: number
}

export interface Category {
  id: string
  key: string
  name: string
  loadedAt: number
  articles: Article[]
  weight: number
}

export interface CustomSource {
  id: string
  name: string
  color: string
  type: 'rss' | 'search'
  url?: string
  query?: string
}

export interface SearchValue {
  text: string
  enabled: boolean
  mode: 'highlight' | 'filter'
  caseSensitive?: boolean
  regex?: boolean
  inHeadline?: boolean
  inSource?: boolean
}

export interface PresetFeed {
  id: string
  name: string
  url: string
  category: 'general' | 'tech' | 'economy' | 'global'
  color: string
  description?: string
  locale: 'tr' | 'en' | 'all'
}
