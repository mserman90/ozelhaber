import React, { useId, useState } from 'react';
import { getCustomFeed, getGoogleNewsSearchUrl, searchNews } from '../sources/GoogleNewsRSS.js';
import {
  buildDorkQuery,
  createSourceId,
  emptyDorkFields,
  pickColour,
  whenOptions,
} from '../customSources.js';
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
  const [tab, setTab] = useState(/** @type {"rss"|"search"} */("rss"));
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
          {tab === "rss" ?
            <RssForm key="rss" locale={locale} defaultColour={nextColour} onAdd={onAdd} /> :
            <SearchForm key="search" locale={locale} defaultColour={nextColour} edition={edition} editionName={editionName} onAdd={onAdd} />
          }

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
        className="Feeds-remove"
        onClick={() => onRemove(source.id)}
        aria-label={`${t(locale, "remove")} ${source.name}`}
      >
        {t(locale, "remove")}
      </button>
    </li>
  );
}

/**
 * @param {{ state: "idle"|"loading"|"error"|"success", message?: string }} props
 */
function Status({ locale, state, message }) {
  if (state === "idle") return null;
  return (
    <p
      className={`Feeds-status Feeds-status--${state}`}
      role={state === "error" ? "alert" : "status"}
    >
      {state === "loading" ? t(locale, "checkingSource") : message}
    </p>
  );
}

/**
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {string} props.defaultColour
 * @param {(source: CustomSource) => void} props.onAdd
 */
