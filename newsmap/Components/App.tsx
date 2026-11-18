import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import Edition from './Edition'
import { ucfirst, luminance } from '../util.js'
import defaultColours, * as palettes from '../colours.js'
import editions from '../data/editions.json'
import availableCategories from '../data/categories.json'
import './App.css'
import { OptionsModal } from './OptionsModal.jsx'
import { SearchContext, defaultSearchContextValue } from '../SearchContext.js'
import { SearchOptionsModal } from './SearchOptionsModal.jsx'
import { ArticleSummaryModal } from './ArticleSummaryModal.jsx'
import { FeedsModal } from './FeedsModal.jsx'
import { getActiveCategories } from '../customSources.js'
import { translate as t } from '../i18n.js'
import type { Article, Category, CustomFeedSource, MapMode, SearchFilter, WeightingMode } from '../types'

type AppProps = { refreshTime?: number; donationLink?: string }
type AppState = {
  categories: Category[]
  selectedCategories: string[]
  selectedEditions: string[]
  mode: MapMode
  weightingMode: WeightingMode
  showImages: boolean
  showGradient: boolean
  sentimentHighlighting: boolean
  clusterDuplicates: boolean
  showOptions: boolean
  showSearchOptions: boolean
  headerTop: boolean
  palette: string
  itemsPerCategory: number
  newTab: boolean
  enableSourcesModal: boolean
  articleSummaryOnClick: boolean
  wakeLock: boolean
  searchValue: SearchFilter
  selectedArticle: Article | null
  customSources: Record<string, CustomFeedSource>
  showFeeds: boolean
  locale: 'en' | 'tr'
  theme: 'dark' | 'light' | 'oled'
}

const defaultRefreshTime = 10 * 60 * 1000

function createDefaultState(): AppState {
  return {
    categories: [],
    selectedCategories: [...availableCategories],
    selectedEditions: ['GB_en'],
    mode: 'tree',
    showImages: false,
    showGradient: true,
    sentimentHighlighting: false,
    clusterDuplicates: false,
    palette: 'default',
    showOptions: false,
    showSearchOptions: false,
    headerTop: false,
    itemsPerCategory: 10,
    newTab: true,
    enableSourcesModal: false,
    articleSummaryOnClick: true,
    wakeLock: false,
    weightingMode: 'time',
    searchValue: { ...defaultSearchContextValue },
    selectedArticle: null,
    customSources: {},
    showFeeds: false,
    locale: 'en',
    theme: 'dark',
  }
}

function getInitialState(): AppState {
  const defaults = createDefaultState()
  const saved = readSavedState()
  const query = getQueryState()
  return { ...defaults, ...saved, ...query }
}

function readSavedState(): Partial<AppState> {
  try {
    const raw = window.localStorage.getItem('state')
    return raw ? JSON.parse(raw) as Partial<AppState> : {}
  } catch {
    return {}
  }
}

