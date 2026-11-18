import { useEffect, useState } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import GridMap from './GridMap'
import TreeMap from './TreeMap'
import TreeMapMixed from './TreeMapMixed'
import ArticleCard from './Article'
import { useCategoryItems } from './useCategoryItems.js'
import type { Article, Category, CustomFeedSource, MapMode, WeightingMode } from '../types'

export type { Article, Category } from '../types'

type EditionProps = {
  edition: string
  categories: string[]
  mode: MapMode
  weightingMode: WeightingMode
  colours: Record<string, string>
  showImages: boolean
  showGradient: boolean
  itemsPerCategory: number
  refreshTime: number
  newTab: boolean
  customSources: Record<string, CustomFeedSource>
  onArticleClick: (article: Article, event: MouseEvent<HTMLAnchorElement>) => void
}

type RenderArticleProps = {
  key: string
  item: Article
  category: Category | string
  style: CSSProperties
}

export default function Edition({
  edition,
  categories,
  mode,
  weightingMode,
  showImages,
  showGradient,
  colours,
  itemsPerCategory,
  newTab,
  refreshTime,
  onArticleClick,
  customSources,
}: EditionProps) {
  const items = useCategoryItems(
    categories,
    refreshTime,
    edition,
    itemsPerCategory,
    weightingMode,
    customSources,
  ) as Category[]

  useFastVisualRefresh(weightingMode === 'time', 60 * 1000)
  if (items.length === 0) return null

  const renderArticle = ({ key, item, category, style }: RenderArticleProps) => (
    <ArticleCard
      key={key}
      item={item}
      category={category}
      style={style}
      showImage={showImages}
      showGradient={showGradient}
      colours={colours}
      newTab={newTab}
      onClick={event => onArticleClick(item, event)}
    />
  )

  const mapProps = { items, itemRender: renderArticle }
  if (mode === 'tree') return <TreeMap {...mapProps} />
  if (mode === 'grid') return <GridMap {...mapProps} />
  return <TreeMapMixed {...mapProps} />
}

function useFastVisualRefresh(enabled: boolean, timeout: number) {
  const [, setCounter] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(() => setCounter(counter => counter + 1), timeout)
    return () => window.clearInterval(interval)
  }, [enabled, timeout])
}
