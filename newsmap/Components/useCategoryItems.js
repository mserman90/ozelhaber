import { useContext, useEffect, useRef, useState } from 'react';
import { getCustomFeed, getNews, searchNews } from '../sources/GoogleNewsRSS.js';
import { ucfirst } from '../util.js';
import { SearchContext } from '../SearchContext.js';
import { isSearchMatching } from '../isSearchMatching.js';
import { headlinesMatch } from './headlineSimilarity.js';
import { getOfflineCategory, saveOfflineCategory } from '../offlineCache';
import { notifyNewKeywordMatches } from './notifyNewKeywordMatches.js';

/**
 * @typedef {import('../types').Category} Category
 * @typedef {import('../types').Article} Article
 */

/**
 * @param {string[]} categories
 * @param {number} refreshTime
 * @param {string} edition
 * @param {number} itemsPerCategory
 * @param {"time"|"sourceCount"|"source_count"|"sources"|"position"} weightMode
 * @param {{ [id: string]: import('../customSources.js').CustomSource }} customSources
 * @param {boolean} clusterDuplicates
 * @param {string} notificationKeywords
 * @param {boolean} notificationsEnabled
 */
export function useCategoryItems(categories, refreshTime, edition, itemsPerCategory, weightMode = "time", customSources = {}, clusterDuplicates = false, notificationKeywords = "", notificationsEnabled = false) {

    const [categoryData, setCategoryData] = useState(/** @type {{ [id: string]: Category }} */({}));
    const loaderRef = useRef(/** @type {((cancellable: { current: boolean; }) => void)?} */(null));
    const inFlightRef = useRef(/** @type {Set<string>} */(new Set()));

    // Rebind function with current props
    loaderRef.current = (cancellable) => loadStaleCategories(cancellable);

    /**
     * @param {{ current: boolean; }} [cancellable]
     */
    async function loadStaleCategories(cancellable) {
        const now = Date.now();

        const todoList = categories.filter(id => {
            if (inFlightRef.current.has(id)) return false;
            const cat = categoryData[id];
            if (!cat) return true;
            return (cat.loadedAt + refreshTime) < now;
        });

        if (todoList.length === 0) {
            return;
        }

        for (const id of todoList) inFlightRef.current.add(id);

        const results = await Promise.allSettled(
            todoList.map(id => fetchCategory(id).then(({ articles, title }) => ({
                id,
                key: `${edition}_${id}`,
                name: customSources[id]?.name || title,
                articles,
                loadedAt: now,
            })))
        );

        for (const id of todoList) inFlightRef.current.delete(id);

        const loadedCategories = await Promise.all(results.map(async (result, i) => {
            const id = todoList[i];
            if (result.status === "fulfilled") {
                const cacheKey = `${edition}_${id}`
                if (notificationsEnabled && notificationKeywords.trim() && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    try {
                        const previous = await getOfflineCategory(cacheKey)
                        if (previous) {
                            await notifyNewKeywordMatches(
                                result.value.articles,
                                new Set(previous.articles.map(article => article.id)),
                                notificationKeywords,
                            )
                        }
                    } catch {
                        // Notification storage is optional; normal feed rendering continues.
                    }
                }
                try {
                    await saveOfflineCategory(cacheKey, result.value)
                } catch {
                    // Offline storage is an enhancement; a successful fetch remains usable.
                }
                return result.value
            }

            console.warn(`Failed to load "${customSources[id]?.name || id}":`, result.reason);
            try {
                const cached = await getOfflineCategory(`${edition}_${id}`);
                if (cached) return { ...cached, loadedAt: now, offline: true };
            } catch {
                // Continue with the empty state if browser storage is unavailable.
            }

            // Mark as loaded so a broken feed waits for the next refresh instead
            // of being retried every few seconds.
            return {
                id,
                key: `${edition}_${id}`,
                name: customSources[id]?.name || ucfirst(id),
                articles: [],
                loadedAt: now,
                error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            };
        }));

        if (!cancellable || cancellable.current) {
            setCategoryData(categoryData => {
                const newCategoryData = { ...categoryData };
                for (const cat of loadedCategories) {
                    newCategoryData[cat.id] = cat;
                }
                return newCategoryData;
            });
        }
    }

    /**
     * @param {string} id
     * @returns {Promise<{ title: string, articles: Article[] }>}
     */
    function fetchCategory(id) {
        const source = customSources[id];
        if (source?.type === "rss") {
            return getCustomFeed({ url: source.url });
        }
        if (source?.type === "search") {
            return searchNews({ query: source.query, edition });
        }
        return getNews({ category: id, edition });
    }

    useEffect(() => {
        if (loaderRef.current) {
            let cancellable = { current: true };

            loaderRef.current(cancellable);

            return () => { cancellable.current = false; };
        }
    }, [edition, categories]);

    useEffect(() => {
        let cancellable = { current: true };

        // Every 10 seconds check for stale categories with current function
        const id = setInterval(() => {
            if (loaderRef.current) {
                loaderRef.current(cancellable);
            }
        }, 10 * 1000);

        return () => { clearInterval(id); cancellable.current = false; };
    }, []);

    /** @type {Category[]} */
    const loadedCategories = categories.map(categoryID =>
        categoryData[categoryID] ||
        // Dummy category while it loads
        {
            id: categoryID,
            key: `${edition}_${categoryID}`,
            name: customSources[categoryID]?.name || ucfirst(categoryID),
            articles: [],
            loadedAt: 0,

        }
    );

    const now = Date.now();

    /**
     * @type {{ [type: string]: (article: Article, index: number) => number }}
     */
    const weightingFns = {
        "time": a => 1 / Math.max(1000, (now - +new Date(a.publishedAt)) || 1000),
        "sourceCount": a => a.sources.length,
        "sources": (a, i) => a.sources.length / (i + 1),
        "position": (_, i) => 1 / (i + 1),
    };

    const weight = weightingFns[weightMode] || weightingFns["time"];

    const searchValue = useContext(SearchContext);

    let items = loadedCategories.map(c => {
        let articles = c.articles.map((a, i) => ({ ...a, weight: weight(a, i), category: c.id }));

        if (searchValue.mode === "filter") {
            articles = articles.filter(item => isSearchMatching(searchValue, item));
        }

        articles.sort((a, b) => b.weight - a.weight);

        if (articles.length > itemsPerCategory) {
            articles.length = itemsPerCategory;
        }

        return {
            ...c,
            articles,
            weight: articles.reduce((t, a) => t + a.weight, 0),
        };
    });

    // Reserve dummy space for loading categories
    const loadedItems = items.filter(it => it.loadedAt);
    if (loadedItems.length > 0 && loadedItems.length < items.length) {
        const averageWeight = loadedItems.reduce((sum, it) => sum + it.weight, 0) / loadedItems.length;
        for (const item of items) {
            if (item.loadedAt == 0 && item.weight === 0) item.weight = averageWeight;
        }
    }

    items.sort((a, b) => b.weight - a.weight);

    if (clusterDuplicates) {
        const representatives = [];
        for (const category of items) {
            category.articles = category.articles.filter(article => {
                const duplicate = representatives.find(candidate => headlinesMatch(candidate.title, article.title));
                if (!duplicate) {
                    representatives.push(article);
                    return true;
                }

                const knownUrls = new Set(duplicate.sources.map(source => source.url));
                duplicate.sources = [
                    ...duplicate.sources,
                    ...article.sources.filter(source => !knownUrls.has(source.url)),
                ];
                duplicate.clusterCount = (duplicate.clusterCount || 0) + 1;
                return false;
            });
            category.weight = category.articles.reduce((total, article) => total + article.weight, 0);
        }
    }

    return items;
}