export default function App({ refreshTime, donationLink }: AppProps) {
  const [state, setState] = useState<AppState>(getInitialState)
  const [shareFeedback, setShareFeedback] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const trackingTimeout = useRef<number | undefined>(undefined)

  const updateState = useCallback((patch: Partial<AppState>) => {
    setState(current => ({ ...current, ...patch }))
  }, [])

  const setSavedState = useCallback((patch: Partial<AppState>) => {
    const persisted = { ...state, ...patch }
    delete (persisted as Partial<AppState>).categories
    delete (persisted as Partial<AppState>).selectedArticle
    delete (persisted as Partial<AppState>).showOptions
    delete (persisted as Partial<AppState>).showSearchOptions
    delete (persisted as Partial<AppState>).showFeeds
    try {
      window.localStorage.setItem('state', JSON.stringify(persisted))
    } catch {
      // Storage can be unavailable in private browsing; app state still updates.
    }
    setState(current => ({ ...current, ...patch }))
  }, [state])

  const allCategoryIds = useMemo(
    () => [...availableCategories, ...Object.keys(state.customSources)],
    [state.customSources],
  )
  const activeCategories = useMemo(
    () => getActiveCategories(state.selectedCategories, availableCategories, state.customSources),
    [state.selectedCategories, state.customSources],
  )
  const colours = useMemo(() => {
    const result: Record<string, string> = { ...(palettes[state.palette as keyof typeof palettes] || defaultColours) }
    for (const source of Object.values(state.customSources)) result[source.id] = source.color
    return result
  }, [state.palette, state.customSources])

  const initialUrlState = useRef(true)
  const updatePage = useCallback((replace = false) => {
    const searchParams = new URLSearchParams()
    searchParams.set('edition', state.selectedEditions.join(','))
    searchParams.set('locale', state.locale)
    if (state.searchValue.enabled && state.searchValue.text) searchParams.set('q', state.searchValue.text)

    const shareState = {
      c: state.selectedCategories,
      m: state.mode,
      w: state.weightingMode,
      l: state.locale,
      t: state.theme,
      sf: state.searchValue,
      src: Object.values(state.customSources),
    }
    const serializedState = JSON.stringify(shareState)
    if (serializedState.length <= 6000) searchParams.set('d', serializedState)

    const query = searchParams.toString()
    const url = query ? `?${query}` : ''
    const historyState = { selectedEditions: state.selectedEditions, searchValue: state.searchValue }

    if (window.location.search === url || replace) {
      window.history.replaceState(historyState, '', url || window.location.pathname)
    } else {
      window.history.pushState(historyState, '', url || window.location.pathname)
    }

    const editionNames = editions
      .filter(edition => state.selectedEditions.includes(edition.value))
      .map(edition => edition.name)
      .join(', ')
    document.title = ['NewsMap.JS', editionNames, state.searchValue.enabled ? state.searchValue.text : '']
      .filter(Boolean)
      .join(' - ')
  }, [state.selectedEditions, state.selectedCategories, state.mode, state.weightingMode, state.locale, state.theme, state.searchValue, state.customSources])

  useEffect(() => {
    document.documentElement.lang = state.locale
    document.documentElement.dataset.theme = state.theme
  }, [state.locale, state.theme])

  useEffect(() => {
    updatePage(initialUrlState.current)
    initialUrlState.current = false
  }, [updatePage])

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state) {
        setState(current => ({ ...current, ...event.state }))
      } else {
        setState(current => ({ ...current, ...getQueryState() }))
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        updateState({ showOptions: false, showSearchOptions: false, showFeeds: false, selectedArticle: null })
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && state.wakeLock && !wakeLockRef.current) {
        requestWakeLock()
      }
    }

    window.addEventListener('popstate', onPopState)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag === 'function') {
      trackingTimeout.current = window.setInterval(() => gtag('event', 'refresh'), refreshTime || defaultRefreshTime)
    }

    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      if (trackingTimeout.current !== undefined) window.clearInterval(trackingTimeout.current)
    }
  }, [refreshTime, state.wakeLock, updateState])

  useEffect(() => {
    if (!state.wakeLock) {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
      return
    }
    requestWakeLock()
    return () => {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [state.wakeLock])

  function onResize() {
    setState(current => ({ ...current }))
  }

  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      updateState({ wakeLock: false })
    }
  }

  function onCategoryChange(event: ChangeEvent<HTMLInputElement>) {
    let selected = state.selectedCategories
    const { checked, value } = event.currentTarget
    if ((event.nativeEvent as unknown as MouseEvent<HTMLInputElement>).altKey) {
      selected = selected.length === 1 && selected[0] === value ? allCategoryIds : [value]
    } else if (checked) {
      selected = [...selected, value]
    } else {
      selected = selected.filter(category => category !== value)
    }
    setSavedState({ selectedCategories: selected })
  }

  function changeEditions(nextEditions: string[]) {
    setSavedState({ selectedEditions: nextEditions })
    updateState({ categories: [] })
  }

  function addCustomSource(source: CustomFeedSource) {
    setSavedState({
      customSources: { ...state.customSources, [source.id]: source },
      selectedCategories: [...state.selectedCategories, source.id],
    })
  }

  function removeCustomSource(id: string) {
    const { [id]: _removed, ...customSources } = state.customSources
    setSavedState({
      customSources,
      selectedCategories: state.selectedCategories.filter(category => category !== id),
    })
  }

  function toggleCustomSource(id: string, visible: boolean) {
    const selected = state.selectedCategories.filter(category => category !== id)
    setSavedState({ selectedCategories: visible ? [...selected, id] : selected })
  }

  function handleArticleClick(article: Article, event: MouseEvent<HTMLAnchorElement>) {
    if (!state.articleSummaryOnClick && !state.enableSourcesModal) return
    event.preventDefault()
    updateState({ selectedArticle: article })
  }

  async function shareMap() {
    const shareData = { title: document.title, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShareFeedback(t(state.locale, 'shareDone'))
      } else {
        await navigator.clipboard.writeText(shareData.url)
        setShareFeedback(t(state.locale, 'linkCopied'))
      }
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'AbortError') {
        setShareFeedback(t(state.locale, 'shareFailed'))
      }
    }
  }

  function renderHeader() {
    const { selectedCategories, wakeLock, searchValue, customSources, locale } = state
    const customCount = Object.keys(customSources).length

    return (
      <header className="App-header">
        <div className="App-header-config">
          <div className="App-header-config-topline">
            <h1 className="App-title" style={{ flex: 1 }}><a href="https://newsmap.ijmacd.com">NewsMap.JS</a></h1>
            <div className="App-header-controls">
              <button style={{ margin: 4 }} onClick={() => updateState({ showOptions: true })}>{t(locale, 'options')}</button>
              <button style={{ margin: 4 }} onClick={() => containerRef.current && requestFullscreen(containerRef.current)}>{t(locale, 'fullscreen')}</button>
              <button style={{ margin: 4, outline: searchValue.enabled ? '2px solid red' : undefined }} onClick={() => updateState({ showSearchOptions: true })}>{searchValue.enabled ? t(locale, 'searchActive') : t(locale, 'search')}</button>
              <button style={{ margin: 4 }} onClick={() => updateState({ showFeeds: true })}>{customCount ? `${t(locale, 'sources')} (${customCount})` : t(locale, 'sources')}</button>
              <button style={{ margin: 4 }} onClick={shareMap}>{t(locale, 'shareMap')}</button>
              <button
                style={{ margin: 4 }}
                lang={locale === 'en' ? 'tr' : 'en'}
                aria-label={`${t(locale, 'language')}: ${locale === 'en' ? 'Türkçe' : 'English'}`}
                onClick={() => setSavedState({ locale: locale === 'en' ? 'tr' : 'en' })}
              >{locale === 'en' ? 'TR' : 'EN'}</button>
            </div>
            {'wakeLock' in navigator && (
              <label style={{ margin: 4 }}>
                <input type="checkbox" checked={wakeLock} onChange={event => updateState({ wakeLock: event.currentTarget.checked })} /> {t(locale, 'keepScreenOn')}
              </label>
            )}
          </div>
          {shareFeedback && <p className="App-share-feedback" role="status" aria-live="polite">{shareFeedback}</p>}
          <p className="App-intro">
            {t(locale, 'intro')} <a href="https://news.google.com">Google News</a> {t(locale, 'andYourSources')}{' '}
            {t(locale, 'inspiredBy')} <a href="http://newsmap.jp">newsmap.jp</a>.{' '}
            {t(locale, 'forkMe')} <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
          </p>
        </div>
        <div className="App-category-chooser">
          {allCategoryIds.map(category => {
            const custom = customSources[category]
            const active = selectedCategories.includes(category)
            const backgroundColor = active ? colours[category] : '#777'
            const color = active ? (luminance(backgroundColor) > 128 ? '#111' : '#FFF') : '#555'
            return (
              <label
                key={category}
                className="App-category-key"
                style={{ backgroundColor, color }}
                title={custom ? (custom.type === 'rss' ? `RSS: ${custom.url}` : `Google News: ${custom.query}`) : undefined}
              >
                <input type="checkbox" checked={active} onChange={onCategoryChange} value={category} />
                {custom ? custom.name : t(locale, `categories.${category}`)}
              </label>
            )
          })}
        </div>
      </header>
    )
  }

  const showEditionName = state.selectedEditions.length > 1
  const showImages = false

  return (
    <div className={`App ${state.headerTop ? 'App-header-top' : 'App-header-bottom'}`}>
      {state.headerTop && renderHeader()}
      <SearchContext.Provider value={state.searchValue}>
        <div className="App-EditionContainer" ref={containerRef}>
          {state.selectedEditions.map(edition => (
            <div
              key={edition}
              style={{ height: showEditionName ? 'calc(100% - 1rem)' : '100%', flex: 1 }}
              className="App-Edition"
            >
              {showEditionName && <p style={{ color: 'white', margin: 0, fontWeight: 'bold', height: '1rem', fontSize: '0.8rem' }}>{findEdition(edition)?.name}</p>}
              <Edition
                edition={edition}
                mode={state.mode}
                showImages={showImages}
                showGradient={state.showGradient}
                sentimentHighlighting={state.sentimentHighlighting}
                clusterDuplicates={state.clusterDuplicates}
                colours={colours}
                categories={activeCategories}
                customSources={state.customSources}
                itemsPerCategory={state.itemsPerCategory}
                refreshTime={refreshTime || defaultRefreshTime}
                newTab={state.newTab}
                weightingMode={state.weightingMode}
                onArticleClick={handleArticleClick}
              />
            </div>
          ))}
          {state.selectedArticle && (
            <ArticleSummaryModal
              locale={state.locale}
              article={state.selectedArticle}
              newTab={state.newTab}
              onClose={() => updateState({ selectedArticle: null })}
            />
          )}
        </div>
      </SearchContext.Provider>
      {!state.headerTop && renderHeader()}
      {state.showOptions && (
        <OptionsModal
          locale={state.locale}
          selectedEditions={state.selectedEditions}
          mode={state.mode}
          weightingMode={state.weightingMode}
          headerTop={state.headerTop}
          showGradient={state.showGradient}
          sentimentHighlighting={state.sentimentHighlighting}
          clusterDuplicates={state.clusterDuplicates}
          articleSummaryOnClick={state.articleSummaryOnClick}
          theme={state.theme}
          itemsPerCategory={state.itemsPerCategory}
          newTab={state.newTab}
          enableSourcesModal={state.enableSourcesModal}
          selectedPalette={state.palette}
          onClose={() => updateState({ showOptions: false })}
          onEditionChange={changeEditions}
          setSavedState={setSavedState}
          donationLink={donationLink}
        />
      )}
      {state.showSearchOptions && (
        <SearchOptionsModal
          locale={state.locale}
          searchValue={state.searchValue}
          setSearchValue={searchValue => setSavedState({ searchValue })}
          onClose={() => updateState({ showSearchOptions: false })}
        />
      )}
      {state.showFeeds && (
        <FeedsModal
          locale={state.locale}
          customSources={state.customSources}
          selectedCategories={state.selectedCategories}
          edition={state.selectedEditions[0]}
          editionName={findEdition(state.selectedEditions[0])?.name || state.selectedEditions[0]}
          onAdd={addCustomSource}
          onRemove={removeCustomSource}
          onToggle={toggleCustomSource}
          onClose={() => updateState({ showFeeds: false })}
        />
      )}
    </div>
  )
}

