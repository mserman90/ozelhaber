import React, { useContext, useMemo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { Article as ArticleData, Category } from '../types';
import { analyzeSentiment } from '../sentiment';

import defaultColours from '../colours';

import './Article.css';
import { luminance } from '../util';
import { SearchContext } from '../SearchContext';
import { isSearchMatching } from '../isSearchMatching';

type ArticleProps = {
  item: ArticleData
  category: Category | string
  showImage: boolean
  showGradient: boolean
  sentimentHighlighting: boolean
  newTab: boolean
  colours?: Record<string, string>
  style: CSSProperties
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function Article({
  item,
  showImage,
  showGradient,
  sentimentHighlighting,
  colours = defaultColours,
  style,
  onClick,
  newTab,
}: ArticleProps) {
  // Dimensions safety check
  const width = finiteNonNegative(style.width);
  const height = finiteNonNegative(style.height);
  const safeStyle: CSSProperties = {
    ...style,
    top: finiteNonNegative(style.top),
    left: finiteNonNegative(style.left),
    width,
    height,
  };

  const searchValue = useContext(SearchContext);
  const padding = getPadding(width, height);

  const source = item.sources?.[0];
  const sourceName = source?.name || '';
  const sourceTitle = source?.title || item.title || '';

  // Deterministic, instant font size calculation derived directly from dimensions
  // Completely eliminates recursive layout reflows, setTimeout loops and card jitter/flicker
  const fontSize = useMemo(() => {
    return calculateOptimalFontSize(width, height, sourceTitle.length);
  }, [width, height, sourceTitle.length]);

  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();

  if (showImage && item.imageURL) {
    safeStyle.backgroundImage = `url(${item.imageURL})`;
  }

  let backgroundColor = getAgedColour(colours[item.category] || '#333333', timeDelta / (1000 * 60 * 60));

  const matchesSearch = isSearchMatching(searchValue, item);
  if (!matchesSearch) {
    backgroundColor = '#666666';
  }

  const sentimentColor = sentimentHighlighting
    ? { positive: '#61d095', negative: '#ff786e', neutral: 'transparent' }[analyzeSentiment(item)]
    : 'transparent';

  const articleStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    padding: `${padding}px`,
  };

  return (
    <li
      className={
        'Article-li ' +
        (showImage && item.imageURL ? 'Article-image ' : '') +
        (showGradient ? 'Article--shadow' : '')
      }
      style={{
        ...safeStyle,
        backgroundColor,
        color: luminance(backgroundColor) > 176 ? '#111' : '#FFF',
        boxShadow: sentimentColor === 'transparent' ? undefined : `inset 0 0 0 3px ${sentimentColor}`,
      }}
    >
      {item.clusterCount ? (
        <span
          className="Article-cluster-badge"
          aria-label={`${item.clusterCount} similar stories clustered`}
          title={`${item.clusterCount} similar stories clustered`}
        >
          +{item.clusterCount}
        </span>
      ) : null}
      <a
        href={item.url}
        className="article"
        title={sourceName ? `${sourceName}: ${sourceTitle}` : sourceTitle}
        data-source={sourceName}
        style={articleStyle}
        onClick={onClick}
        rel="noopener"
        target={newTab ? '_blank' : '_self'}
      >
        {sourceTitle}
      </a>
    </li>
  );
}

/**
 * Calculates optimal font size geometrically from width, height, and title length.
 * Runs instantly in memory with zero DOM reads and zero feedback loops.
 */
function calculateOptimalFontSize(width: number, height: number, textLength: number): number {
  if (width <= 0 || height <= 0) return 9;

  const pad = getPadding(width, height);
  const availW = Math.max(10, width - pad * 2);
  const availH = Math.max(10, height - pad * 2);
  const area = availW * availH;
  const len = Math.max(8, textLength);

  // Theoretical font size where text area fits within box area
  const rawSize = Math.sqrt(area / (len * 1.35));

  // Minimum & maximum bounds strictly clamped to container dimensions
  const minSize = Math.max(7.5, Math.min(11, availH * 0.22));
  const maxSize = Math.max(11, Math.min(26, availH * 0.48, availW * 0.25));

  return Math.min(maxSize, Math.max(minSize, Math.round(rawSize * 10) / 10));
}

function finiteNonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function getPadding(maxWidth: number, maxHeight: number) {
  const width = finiteNonNegative(maxWidth);
  const height = finiteNonNegative(maxHeight);
  return Math.min(Math.max(2, width * 0.03), Math.max(2, height * 0.03));
}

function getAgedColour(base: string, age: number) {
  const k1 = 50 / 9;
  const k2 = 20 / 3;
  const c = 1 - k1 / k2;

  const scale = k1 / (age + k2) + c;

  const b1 = parseInt(base.substring(1, 3), 16);
  const b2 = parseInt(base.substring(3, 5), 16);
  const b3 = parseInt(base.substring(5, 7), 16);

  const r = Math.floor(b1 * scale).toString(16).padStart(2, '0');
  const g = Math.floor(b2 * scale).toString(16).padStart(2, '0');
  const b = Math.floor(b3 * scale).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}
