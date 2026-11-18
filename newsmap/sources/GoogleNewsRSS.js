import { ucfirst, urlize } from '../util';

import editions from '../data/editions.json';
import oldEditions from '../data/oldEditions.json';
import { getEnv } from '../env';

function apiRoot() {
    return getEnv()['API_ROOT'] || (window.location.origin + "/api");
}

/** @type {Map<string, Promise<{ [category: string]: string }>>} */
const editionUrlCache = new Map();

/**
 * @param {object} options
 * @param {string} options.category
 * @param {string} options.edition
 */
export async function getNews(options) {
    const urls = await getEditionUrls(options.edition);
    const path = urls[options.category.toLowerCase()];

    if (!path) {
        throw Error("Can't find URL for edition/category");
    }

    const doc = await xmlFetch(`${apiRoot()}/rss/topics${path}`);
    const { title, articles } = parseFeed(doc, { googleSources: true });

    return {
        title: title || ucfirst(options.category),
        category: options.category,
        articles,
    };
}

/**
 * Google News search feed. Supports the same operators as the Google News
 * search box, e.g. `"exact phrase" site:bbc.co.uk intitle:election -sport when:7d`.
 *
 * @param {object} options
 * @param {string} options.query
 * @param {string} options.edition Used for language/region (hl, gl, ceid)
 */
export async function searchNews(options) {
    const urls = await getEditionUrls(options.edition);
    const params = new URLSearchParams(getLocaleQuery(urls));
    params.set("q", options.query);

    const doc = await xmlFetch(`${apiRoot()}/rss/search?${params}`);
    const { articles } = parseFeed(doc, { googleSources: true });

    return { title: options.query, articles };
}

/**
 * Any user-supplied RSS 2.0, RSS 1.0 (RDF) or Atom feed, fetched through the
 * server-side proxy.
 *
 * @param {object} options
 * @param {string} options.url
 */
export async function getCustomFeed(options) {
    const doc = await xmlFetch(`${apiRoot()}/feed?url=${encodeURIComponent(options.url)}`);
    let fallbackSource = "";
    try {
        fallbackSource = new URL(options.url).hostname.replace(/^www\./, "");
    } catch (e) { /* ignore */ }

    return parseFeed(doc, { googleSources: false, fallbackSource });
}

/**
 * @param {string} edition
 */
export function getGoogleNewsSearchUrl(query, edition) {
    const params = new URLSearchParams();
    params.set("q", query);
    const [, locale] = editionHint(edition);
    if (locale) {
        for (const [k, v] of new URLSearchParams(locale)) params.set(k, v);
    }
    return `https://news.google.com/search?${params}`;
}

/** Synchronous best-effort locale for building outbound links. */
function editionHint(edition) {
    const [country, lang] = resolveEdition(edition).split("_");
    if (!country || !lang) return [edition, ""];
    const hl = lang.includes("-") ? lang : `${lang}-${country}`;
    return [edition, `hl=${hl}&gl=${country}&ceid=${country}:${lang}`];
}

/**
 * @param {string} ed
 */
function resolveEdition(ed) {
    if (findEdition(ed)) return ed;

    if (oldEditions[ed] && findEdition(oldEditions[ed].value)) {
        return oldEditions[ed].value;
    }

    console.error("Can't find edition " + ed);
    return "GB_en";
}

/**
 * @param {string} edition
 */
function getEditionUrls(edition) {
    const ed = resolveEdition(edition);
    let promise = editionUrlCache.get(ed);
    if (!promise) {
        promise = fetch(`/editions/${ed}.json`).then(r => {
            if (!r.ok) throw Error(`Can't load edition ${ed}`);
            return r.json();
        });
        promise.catch(() => editionUrlCache.delete(ed));
        editionUrlCache.set(ed, promise);
    }
    return promise;
}

/**
 * Topic URLs look like `/CAAq...?ceid=GB:en&hl=en-GB&gl=GB`; reuse their
 * locale params for search requests.
 * @param {{ [category: string]: string }} urls
 */
function getLocaleQuery(urls) {
    const sample = Object.values(urls)[0] || "";
    return sample.split("?")[1] || "";
}

/**
 * @param {Element | Document} parent
 * @param {string[]} tagNames
 */
function firstText(parent, tagNames) {
    for (const tag of tagNames) {
        const el = parent.getElementsByTagName(tag)[0];
        const text = el && (el.textContent || "").trim();
        if (text) return text;
    }
    return "";
}

/**
 * @param {string} url
 */
