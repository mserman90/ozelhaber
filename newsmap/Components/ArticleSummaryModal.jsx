import React from 'react'
import { translate as t } from '../i18n.js'
import './ArticleSummaryModal.css'

/**
 * @param {object} props
 * @param {import('../types').Article} props.article
 * @param {'en'|'tr'} props.locale
 * @param {boolean} props.newTab
 * @param {() => void} props.onClose
 */
export function ArticleSummaryModal({ article, locale, newTab, onClose }) {
  return (
    <div className="App-shade" onClick={onClose}>
      <section
        className="App-modal App-Options ArticleSummary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-summary-title"
        onClick={event => event.stopPropagation()}
      >
        <h1 id="article-summary-title">{article.title}</h1>
        {article.description && <p className="ArticleSummary-description">{article.description}</p>}
        <div className="ArticleSummary-actions">
          <a
            href={article.url}
            target={newTab ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="ArticleSummary-link"
          >
            {t(locale, 'readFullArticle')} ↗
          </a>
        </div>
        {!!article.sources?.length && (
          <div className="ArticleSummary-sources">
            <h2>{t(locale, 'sourcesTitle')}</h2>
            <ul>
              {article.sources.map(source => (
                <li key={source.id}>
                  <a href={source.url} target={newTab ? '_blank' : undefined} rel="noopener noreferrer">
                    {source.name || source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="ArticleSummary-footer">
          <button onClick={onClose}>{t(locale, 'dismiss')}</button>
        </p>
      </section>
    </div>
  )
}
