import React, { useEffect, useState } from 'react'
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)

  // Stop speech when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function toggleSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = `${article.title}. ${article.description || ''}`
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = locale === 'tr' ? 'tr-TR' : 'en-US'
    utterance.rate = 1.0

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(article.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard error
    }
  }

  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

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

          {hasTTS && (
            <button
              type="button"
              className="ArticleSummary-btn"
              onClick={toggleSpeech}
              title={isSpeaking ? t(locale, 'stopAudio') : t(locale, 'listenAudio')}
            >
              {isSpeaking ? `⏹ ${t(locale, 'stopAudio')}` : `🔊 ${t(locale, 'listenAudio')}`}
            </button>
          )}

          <button
            type="button"
            className="ArticleSummary-btn"
            onClick={copyArticleLink}
          >
            {copied ? `✓ ${t(locale, 'linkCopied')}` : `📋 ${t(locale, 'copyLink')}`}
          </button>
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