function safeHttpUrl(url) {
    try {
        const parsed = new URL(url, "https://invalid.local");
        if ((parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname !== "invalid.local") {
            return parsed.href;
        }
    } catch (e) { /* ignore */ }
    return "";
}

/**
 * @param {Element} itemEl
 */
function getItemLink(itemEl) {
    const links = Array.from(itemEl.getElementsByTagName("link"));
    // Atom: <link rel="alternate" href="..."/>
    const atomLink = links.find(l => l.getAttribute("href") && (!l.getAttribute("rel") || l.getAttribute("rel") === "alternate"));
    if (atomLink) return atomLink.getAttribute("href") || "";
    // RSS: <link>https://...</link>
    const rssLink = links.find(l => (l.textContent || "").trim());
    if (rssLink) return (rssLink.textContent || "").trim();
    // Some feeds only provide a permalink guid
    const guid = itemEl.getElementsByTagName("guid")[0];
    return guid && guid.getAttribute("isPermaLink") !== "false" ? (guid.textContent || "").trim() : "";
}

/**
 * @param {Element} itemEl
 */
function getItemImage(itemEl) {
    for (const tag of ["media:content", "media:thumbnail"]) {
        const el = itemEl.getElementsByTagName(tag)[0];
        const url = el && el.getAttribute("url");
        if (url) return url;
    }
    const enclosure = Array.from(itemEl.getElementsByTagName("enclosure"))
        .find(e => (e.getAttribute("type") || "").startsWith("image/"));
    return enclosure ? enclosure.getAttribute("url") || "" : "";
}

/**
 * Parses RSS 2.0, RSS 1.0 (RDF) and Atom documents into NewsMap articles.
 *
 * @param {Document} doc
 * @param {object} options
 * @param {boolean} options.googleSources Parse Google News' grouped sources from item descriptions
 * @param {string} [options.fallbackSource]
 */
export function parseFeed(doc, { googleSources, fallbackSource = "" }) {
    const root = doc.getElementsByTagName("channel")[0] || doc.documentElement;
    const titleEl = Array.from(root.childNodes).find(n => n.nodeName === "title");
    const feedTitle = titleEl ? (titleEl.textContent || "").trim() : "";
    const [title] = feedTitle.split(" - ");

    const defaultSource = fallbackSource || feedTitle;
    const fetchedAt = new Date().toISOString();
    const seen = new Set();

    let itemEls = Array.from(doc.getElementsByTagName("item"));
    if (itemEls.length === 0) {
        itemEls = Array.from(doc.getElementsByTagName("entry"));
    }

    const articles = itemEls
        .map(itemEl => {
            let title = decodeHtml(firstText(itemEl, ["title"]));
            const url = safeHttpUrl(getItemLink(itemEl));
            const id = firstText(itemEl, ["guid", "id"]) || url || title;

            const sourceNameEl = itemEl.getElementsByTagName("source")[0];
            const sourceName = (sourceNameEl && (sourceNameEl.textContent || "").trim()) || defaultSource;

            const sourceTail = ` - ${sourceName}`;
            if (sourceName && title.endsWith(sourceTail)) {
                title = title.substring(0, title.length - sourceTail.length);
            }

            const rawDate = firstText(itemEl, ["pubDate", "published", "updated", "dc:date"]);
            const parsedDate = rawDate ? new Date(rawDate) : null;
            const publishedAt = parsedDate && !isNaN(+parsedDate) ? parsedDate.toISOString() : fetchedAt;

            const imageURL = safeHttpUrl(getItemImage(itemEl));

            let sources = [];
            const descEl = itemEl.getElementsByTagName("description")[0];

            if (googleSources && descEl) {
                const desc = decodeHtml(descEl.textContent || "");
                const descDoc = (new DOMParser()).parseFromString(desc, "text/html");

                sources = Array.from(descDoc.getElementsByTagName("li"))
                    .map(liEl => {
                        const nameEl = liEl.getElementsByTagName("font")[0];
                        const name = nameEl ? nameEl.textContent || "" : "";

                        const aEl = liEl.getElementsByTagName("a")[0];
                        let title = aEl ? aEl.textContent || "" : "";
                        const url = aEl ? safeHttpUrl(aEl.getAttribute("href") || "") : "";

                        const sourceTail = ` - ${name}`;
                        if (title.endsWith(sourceTail)) {
                            title = title.substring(0, title.length - sourceTail.length);
                        }

                        return { id: urlize(name), name, title, url };
                    }).filter(s => s.name && s.url);
            }

            if (sources.length === 0) {
                sources = [{
                    id: urlize(sourceName),
                    name: sourceName,
                    title,
                    url,
                }];
            }

            return {
                id,
                title,
                url,
                publishedAt,
                sources,
                imageURL,
            };
        })
        .filter(article => {
            if (!article.title || !article.url || seen.has(article.id)) return false;
            seen.add(article.id);
            return true;
        });

    return { title, articles };
}

/**
 * @param {string} url
 * @returns {Promise<Document>}
 */
async function xmlFetch(url) {
    // Clearing out Accept-Language stops Google's servers from redirecting to a different language
    const headers = new Headers({ "Accept-Language": "" });
    const response = await fetch(url, { headers });
    const text = await response.text();

    if (!response.ok) {
        let message = `Request failed (HTTP ${response.status})`;
        try {
            message = JSON.parse(text).error || message;
        } catch (e) { /* not JSON */ }
        throw Error(message);
    }

    const doc = (new DOMParser()).parseFromString(text, "text/xml");
    if (doc.getElementsByTagName("parsererror").length > 0) {
        throw Error("The feed could not be parsed as XML");
    }
    return doc;
}

/**
 * @param {string} edition
 */
function findEdition(edition) {
    return editions.find(e => e.value === edition);
}

function decodeHtml(str) {
    var map =
    {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}
