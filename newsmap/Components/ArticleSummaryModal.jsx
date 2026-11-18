import React, { useState } from 'react'
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
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function summarize() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: article.title, description: article.description || '', locale }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t(locale, 'summaryError'))
      setSummary(result.summary)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t(locale, 'summaryError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App-shade" onClick={onClose}>
      <section className="App-modal App-Options ArticleSummary-modal" role="dialog" aria-modal="true" aria-labelledby="article-summary-title" onClick={event => event.stopPropagation()}>
        <h1 id="article-summary-title">{article.title}</h1>
        {article.description && <p className="ArticleSummary-description">{article.description}</p>}
        <div className="ArticleSummary-actions">
          <button onClick={summarize} disabled={loading}>
            {loading ? t(locale, 'summaryLoading') : t(locale, 'summarizeArticle')}
          </button>
          <a href={article.url} target={newTab ? '_blank' : undefined} rel="noopener noreferrer" className="ArticleSummary-link">{t(locale, 'readFullArticle')}</a>
        </div>
        {error && <p className="ArticleSummary-error" role="alert">{error}</p>}
        {summary && <div className="ArticleSummary-result" aria-live="polite"><h2>{t(locale, 'summaryHeading')}</h2><p>{summary}</p></div>}
        {!!article.sources?.length && (
          <div className="ArticleSummary-sources">
            <h2>{t(locale, 'sourcesTitle')}</h2>
            <ul>
              {article.sources.map(source => (
                <li key={source.id}><a href={source.url} target={newTab ? '_blank' : undefined} rel="noopener noreferrer">{source.name || source.title}</a></li>
              ))}
            </ul>
          </div>
        )}
        <p className="ArticleSummary-footer"><button onClick={onClose}>{t(locale, 'dismiss')}</button></p>
      </section>
    </div>
  )
}
