import React from 'react';
import { translate as t } from '../i18n.js';

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
        <div className="App-modalbody" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {article.description && (
            <p style={{ color: '#d4d4d8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
              {article.description}
            </p>
          )}

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
              📖 {t(locale, 'readFullArticle')} ↗
            </a>
          </div>

          {/* Alternative Sources list */}
          {article.sources && article.sources.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '0.95rem', color: '#e5e7eb', marginBottom: '0.5rem', fontWeight: 600 }}>
                {t(locale, 'sourcesTitle')} ({article.sources.length})
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
