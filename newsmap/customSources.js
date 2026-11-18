/**
 * @typedef CustomSource
 * @prop {string} id
 * @prop {"rss"|"search"} type
 * @prop {string} name
 * @prop {string} color Hex colour #RRGGBB
 * @prop {string} [url] RSS/Atom URL (type "rss")
 * @prop {string} [query] Google News search query (type "search")
 */

/**
 * @typedef DorkFields
 * @prop {string} allWords
 * @prop {string} exactPhrase
 * @prop {string} anyWords
 * @prop {string} excludeWords
 * @prop {string} sites
 * @prop {string} excludeSites
 * @prop {string} inTitle
 * @prop {string} inUrl
 * @prop {string} when
 * @prop {string} after
 * @prop {string} before
 */

/** @type {DorkFields} */
export const emptyDorkFields = {
  allWords: "",
  exactPhrase: "",
  anyWords: "",
  excludeWords: "",
  sites: "",
  excludeSites: "",
  inTitle: "",
  inUrl: "",
  when: "",
  after: "",
  before: "",
};

export const whenOptions = [
  { value: "", label: "Any time" },
  { value: "1h", label: "Past hour" },
  { value: "12h", label: "Past 12 hours" },
  { value: "1d", label: "Past 24 hours" },
  { value: "7d", label: "Past week" },
  { value: "30d", label: "Past month" },
  { value: "1y", label: "Past year" },
];

// Chosen to stay distinguishable from the built-in category palettes
const sourcePalette = [
  "#d35400", "#00838f", "#7c8a1f", "#5d6d7e", "#ad1457",
  "#795548", "#00695c", "#b8860b", "#4a5fa8", "#8d3b72",
];

/**
 * @param {number} index
 */
export function pickColour(index) {
  return sourcePalette[index % sourcePalette.length];
}

/**
 * @param {"rss"|"search"} type
 */
export function createSourceId(type) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${type}-${Date.now().toString(36)}${random}`;
}

/**
 * @param {string} value
 */
function splitTerms(value) {
  return value
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * @param {string} value
 */
function splitList(value) {
  return value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * @param {string} term
 */
function quoteIfNeeded(term) {
  return /\s/.test(term) ? `"${term.replace(/"/g, "")}"` : term;
}

/**
 * Builds a Google News search "dork" from structured fields.
 * @param {DorkFields} f
 */
export function buildDorkQuery(f) {
  const parts = [];

  parts.push(...splitTerms(f.allWords));

  if (f.exactPhrase.trim()) {
    parts.push(`"${f.exactPhrase.trim().replace(/"/g, "")}"`);
  }

  const anyWords = splitTerms(f.anyWords);
  if (anyWords.length === 1) parts.push(anyWords[0]);
  if (anyWords.length > 1) parts.push(`(${anyWords.join(" OR ")})`);

  for (const word of splitTerms(f.excludeWords)) {
    parts.push(`-${word.replace(/^-/, "")}`);
  }

  const sites = splitList(f.sites).map(s => `site:${s.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`);
  if (sites.length === 1) parts.push(sites[0]);
  if (sites.length > 1) parts.push(`(${sites.join(" OR ")})`);

  for (const site of splitList(f.excludeSites)) {
    parts.push(`-site:${site.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`);
  }

  for (const term of splitList(f.inTitle)) {
    parts.push(`intitle:${quoteIfNeeded(term)}`);
  }

  for (const term of splitList(f.inUrl)) {
    parts.push(`inurl:${quoteIfNeeded(term)}`);
  }

  if (f.when) {
    parts.push(`when:${f.when}`);
  } else {
    if (f.after) parts.push(`after:${f.after}`);
    if (f.before) parts.push(`before:${f.before}`);
  }

  return parts.join(" ");
}

/**
 * Drops selected category ids that no longer have a backing source.
 * @param {string[]} selected
 * @param {string[]} builtIn
 * @param {{ [id: string]: CustomSource }} customSources
 */
export function getActiveCategories(selected, builtIn, customSources) {
  return selected.filter(id => builtIn.includes(id) || customSources[id]);
}
