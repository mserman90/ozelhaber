import React, { useState, useEffect, useRef } from 'react';
import { translate as t } from '../i18n.js';
import { generateFreeAISummary } from '../../lib/free-ai';

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {import('./Edition').Article} props.article
 * @param {boolean} props.newTab
 * @param {() => void} props.onClose
 */
export function SourcesModal({
  locale = "en",
  article,
  newTab = true,
  onClose,
}) {
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const bodyRef = useRef(null);

  const mainSource = (article.sources && article.sources[0]) || {
    name: 'News',
    title: article.title,
    url: article.url,
  };

  const formattedTime = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  async function handleFetchSummary() {
    setLoadingSummary(true);
    setSummaryError(null);

    try {
      // 1. Try server endpoint first if available
      let data = null;
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            url: article.url,
            source: mainSource.name,
            locale,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        // Fallback to client-side free AI engine (e.g. on GitHub Pages)
      }

      // 2. If no server response or on static GitHub Pages, run free zero-key client engine
      if (!data) {
        data = await generateFreeAISummary(article.title, mainSource.name, locale);
      }

      setSummaryData(data);
    } catch (err) {
      console.error('Failed to get summary:', err);
      setSummaryError(locale === 'tr' ? 'Özet alınırken bir hata oluştu.' : 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  }

  // Sentiment badge colors and labels
  const sentimentConfig = {
    positive: {
      label: t(locale, 'sentimentPositive'),
      bg: '#14532d',
      text: '#86efac',
      border: '#22c55e',
    },
    neutral: {
      label: t(locale, 'sentimentNeutral'),
      bg: '#1e293b',
      text: '#93c5fd',
      border: '#3b82f6',
    },
    negative: {
      label: t(locale, 'sentimentNegative'),
      bg: '#450a0a',
      text: '#fca5a5',
      border: '#ef4444',
    },
    critical: {
      label: t(locale, 'sentimentUrgent'),
      bg: '#7f1d1d',
      text: '#fecaca',
      border: '#dc2626',
    },
  };

  const activeSentiment = summaryData?.sentiment
    ? sentimentConfig[summaryData.sentiment] || sentimentConfig.neutral
    : null;

  return (
    <div className="App-shade" onClick={onClose}>
      <div
        className="App-modal App-Options"
        style={{
          maxWidth: '680px',
          width: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#121212',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          padding: '1.25rem',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #262626', paddingBottom: '0.75rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#262626',
                color: '#a3a3a3',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '0.5rem',
              }}
            >
              {mainSource.name || t(locale, 'headlineLabel')}
            </span>
            <h1
              style={{
                fontSize: '1.25rem',
                lineHeight: '1.4',
                color: '#f5f5f5',
                margin: 0,
                fontWeight: 600,
              }}
            >
              {article.title}
            </h1>
            {formattedTime && (
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#737373' }}>
                🕒 {formattedTime}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a3a3a3',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 0.5rem',
            }}
            aria-label={t(locale, 'dismiss')}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="App-modalbody" ref={bodyRef} style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* Action Row: Read Original + AI Summary */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <a
              href={article.url}
              target={newTab ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'background 0.2s',
              }}
            >
              📖 {t(locale, 'originalArticle')} ↗
            </a>

            {!summaryData && !loadingSummary && (
              <button
                type="button"
                onClick={handleFetchSummary}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  transition: 'background 0.2s',
                }}
              >
                ✨ {t(locale, 'aiSummary')}
                <span style={{ fontSize: '0.7rem', opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                  {locale === 'tr' ? 'Ücretsiz' : 'Free'}
                </span>
              </button>
            )}
          </div>

          {/* AI Summary Loading State */}
          {loadingSummary && (
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #4338ca',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #818cf8',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.9rem' }}>{t(locale, 'summarizing')}</span>
            </div>
          )}

          {summaryError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {summaryError}
            </p>
          )}

          {/* AI Summary Result Card */}
          {summaryData && (
            <div
              style={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa' }}>
                    ✨ {t(locale, 'aiSummary')}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', padding: '1px 6px', borderRadius: '4px' }}>
                    {locale === 'tr' ? 'Ücretsiz & Anahtarsız' : 'Zero-Key & Free'}
                  </span>
                </div>

                {activeSentiment && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: activeSentiment.bg,
                      color: activeSentiment.text,
                      border: `1px solid ${activeSentiment.border}`,
                      fontWeight: 600,
                    }}
                  >
                    {activeSentiment.label}
                  </span>
                )}
              </div>

              {summaryData.keyTakeaway && (
                <div
                  style={{
                    backgroundColor: '#27272a',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    borderLeft: '3px solid #8b5cf6',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#e4e4e7',
                  }}
                >
                  <strong>{t(locale, 'keyTakeaway')}:</strong> {summaryData.keyTakeaway}
                </div>
              )}

              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d4d4d8', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {summaryData.summary?.map((point, index) => (
                  <li key={index} style={{ marginBottom: '0.35rem' }}>{point}</li>
                ))}
              </ul>

              {summaryData.tags && summaryData.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {summaryData.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        background: '#27272a',
                        color: '#a1a1aa',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {summaryData.modelUsed && (
                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#71717a' }}>
                  ⚡ Model: {summaryData.modelUsed}
                </p>
              )}
            </div>
          )}

          {/* Alternative Sources list */}
          {article.sources && article.sources.length > 1 && (
            <div style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '0.95rem', color: '#e5e7eb', marginBottom: '0.5rem', fontWeight: 600 }}>
                {t(locale, 'otherSources')} ({article.sources.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {article.sources.map((source, idx) => (
                  <a
                    key={source.id || idx}
                    href={source.url}
                    target={newTab ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      background: '#1f1f23',
                      border: '1px solid #2e2e34',
                      borderRadius: '6px',
                      padding: '0.6rem 0.75rem',
                      color: '#e5e7eb',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f3f4f6' }}>{source.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>{source.name}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #262626', paddingTop: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#262626',
              color: '#e5e7eb',
              border: '1px solid #404040',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {t(locale, 'dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
