import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { layoutTreeMap } from '../layoutTreeMap'
import './TreeMap.css'

type Article = { id: string; category: string; weight: number }
type Category = { key: string; articles: Article[] }
type RenderArticle = {
  key: string
  item: Article
  category: string
  style: CSSProperties
}

type TreeMapMixedProps = {
  items: Category[]
  itemRender: (props: RenderArticle) => ReactNode
}

export default function TreeMapMixed({ items, itemRender }: TreeMapMixedProps) {
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

  const articleMix = useMemo(
    () => items.flatMap(category => category.articles).sort((a, b) => b.weight - a.weight),
    [items],
  )

  const dimensions = useMemo(
    () => layoutTreeMap(articleMix.map(article => article.weight), size),
    [articleMix, size],
  )

  if (articleMix.length === 0) return null

  return (
    <ol className="TreeMap-cat-list" ref={rootRef}>
      <li key={items[0]?.key || 'mixed'} style={{ position: 'absolute', top: 0, left: 0, width: size.width, height: size.height }}>
        <ol className="TreeMap-article-list">
          {articleMix.map((article, index) => {
            const articleStyle = dimensions[index] as CSSProperties | undefined
            if (!articleStyle) return null
            return itemRender({
              key: `${article.category}:${article.id}`,
              item: article,
              category: article.category,
              style: { ...articleStyle, position: 'absolute' },
            })
          })}
        </ol>
      </li>
    </ol>
  )
}
