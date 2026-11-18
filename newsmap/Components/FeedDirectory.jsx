import React, { useState } from 'react'
import { getCustomFeed } from '../sources/GoogleNewsRSS.js'
import { createSourceId, pickColour } from '../customSources.js'
import { feedDirectory } from '../feedsDirectory.js'
import { translate as t } from '../i18n.js'
import './FeedDirectory.css'

/**
 * @param {object} props
 * @param {'en'|'tr'} props.locale
 * @param {import('../customSources.js').CustomSource[]} props.sources
 * @param {(source: import('../customSources.js').CustomSource) => void} props.onAdd
 */
export function FeedDirectory({ locale, sources, onAdd }) {
  const [loadingUrl, setLoadingUrl] = useState('')
  const [error, setError] = useState('')
  const [addedUrls, setAddedUrls] = useState(() => new Set(sources.map(source => source.url).filter(Boolean)))
  const groups = ['turkey', 'world', 'technology', 'finance']

  async function addFeed(feed, index) {
    setLoadingUrl(feed.url)
    setError('')
    try {
      const result = await getCustomFeed({ url: feed.url })
      if (!result.articles.length) throw new Error(t(locale, 'feedEmpty'))
      onAdd({
        id: createSourceId('rss'),
        type: 'rss',
        name: feed.name,
        url: feed.url,
        color: pickColour(sources.length + index),
      })
      setAddedUrls(current => new Set([...current, feed.url]))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t(locale, 'feedLoadError'))
    } finally {
      setLoadingUrl('')
    }
  }

  return (
    <section className="FeedDirectory" aria-label={t(locale, 'directoryTitle')}>
      <p className="Feeds-hint">{t(locale, 'directoryHint')}</p>
      {error && <p role="alert" className="Feeds-status Feeds-status--error">{error}</p>}
      {groups.map(group => {
        const feeds = feedDirectory.filter(feed => feed.region === group)
        return (
          <section className="FeedDirectory-group" key={group}>
            <h2>{t(locale, `directoryGroups.${group}`)}</h2>
            <ul>
              {feeds.map((feed, index) => {
                const isAdded = addedUrls.has(feed.url)
                const isLoading = loadingUrl === feed.url
                return (
                  <li key={feed.url} className="FeedDirectory-item">
                    <div className="FeedDirectory-details">
                      <span>{feed.name}</span>
                      <small>{t(locale, `categories.${feed.category}`)}</small>
                    </div>
                    <button
                      type="button"
                      disabled={isAdded || !!loadingUrl}
                      onClick={() => addFeed(feed, index)}
                    >
                      {isAdded ? t(locale, 'directoryAdded') : isLoading ? t(locale, 'checkingSource') : t(locale, 'directoryAdd')}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