function findEdition(id: string) {
  return editions.find(edition => edition.value === id)
}

function requestFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) void element.requestFullscreen()
}

function getQueryState(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search)
  const queryState: Partial<AppState> = {}
  const editionParam = params.get('edition')
  if (editionParam) {
    const selectedEditions = editionParam.split(',').filter(value => editions.some(edition => edition.value === value))
    if (selectedEditions.length) queryState.selectedEditions = selectedEditions
  }

  const data = params.get('d')
  if (data && data.length <= 6000) {
    try {
      const shared = JSON.parse(data) as Record<string, unknown>
      const sharedSources = Array.isArray(shared.src)
        ? shared.src.filter(isShareableSource)
        : []
      const sharedSourceMap = Object.fromEntries(sharedSources.map(source => [source.id, source]))

      if (Array.isArray(shared.c)) {
        queryState.selectedCategories = [...new Set(shared.c.filter((id): id is string =>
          typeof id === 'string' && (availableCategories.includes(id) || Boolean(sharedSourceMap[id])),
        ))]
      }
      if (sharedSources.length) queryState.customSources = sharedSourceMap
      if (shared.m === 'tree' || shared.m === 'grid' || shared.m === 'tree_mixed') queryState.mode = shared.m
      if (shared.w === 'time' || shared.w === 'sources' || shared.w === 'position' || shared.w === 'sourceCount') queryState.weightingMode = shared.w
      if (shared.l === 'en' || shared.l === 'tr') queryState.locale = shared.l
      if (shared.t === 'dark' || shared.t === 'light' || shared.t === 'oled') queryState.theme = shared.t

      if (shared.sf && typeof shared.sf === 'object') {
        const filter = shared.sf as Partial<SearchFilter>
        queryState.searchValue = {
          ...defaultSearchContextValue,
          text: typeof filter.text === 'string' ? filter.text.slice(0, 250) : '',
          enabled: typeof filter.enabled === 'boolean' ? filter.enabled : false,
          mode: filter.mode === 'filter' ? 'filter' : 'highlight',
          caseSensitive: Boolean(filter.caseSensitive),
          regex: Boolean(filter.regex),
          includeHeadline: typeof filter.includeHeadline === 'boolean' ? filter.includeHeadline : true,
          includeSource: typeof filter.includeSource === 'boolean' ? filter.includeSource : true,
        }
      }
    } catch {
      // Ignore malformed shared state and fall back to local preferences.
    }
  }

  const query = params.get('q')
  if (query) queryState.searchValue = { ...defaultSearchContextValue, ...(queryState.searchValue || {}), text: query.slice(0, 250), enabled: true }
  return queryState
}

function isShareableSource(value: unknown): value is CustomFeedSource {
  if (!value || typeof value !== 'object') return false
  const source = value as Partial<CustomFeedSource>
  if (typeof source.id !== 'string' || !/^(rss|search)-[a-z0-9]+$/i.test(source.id)) return false
  if (source.type !== 'rss' && source.type !== 'search') return false
  if (typeof source.name !== 'string' || source.name.length > 40) return false
  if (typeof source.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(source.color)) return false
  if (source.type === 'rss') {
    if (typeof source.url !== 'string' || source.url.length > 2048) return false
    try {
      const url = new URL(source.url)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  return typeof source.query === 'string' && source.query.length <= 300
}
