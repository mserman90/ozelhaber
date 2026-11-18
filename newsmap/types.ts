export type FeedSource = {
  id: string
  name: string
  title: string
  url: string
}

export type Article = {
  id: string
  category: string
  title: string
  url: string
  publishedAt: string
  imageURL: string
  sources: FeedSource[]
  weight: number
}

export type Category = {
  id: string
  key: string
  name: string
  loadedAt: number
  articles: Article[]
  weight: number
  error?: string
}

export type CustomFeedSource = {
  id: string
  type: 'rss' | 'search'
  name: string
  color: string
  url?: string
  query?: string
}

export type SearchFilter = {
  enabled: boolean
  text: string
  mode: 'highlight' | 'filter'
  caseSensitive: boolean
  regex: boolean
  includeHeadline: boolean
  includeSource: boolean
}

export type MapMode = 'tree' | 'grid' | 'tree_mixed'
export type WeightingMode = 'time' | 'sourceCount' | 'sources' | 'position'
