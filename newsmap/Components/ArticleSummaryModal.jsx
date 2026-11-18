import React, { useState } from 'react'
import { translate as t } from '../i18n.js'
import './ArticleSummaryModal.css'

const localModels = new Map()

async function loadLocalModel(locale, onProgress) {
  const key = locale === 'tr' ? 'tr' : 'en'
  if (!localModels.has(key)) {
    const task = 'text2text-generation'
    const modelId = key === 'tr' ? 'Xenova/mt5-small' : 'Xenova/LaMini-Flan-T5-77M'
    const load = import('@huggingface/transformers').then(({ pipeline }) => {
      return pipeline(task, modelId, {
        dtype: 'q8',
        progress_callback: progress => {
          if (progress.status === 'progress_total') onProgress(Math.round(progress.progress))
        },
      })
    })
    localModels.set(key, load)
    load.catch(() => localModels.delete(key))
  }
  return localModels.get(key)
}

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
  const [downloadProgress, setDownloadProgress] = useState(null)

  async function summarize() {
    setLoading(true)
    setError('')
    setDownloadProgress(0)
    try {
      const model = await loadLocalModel(locale, setDownloadProgress)
      const text = `${article.title}. ${article.description || ''}`.trim().slice(0, 4000)
      const hasDescription = Boolean(article.description?.trim())
      const prompt = hasDescription
        ? locale === 'tr'
          ? `Bu haber metnini yalnızca verilen bilgilere dayanarak Türkçe 3 kısa maddeyle özetle. Yeni bilgi uydurma. Haber: ${text}`
          : `Summarize this news article in 3 concise bullet points. Use only the supplied facts and do not invent details. Article: ${text}`
        : locale === 'tr'
          ? `Bu haber başlığını tek bir kısa, tarafsız Türkçe cümleyle yeniden ifade et. Ek bilgi uydurma. Başlık: ${article.title}`
          : `Rewrite this news headline as one short, neutral sentence. Do not add context or infer facts. Headline: ${article.title}`
      const result = await model(prompt, { max_new_tokens: hasDescription ? 100 : 42, do_sample: false })
      const generated = Array.isArray(result) ? result[0] : result
      setSummary(generated?.summary_text || generated?.generated_text || t(locale, 'summaryError'))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t(locale, 'localAiError'))
    } finally {
      setLoading(false)
      setDownloadProgress(null)
    }
  }

  return (
    <div className="App-shade" onClick={onClose}>
      <section className="App-modal App-Options ArticleSummary-modal" role="dialog" aria-modal="true" aria-labelledby="article-summary-title" onClick={event => event.stopPropagation()}>
        <h1 id="article-summary-title">{article.title}</h1>
        {article.description && <p className="ArticleSummary-description">{article.description}</p>}
        {!article.description && <p className="ArticleSummary-note">{t(locale, 'noDescriptionNote')}</p>}
        <p className="ArticleSummary-note">{t(locale, 'localAiInfo')}</p>
        <div className="ArticleSummary-actions">
          <button onClick={summarize} disabled={loading}>
            {loading ? `${t(locale, 'summaryLoading')}${downloadProgress !== null ? ` ${downloadProgress}%` : ''}` : t(locale, 'summarizeArticle')}
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
