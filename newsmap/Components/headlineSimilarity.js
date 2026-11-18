const ignoredTerms = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with',
  'bir', 'bu', 'da', 'de', 'diye', 'en', 'icin', 'ile', 've', 'veya', 'ya',
])

/**
 * Finds near-identical headlines without clustering short generic headlines.
 * @param {string} headline
 */
function headlineTokens(headline) {
  return new Set(
    headline
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter(term => term.length > 1 && !ignoredTerms.has(term)) || [],
  )
}

/**
 * @param {string} first
 * @param {string} second
 */
export function headlinesMatch(first, second) {
  const firstTokens = headlineTokens(first)
  const secondTokens = headlineTokens(second)
  if (firstTokens.size < 4 || secondTokens.size < 4) return false

  let shared = 0
  for (const token of firstTokens) {
    if (secondTokens.has(token)) shared++
  }

  const similarity = shared / (firstTokens.size + secondTokens.size - shared)
  return similarity >= 0.84
}
