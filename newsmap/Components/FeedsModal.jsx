import React, { useId, useState } from 'react';
import { getCustomFeed, getGoogleNewsSearchUrl, searchNews } from '../sources/GoogleNewsRSS.js';
import {
  buildDorkQuery,
  createSourceId,
  emptyDorkFields,
  pickColour,
  whenOptions,
} from '../customSources.js';
import presetFeeds from '../data/presetFeeds.json';
import './FeedsModal.css';
import { translate as t } from '../i18n.js';

/**
 * @typedef {import('../customSources.js').CustomSource} CustomSource
 */

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {{ [id: string]: CustomSource }} props.customSources
 * @param {string[]} props.selectedCategories
 * @param {string} props.edition
 * @param {string} props.editionName
 * @param {(source: CustomSource) => void} props.onAdd
 * @param {(id: string) => void} props.onRemove
 * @param {(id: string, visible: boolean) => void} props.onToggle
 * @param {() => void} props.onClose
 */
export function FeedsModal({
  locale = "en",
  customSources,
  selectedCategories,
  edition,
  editionName,
  onAdd,
  onRemove,
  onToggle,
  onClose,
}) {
  const [tab, setTab] = useState(/** @type {"preset"|"rss"|"search"} */("preset"));
  const sources = Object.values(customSources);
  const nextColour = pickColour(sources.length);

  return (
    <div className="App-shade" onClick={onClose}>
      <div
        className="App-modal App-Options Feeds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feeds-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <h1 id="feeds-modal-title">{t(locale, "customSources")}</h1>
        <div className="Feeds-tabs" role="tablist" aria-label={t(locale, "sourceType")}>
          <button
            role="tab"
            id="tab-preset"
            aria-selected={tab === "preset"}
            aria-controls="panel-preset"
            className={tab === "preset" ? "Feeds-tab Feeds-tab--active" : "Feeds-tab"}
            onClick={() => setTab("preset")}
          >
            {t(locale, "presetTab")}
          </button>
          <button
            role="tab"
            id="tab-rss"
            aria-selected={tab === "rss"}
            aria-controls="panel-rss"
            className={tab === "rss" ? "Feeds-tab Feeds-tab--active" : "Feeds-tab"}
            onClick={() => setTab("rss")}
          >
            {t(locale, "rssTab")}
          </button>
          <button
            role="tab"
            id="tab-search"
            aria-selected={tab === "search"}
            aria-controls="panel-search"
            className={tab === "search" ? "Feeds-tab Feeds-tab--active" : "Feeds-tab"}
            onClick={() => setTab("search")}
          >
            {t(locale, "googleSearch")}
          </button>
        </div>
        <div className="App-modalbody">
          {tab === "preset" ? (
            <PresetCatalog
              locale={locale}
              customSources={customSources}
              onAdd={onAdd}
            />
          ) : tab === "rss" ? (
            <RssForm key="rss" locale={locale} defaultColour={nextColour} onAdd={onAdd} />
          ) : (
            <SearchForm key="search" locale={locale} defaultColour={nextColour} edition={edition} editionName={editionName} onAdd={onAdd} />
          )}

          <h2 className="Feeds-heading">{t(locale, "yourSources")} ({sources.length})</h2>
          {sources.length === 0 ?
            <p className="Feeds-hint">{t(locale, "noCustomSources")}</p> :
            <ul className="Feeds-list">
              {sources.map(source => (
                <SourceRow
                  key={source.id}
                  locale={locale}
                  source={source}
                  visible={selectedCategories.includes(source.id)}
                  edition={edition}
                  onToggle={onToggle}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          }
        </div>
        <p style={{ textAlign: "right", marginBottom: 0 }}>
          <button onClick={onClose}>{t(locale, "dismiss")}</button>
        </p>
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {{ [id: string]: CustomSource }} props.customSources
 * @param {(source: CustomSource) => void} props.onAdd
 */
function PresetCatalog({ locale, customSources, onAdd }) {
  const [filterCategory, setFilterCategory] = useState("all");
  const existingUrls = new Set(Object.values(customSources).map(s => s.url));

  const filteredPresets = presetFeeds.filter(feed => {
    if (filterCategory === "all") return true;
    return feed.category === filterCategory;
  });

  const categories = [
    { id: "all", label: t(locale, "presetAll") },
    { id: "general", label: t(locale, "presetGeneral") },
    { id: "tech", label: t(locale, "presetTech") },
    { id: "economy", label: t(locale, "presetEconomy") },
    { id: "global", label: t(locale, "presetGlobal") },
  ];

  return (
    <div className="Feeds-presets">
      <p className="Feeds-hint" style={{ marginBottom: "0.75rem" }}>
        {t(locale, "presetHint")}
      </p>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`Feeds-cat-btn ${filterCategory === cat.id ? "Feeds-cat-btn--active" : ""}`}
            onClick={() => setFilterCategory(cat.id)}
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
              background: filterCategory === cat.id ? "#3b82f6" : "#2a2a2a",
              color: "#fff",
              border: "1px solid #444",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div
        className="Feeds-preset-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "0.75rem",
          maxHeight: "260px",
          overflowY: "auto",
          paddingRight: "4px",
          marginBottom: "1.25rem",
        }}
      >
        {filteredPresets.map(preset => {
          const isAdded = existingUrls.has(preset.url);

          return (
            <div
              key={preset.id}
              style={{
                background: "#1e1e1e",
                border: `1px solid ${isAdded ? preset.color : "#333"}`,
                borderRadius: "6px",
                padding: "0.6rem 0.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: preset.color,
                      flexShrink: 0,
                    }}
                  />
                  <strong style={{ fontSize: "0.9rem", color: "#f3f4f6" }}>{preset.name}</strong>
                </div>
                {preset.description && (
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", color: "#9ca3af", lineHeight: "1.3" }}>
                    {preset.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={isAdded}
                onClick={() => {
                  onAdd({
                    id: createSourceId(preset.name),
                    name: preset.name,
                    type: "rss",
                    url: preset.url,
                    color: preset.color,
                  });
                }}
                style={{
                  alignSelf: "flex-start",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: isAdded ? "default" : "pointer",
                  backgroundColor: isAdded ? "#15803d" : "#2563eb",
                  color: "#fff",
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}
              >
                {isAdded ? `✓ ${t(locale, "addedPreset")}` : `+ ${t(locale, "addPreset")}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {CustomSource} props.source
 * @param {boolean} props.visible
 * @param {string} props.edition
 * @param {(id: string, visible: boolean) => void} props.onToggle
 * @param {(id: string) => void} props.onRemove
 */
function SourceRow({ locale, source, visible, edition, onToggle, onRemove }) {
  const detail = source.type === "rss" ? source.url : source.query;
  const href = source.type === "rss" ? source.url : getGoogleNewsSearchUrl(source.query || "", edition);
  const checkboxId = `chk-source-${source.id}`;

  return (
    <li className="Feeds-row">
      <span className="Feeds-swatch" style={{ backgroundColor: source.color }} aria-hidden="true" />
      <div className="Feeds-row-text">
        <span className="Feeds-row-name">
          {source.name}
          <span className="Feeds-badge">{source.type === "rss" ? "RSS" : "Search"}</span>
        </span>
        <a className="Feeds-row-detail" href={href} target="_blank" rel="noopener noreferrer" title={detail}>{detail}</a>
      </div>
      <label htmlFor={checkboxId} className="Feeds-row-toggle">
        <input
          id={checkboxId}
          type="checkbox"
          checked={visible}
          onChange={e => onToggle(source.id, e.target.checked)}
        />
        {t(locale, "show")}
      </label>
      <button
        type="button"
        className="Feeds-row-remove"
        aria-label={`${t(locale, "remove")} ${source.name}`}
        onClick={() => onRemove(source.id)}
      >
        {t(locale, "remove")}
      </button>
    </li>
  );
}

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {string} props.defaultColour
 * @param {(source: CustomSource) => void} props.onAdd
 */
function RssForm({ locale, defaultColour, onAdd }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [colour, setColour] = useState(defaultColour);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(/** @type {string?} */(null));
  const urlId = useId();
  const nameId = useId();
  const colourId = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError(t(locale, "invalidUrl"));
      return;
    }

    setChecking(true);
    try {
      const feed = await getCustomFeed(trimmed);
      const chosenName = name.trim() || feed.name || trimmed;
      onAdd({
        id: createSourceId(chosenName),
        name: chosenName,
        type: "rss",
        url: trimmed,
        color: colour,
      });
      setUrl("");
      setName("");
    } catch (err) {
      if (err && typeof err === "object" && "status" in err) {
        if (err.status === 413) setError(t(locale, "feedTooLarge"));
        else if (err.status === 422) setError(t(locale, "invalidFeed"));
        else setError(err.message || t(locale, "feedLoadError"));
      } else {
        setError(err instanceof Error ? err.message : t(locale, "feedLoadError"));
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <form className="Feeds-form" onSubmit={handleSubmit}>
      <p className="Feeds-hint">{t(locale, "rssHint")}</p>
      <div className="App-formgroup">
        <label htmlFor={urlId}>{t(locale, "feedUrl")}</label>
        <input
          id={urlId}
          type="url"
          required
          placeholder="https://feeds.bbci.co.uk/news/rss.xml"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <div className="App-formgroup">
        <label htmlFor={nameId}>{t(locale, "name")}</label>
        <input
          id={nameId}
          type="text"
          placeholder={t(locale, "optionalFeedName")}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="App-formgroup">
        <label htmlFor={colourId}>{t(locale, "colour")}</label>
        <input
          id={colourId}
          type="color"
          value={colour}
          onChange={e => setColour(e.target.value)}
        />
      </div>
      {error && <p className="Feeds-error" role="alert">{error}</p>}
      <div className="Feeds-form-actions">
        <button type="submit" disabled={checking}>
          {checking ? t(locale, "checkingSource") : t(locale, "addFeed")}
        </button>
      </div>
    </form>
  );
}

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {string} props.defaultColour
 * @param {string} props.edition
 * @param {string} props.editionName
 * @param {(source: CustomSource) => void} props.onAdd
 */
function SearchForm({ locale, defaultColour, edition, editionName, onAdd }) {
  const [fields, setFields] = useState(emptyDorkFields);
  const [manualQuery, setManualQuery] = useState("");
  const [name, setName] = useState("");
  const [colour, setColour] = useState(defaultColour);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(/** @type {string?} */(null));
  const [manualOverride, setManualOverride] = useState(false);

  const query = manualOverride ? manualQuery : buildDorkQuery(fields);
  const nameId = useId();
  const colourId = useId();

  function updateField(k, v) {
    setFields(prev => ({ ...prev, [k]: v }));
    setManualOverride(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const finalQuery = query.trim();
    if (!finalQuery) {
      setError(t(locale, "enterSearch"));
      return;
    }

    setChecking(true);
    try {
      const items = await searchNews(finalQuery, edition);
      if (!items || items.length === 0) {
        setError(t(locale, "noSearchResults"));
        return;
      }
      const chosenName = name.trim() || finalQuery;
      onAdd({
        id: createSourceId(chosenName),
        name: chosenName,
        type: "search",
        query: finalQuery,
        color: colour,
      });
      setFields(emptyDorkFields());
      setManualQuery("");
      setName("");
      setManualOverride(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "searchError"));
    } finally {
      setChecking(false);
    }
  }

  const previewUrl = query.trim() ? getGoogleNewsSearchUrl(query.trim(), edition) : null;

  return (
    <form className="Feeds-form Feeds-form--search" onSubmit={handleSubmit}>
      <p className="Feeds-hint">
        {t(locale, "addGoogleSearchDescription")}{' '}
        <strong>{editionName}</strong> ({edition}).
      </p>

      <fieldset className="Feeds-fieldset">
        <legend>{t(locale, "queryBuilder")}</legend>

        <div className="App-formgroup">
          <label htmlFor="dork-all">{t(locale, "allWords")}</label>
          <input
            id="dork-all"
            type="text"
            placeholder="merger acquisition"
            value={fields.allWords}
            onChange={e => updateField("allWords", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-exact">{t(locale, "exactPhrase")}</label>
          <input
            id="dork-exact"
            type="text"
            placeholder="artificial intelligence"
            value={fields.exactPhrase}
            onChange={e => updateField("exactPhrase", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-any">{t(locale, "anyWords")} <span className="Feeds-input-hint">({t(locale, "combinedWithOr")})</span></label>
          <input
            id="dork-any"
            type="text"
            placeholder="NASA ESA SpaceX"
            value={fields.anyWords}
            onChange={e => updateField("anyWords", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-none">{t(locale, "exclude")} <span className="Feeds-input-hint">({t(locale, "prefixedWith")})</span></label>
          <input
            id="dork-none"
            type="text"
            placeholder="crypto bitcoin"
            value={fields.noneWords}
            onChange={e => updateField("noneWords", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-sites">{t(locale, "onlySites")} <span className="Feeds-input-hint">({t(locale, "siteOperator")})</span></label>
          <input
            id="dork-sites"
            type="text"
            placeholder="reuters.com, bbc.com"
            value={fields.sites}
            onChange={e => updateField("sites", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-exclude-sites">{t(locale, "excludeSites")} <span className="Feeds-input-hint">({t(locale, "siteOperator")})</span></label>
          <input
            id="dork-exclude-sites"
            type="text"
            placeholder="clickbait.com"
            value={fields.excludeSites}
            onChange={e => updateField("excludeSites", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-intitle">{t(locale, "inHeadline")} <span className="Feeds-input-hint">({t(locale, "inTitleOperator")})</span></label>
          <input
            id="dork-intitle"
            type="text"
            placeholder="launch"
            value={fields.intitle}
            onChange={e => updateField("intitle", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-inurl">{t(locale, "inUrl")} <span className="Feeds-input-hint">({t(locale, "inUrlOperator")})</span></label>
          <input
            id="dork-inurl"
            type="text"
            placeholder="economy"
            value={fields.inurl}
            onChange={e => updateField("inurl", e.target.value)}
          />
        </div>

        <div className="App-formgroup">
          <label htmlFor="dork-when">{t(locale, "timeRange")}</label>
          <select
            id="dork-when"
            value={fields.when}
            onChange={e => updateField("when", e.target.value)}
          >
            {whenOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {t(locale, opt.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {fields.when === "" && (
          <div className="Feeds-daterange">
            <div className="App-formgroup">
              <label htmlFor="dork-after">{t(locale, "afterDate")}</label>
              <input
                id="dork-after"
                type="date"
                value={fields.after}
                onChange={e => updateField("after", e.target.value)}
              />
            </div>
            <div className="App-formgroup">
              <label htmlFor="dork-before">{t(locale, "beforeDate")}</label>
              <input
                id="dork-before"
                type="date"
                value={fields.before}
                onChange={e => updateField("before", e.target.value)}
              />
            </div>
          </div>
        )}
      </fieldset>

      <div className="App-formgroup Feeds-query-preview">
        <label htmlFor="dork-query">
          {t(locale, "query")}
          {manualOverride ? (
            <button
              type="button"
              className="Feeds-inline-action"
              onClick={() => {
                setManualOverride(false);
                setManualQuery("");
              }}
            >
              {t(locale, "backToBuilder")}
            </button>
          ) : (
            <span className="Feeds-input-hint">
              ({t(locale, "generatedQuery")})
            </span>
          )}
        </label>
        <textarea
          id="dork-query"
          rows={2}
          value={query}
          onChange={e => {
            setManualOverride(true);
            setManualQuery(e.target.value);
          }}
        />
        {previewUrl && (
          <a
            className="Feeds-preview-link"
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(locale, "previewGoogle")} ↗
          </a>
        )}
      </div>

      <div className="App-formgroup">
        <label htmlFor={nameId}>{t(locale, "name")}</label>
        <input
          id={nameId}
          type="text"
          placeholder={t(locale, "optionalQueryName")}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="App-formgroup">
        <label htmlFor={colourId}>{t(locale, "colour")}</label>
        <input
          id={colourId}
          type="color"
          value={colour}
          onChange={e => setColour(e.target.value)}
        />
      </div>

      {error && <p className="Feeds-error" role="alert">{error}</p>}

      <div className="Feeds-form-actions">
        <button type="submit" disabled={checking}>
          {checking ? t(locale, "checkingSource") : t(locale, "addSearch")}
        </button>
      </div>
    </form>
  );
}
