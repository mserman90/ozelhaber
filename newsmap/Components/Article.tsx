import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { Article as ArticleData, Category } from '../types';
import { analyzeSentiment } from '../sentiment';

import defaultColours from '../colours';

import './Article.css';
import { luminance } from '../util';
import { SearchContext } from '../SearchContext';
import { isSearchMatching } from '../isSearchMatching';

const DEBUG_FONT_SIZE = false;

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
  const elementRef = useRef<HTMLAnchorElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(10);

  const { title } = item;
  // The treemap can briefly produce non-finite dimensions while its container
  // is mounting or has no measurable size. Never forward those values to CSS.
  const width = finiteNonNegative(style.width);
  const height = finiteNonNegative(style.height);
  const safeStyle = {
    ...style,
    top: finiteNonNegative(style.top),
    left: finiteNonNegative(style.left),
    width,
    height,
  };

  const searchValue = useContext(SearchContext);

  // Dynamic padding
  const padding = getPadding(width, height);

  // If the width or height changes, then wait 2 seconds for animations to
  // finish and start adjusting font size if required (bigger or smaller).
  useLayoutEffect(() => {
    let current = true;

    setTimeout(() => {
      if (current && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();

        const paddingHeight = height - padding * 2;

        // May shrink font size
        if (rect.width > width || rect.height > paddingHeight) {
          setFontSize(fontSize => {
            const overScale = Math.min(width / rect.width, paddingHeight / rect.height);
            return fontSize * overScale;
          });
        }

        // May grow font size
        setFontSize(calculateNewFontSize(rect.width, rect.height, width, height));
      }
    }, 2000);

    return () => { current = false; };
  }, [title, width, height]);

  // If the font size (or height or width) has just changed, try to grow font
  // size slightly.
  // This effect is only able to make the font size bigger.
  useLayoutEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();

      setTimeout(() => {
        setFontSize(calculateNewFontSize(rect.width, rect.height, width, height));
      }, 0);
    }
  }, [fontSize, width, height]);

  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();

  if (showImage && item.imageURL) {
    safeStyle.backgroundImage = `url(${item.imageURL})`;
  }

  let backgroundColor = getAgedColour(colours[item.category] || '#333333', timeDelta / (1000 * 60 * 60));

  const source = item.sources[0];
  const sourceName = source?.name || '';
  const sourceTitle = source?.title || item.title;

  const matchesSearch = isSearchMatching(searchValue, item);

  if (!matchesSearch) {
    backgroundColor = "#666666";
  }

  const outline = DEBUG_FONT_SIZE ? "1px solid red" : void 0;

  const articleStyle = {
    fontSize,
    padding,
    outline,
  };
  const sentimentColor = sentimentHighlighting
    ? { positive: '#61d095', negative: '#ff786e', neutral: 'transparent' }[analyzeSentiment(item)]
    : 'transparent';

  const maxFontHeight = getMaxFontHeight(fontSize, width, height);

  const rectHeight = elementRef.current ? elementRef.current.getBoundingClientRect().height : 0;
  const paddingHeight = rectHeight - padding * 2;

  return (
    <li className={"Article-li " + (showImage && item.imageURL ? "Article-image" : "") + (showGradient ? "Article--shadow" : "")} style={{ ...safeStyle, backgroundColor, color: luminance(backgroundColor) > 176 ? "#111" : "#FFF", boxShadow: sentimentColor === 'transparent' ? undefined : `inset 0 0 0 3px ${sentimentColor}` }}>
      {
        DEBUG_FONT_SIZE && <>
          <div style={{ position: "absolute", width: "100%", top: padding, height: maxFontHeight, borderBottom: "1px solid blue" }} />
          <div style={{ position: "absolute", width: "100%", bottom: padding, height: fontSize * 1.1, borderTop: "1px solid grey", borderBottom: "1px solid grey", fontSize: 4 }}>{(paddingHeight / (fontSize * 1.1)).toFixed()}</div>
        </>
      }
      {item.clusterCount ? <span className="Article-cluster-badge" aria-label={`${item.clusterCount} similar stories clustered`} title={`${item.clusterCount} similar stories clustered`}>+{item.clusterCount}</span> : null}
      <a
        href={item.url}
        className="article"
        title={sourceName ? `${sourceName}: ${sourceTitle}` : sourceTitle}
        data-source={sourceName}
        style={articleStyle}
        onClick={onClick}
        rel="noopener"
        target={newTab ? "_blank" : "_self"}
        ref={elementRef}
      >
        {sourceTitle}
      </a>
    </li>
  );
}

/**
 * Grow only
 * @param {number} currentWidth
 * @param {number} currentHeight
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @returns
 */
function calculateNewFontSize(currentWidth: number, currentHeight: number, maxWidth: number, maxHeight: number) {

  return (fontSize: number) => {
    const maxFontHeight = getMaxFontHeight(fontSize, maxWidth, maxHeight);

    const scale = maxFontHeight / currentHeight;
    const targetFontSize = fontSize * scale;

    // low-pass constant
    const t = 0.9;

    const newSize = fontSize * t + targetFontSize * (1 - t);

    const delta = (newSize - fontSize);

    // If we've spilled over, then just stop growing
    if (currentWidth > maxWidth) {
      return fontSize;
    }

    // If the delta is too small then stop growing
    // if (delta/fontSize < 0.0025) {
    //   return fontSize;
    // }
    if (Math.abs(delta) < 0.25) {
      return fontSize;
    }

    // Otherwise grow slightly
    return newSize;
  };
}

/**
 * @param {number} fontSize
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
function getMaxFontHeight(fontSize: number, maxWidth: number, maxHeight: number) {
  const padding = getPadding(maxWidth, maxHeight);

  const paddingHeight = maxHeight - padding * 2;

  const lineHeight = fontSize * 1.2;

  const lines = Math.round(paddingHeight / lineHeight);

  // const linesMod = lines % 1;

  // if (linesMod < 0.5) {
  //   return Math.min(paddingHeight, Math.floor(lines + 1) * lineHeight)
  // }

  // return Math.min(paddingHeight, Math.floor(lines) * lineHeight);

  // return Math.min(paddingHeight - lineHeight, (Math.floor(lines) + 0.5) * lineHeight);

  // return (Math.floor(lines) + 0.5) * lineHeight;

  // return (lines + 0.5) * lineHeight;

  // return Math.min(paddingHeight, lines * lineHeight);

  return Math.min(paddingHeight - lineHeight, lines * lineHeight);
}

/**
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
function finiteNonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function getPadding(maxWidth: number, maxHeight: number) {
  const width = finiteNonNegative(maxWidth);
  const height = finiteNonNegative(maxHeight);
  return Math.min(width * 0.03, height * 0.03);
}

function getAgedColour(base: string, age: number) {
  const k1 = 50 / 9;
  const k2 = 20 / 3;
  const c = 1 - (k1 / k2);

  const scale = k1 / (age + k2) + c;

  const b1 = parseInt(base.substring(1, 3), 16);
  const b2 = parseInt(base.substring(3, 5), 16);
  const b3 = parseInt(base.substring(5, 7), 16);

  const r = Math.floor(b1 * scale).toString(16).padStart(2, "0");
  const g = Math.floor(b2 * scale).toString(16).padStart(2, "0");
  const b = Math.floor(b3 * scale).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}
