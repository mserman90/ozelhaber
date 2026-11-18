import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { layoutTreeMap } from '../layoutTreeMap'
import type { Article, Category } from '../types'
import './TreeMap.css'
type RenderArticle = {
  key: string
  item: Article
  category: Category
  style: CSSProperties
}

type TreeMapProps = {
  items: Category[]
  itemRender: (props: RenderArticle) => ReactNode
}

export default function TreeMap({ items, itemRender }: TreeMapProps) {
  const rootRef = useRef<HTMLOListElement>(null)
  const [size, setSize] = useState({ width: 1024, height: 768 })

  useLayoutEffect(() => {
    const element = rootRef.current
    if (!element) return

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect()
      if (width > 0 && height > 0) setSize(current =>
        current.width === width && current.height === height ? current : { width, height },
      )
    }

    updateSize()
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize)
      observer.observe(element)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const dimensions = useMemo(
    () => layoutTreeMap(items.map(category => category.weight), size),
    [items, size],
  )

  return (
    <ol className="TreeMap-cat-list" ref={rootRef}>
      {items.map((category, categoryIndex) => {
        const categoryStyle = dimensions[categoryIndex] as CSSProperties | undefined
        if (category.articles.length === 0 || !categoryStyle) return null

        const articleDimensions = layoutTreeMap(
          category.articles.map(article => article.weight),
          categoryStyle as { width: number; height: number },
        )

        return (
          <li key={category.key} style={categoryStyle}>
            <ol className="TreeMap-article-list">
              {category.articles.map((article, articleIndex) => {
                const articleStyle = articleDimensions[articleIndex] as CSSProperties | undefined
                if (!articleStyle) return null
                return itemRender({
                  key: article.id,
                  item: article,
                  category,
                  style: { ...articleStyle, position: 'absolute' },
                })
              })}
            </ol>
          </li>
        )
      })}
    </ol>
  )
}
