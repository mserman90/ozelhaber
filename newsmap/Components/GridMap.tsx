import type { CSSProperties, ReactNode } from 'react'
import type { Article, Category } from '../types'
import './GridMap.css'

type GridMapProps = {
  items: Category[]
  itemRender: (props: {
    key: string
    item: Article
    category: Category
    style: CSSProperties
  }) => ReactNode
}

export default function GridMap({ items, itemRender }: GridMapProps) {
  return (
    <ol className="GridMap-cat-list">
      {items.map(category => (
        <li key={category.key} style={{ flexGrow: category.weight * 1e8 }}>
          <ol className="GridMap-article-list">
            {category.articles.map(article => itemRender({
              key: article.id,
              item: article,
              category,
              style: { flexGrow: article.sources.length },
            }))}
          </ol>
        </li>
      ))}
    </ol>
  )
}