function RssForm({ locale, defaultColour, onAdd }) {
  const uid = useId();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [colour, setColour] = useState(defaultColour);
  const [status, setStatus] = useState(/** @type {{ state: "idle"|"loading"|"error"|"success", message?: string }} */({ state: "idle" }));

  /**
   * @param {import('react').FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    let normalised = url.trim();
    if (normalised && !/^https?:\/\//i.test(normalised)) {
      normalised = `https://${normalised}`;
    }

    try {
      new URL(normalised);
    } catch (err) {
      setStatus({ state: "error", message: t(locale, "invalidUrl") });
      return;
    }

    setStatus({ state: "loading" });
    try {
      const feed = await getCustomFeed({ url: normalised });
      if (feed.articles.length === 0) {
        setStatus({ state: "error", message: t(locale, "feedEmpty") });
        return;
      }
      const finalName = name.trim() || feed.title || new URL(normalised).hostname;
      onAdd({ id: createSourceId("rss"), type: "rss", name: finalName, url: normalised, color: colour });
      setStatus({ state: "success", message: locale === "tr" ? `“${finalName}” ${feed.articles.length} haberle eklendi.` : `Added "${finalName}" with ${feed.articles.length} articles.` });
      setUrl("");
      setName("");
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? (t(locale, err.message === "Feed is too large (max 3 MB)" ? "feedTooLarge" : err.message === "URL did not return an RSS or Atom feed" ? "invalidFeed" : "feedLoadError")) : t(locale, "feedLoadError") });
    }
  }

  return (
    <form
      id="panel-rss"
      role="tabpanel"
      aria-labelledby="tab-rss"
      onSubmit={handleSubmit}
      className="Feeds-form"
    >
      <p className="Feeds-hint">{t(locale, "rssHint")}</p>
      <div className="App-formgroup">
        <label htmlFor={`${uid}-url`}>{t(locale, "feedUrl")}</label>
        <input
          id={`${uid}-url`}
          className="Feeds-input"
          type="url"
          inputMode="url"
          required
          placeholder="https://feeds.bbci.co.uk/news/rss.xml"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <div className="App-formgroup">
        <label htmlFor={`${uid}-name`}>{t(locale, "name")}</label>
        <input
          id={`${uid}-name`}
          className="Feeds-input"
          placeholder={t(locale, "optionalFeedName")}
          maxLength={40}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="App-formgroup">
        <label htmlFor={`${uid}-colour`}>{t(locale, "colour")}</label>
        <input id={`${uid}-colour`} type="color" value={colour} onChange={e => setColour(e.target.value)} />
      </div>
      <div className="App-formgroup">
        <span className="Feeds-spacer" />
        <button type="submit" disabled={status.state === "loading"}>{t(locale, "addFeed")}</button>
      </div>
      <Status {...status} locale={locale} />
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
  const uid = useId();
  const [fields, setFields] = useState(emptyDorkFields);
  const [manualQuery, setManualQuery] = useState(/** @type {string?} */(null));
  const [name, setName] = useState("");
  const [colour, setColour] = useState(defaultColour);
  const [status, setStatus] = useState(/** @type {{ state: "idle"|"loading"|"error"|"success", message?: string }} */({ state: "idle" }));

  const builtQuery = buildDorkQuery(fields);
  const query = (manualQuery ?? builtQuery).trim();

  /**
   * @param {Partial<import('../customSources.js').DorkFields>} patch
   */
  function update(patch) {
    setFields(f => ({ ...f, ...patch }));
  }

  /**
   * @param {import('react').FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!query) {
      setStatus({ state: "error", message: t(locale, "enterSearch") });
      return;
    }

    setStatus({ state: "loading" });
    try {
      const result = await searchNews({ query, edition });
      if (result.articles.length === 0) {
        setStatus({ state: "error", message: t(locale, "noSearchResults") });
        return;
      }
      const finalName = name.trim() || query.slice(0, 40);
      onAdd({ id: createSourceId("search"), type: "search", name: finalName, query, color: colour });
      setStatus({ state: "success", message: locale === "tr" ? `“${finalName}” ${result.articles.length} haberle eklendi.` : `Added "${finalName}" with ${result.articles.length} articles.` });
      setFields(emptyDorkFields);
      setManualQuery(null);
      setName("");
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : t(locale, "searchError") });
    }
  }

  /**
   * @param {keyof import('../customSources.js').DorkFields} key
   * @param {string} label
   * @param {string} placeholder
   * @param {string} [help]
   */
  function field(key, label, placeholder, help) {
    const id = `${uid}-${key}`;
    return (
      <div className="App-formgroup">
        <label htmlFor={id}>{label}</label>
        <div className="Feeds-field">
          <input
            id={id}
            className="Feeds-input"
            placeholder={placeholder}
            value={fields[key]}
            aria-describedby={help ? `${id}-help` : undefined}
            onChange={e => update({ [key]: e.target.value })}
          />
          {help && <span id={`${id}-help`} className="Feeds-help">{help}</span>}
        </div>
      </div>
    );
  }

  return (
    <form
      id="panel-search"
      role="tabpanel"
      aria-labelledby="tab-search"
      onSubmit={handleSubmit}
      className="Feeds-form"
    >
      <p className="Feeds-hint">
        {t(locale, "addGoogleSearchDescription")} <strong>{editionName}</strong>.
      </p>

      <fieldset className="Feeds-fieldset" disabled={manualQuery !== null}>
        <legend>{t(locale, "queryBuilder")}</legend>
        {field("allWords", t(locale, "allWords"), "climate summit")}
        {field("exactPhrase", t(locale, "exactPhrase"), "artificial intelligence")}
        {field("anyWords", t(locale, "anyWords"), "nvidia, amd, intel", t(locale, "combinedWithOr"))}
        {field("excludeWords", t(locale, "exclude"), "rumour, opinion", t(locale, "prefixedWith"))}
        {field("sites", t(locale, "onlySites"), "reuters.com, bbc.co.uk", t(locale, "siteOperator"))}
        {field("excludeSites", t(locale, "excludeSites"), "example.com", "-site:")}
        {field("inTitle", t(locale, "inHeadline"), "election", t(locale, "inTitleOperator"))}
        {field("inUrl", t(locale, "inUrl"), "politics", t(locale, "inUrlOperator"))}
        <div className="App-formgroup">
          <label htmlFor={`${uid}-when`}>{t(locale, "timeRange")}</label>
          <select id={`${uid}-when`} value={fields.when} onChange={e => update({ when: e.target.value })}>
            {whenOptions.map(o => <option key={o.value} value={o.value}>{t(locale, ({ "": "anyTime", "1h": "pastHour", "12h": "past12Hours", "1d": "past24Hours", "7d": "pastWeek", "30d": "pastMonth", "1y": "pastYear" })[o.value])}</option>)}
          </select>
        </div>
        {!fields.when &&
          <div className="App-formgroup">
            <label htmlFor={`${uid}-after`}>{t(locale, "dateRange")}</label>
            <div className="Feeds-dates">
              <input id={`${uid}-after`} type="date" aria-label={t(locale, "afterDate")} value={fields.after} onChange={e => update({ after: e.target.value })} />
              <span aria-hidden="true">{locale === "tr" ? "ile" : "to"}</span>
              <input type="date" aria-label={t(locale, "beforeDate")} value={fields.before} onChange={e => update({ before: e.target.value })} />
            </div>
          </div>
        }
      </fieldset>

      <div className="App-formgroup">
        <label htmlFor={`${uid}-query`}>{t(locale, "query")}</label>
        <div className="Feeds-field">
          <textarea
            id={`${uid}-query`}
            className="Feeds-input Feeds-query"
            rows={2}
            spellCheck={false}
            placeholder={'"exact phrase" site:reuters.com -opinion when:7d'}
            value={manualQuery ?? builtQuery}
            onChange={e => setManualQuery(e.target.value)}
          />
          <span className="Feeds-help">
            {manualQuery !== null ?
              <>{t(locale, "editingManually")} <button type="button" className="btn-link" onClick={() => setManualQuery(null)}>{t(locale, "backToBuilder")}</button></> :
              t(locale, "generatedQuery")}
            {query && <>{' '}<a href={getGoogleNewsSearchUrl(query, edition)} target="_blank" rel="noopener noreferrer">{t(locale, "previewGoogle")}</a></>}
          </span>
        </div>
      </div>
      <div className="App-formgroup">
        <label htmlFor={`${uid}-name`}>{t(locale, "name")}</label>
        <input
          id={`${uid}-name`}
          className="Feeds-input"
          placeholder={t(locale, "optionalQueryName")}
          maxLength={40}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="App-formgroup">
        <label htmlFor={`${uid}-colour`}>{t(locale, "colour")}</label>
        <input id={`${uid}-colour`} type="color" value={colour} onChange={e => setColour(e.target.value)} />
      </div>
      <div className="App-formgroup">
        <span className="Feeds-spacer" />
        <button type="submit" disabled={status.state === "loading"}>{t(locale, "addSearch")}</button>
      </div>
      <Status {...status} locale={locale} />
    </form>
  );
}
