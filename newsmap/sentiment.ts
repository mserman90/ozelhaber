import type { Article } from './types'

export type Sentiment = 'positive' | 'negative' | 'neutral'

const positiveTerms = new Set([
  'breakthrough', 'success', 'successful', 'win', 'wins', 'won', 'growth', 'record', 'recovery', 'improve', 'improved', 'positive', 'hope', 'deal', 'agreement', 'peace', 'launch', 'approved', 'surge', 'gain',
  'basari', 'basarili', 'kazandi', 'buyume', 'rekor', 'iyilesme', 'olumlu', 'umut', 'anlasma', 'baris', 'onaylandi', 'artis', 'yukselis', 'mujde',
])
const negativeTerms = new Set([
  'crisis', 'crash', 'death', 'dead', 'killed', 'war', 'attack', 'violence', 'disaster', 'loss', 'losses', 'decline', 'fall', 'failed', 'failure', 'warning', 'threat', 'danger', 'lawsuit', 'scandal', 'fraud', 'injured', 'cuts',
  'kriz', 'cokus', 'olum', 'oldu', 'olduruldu', 'savas', 'saldiri', 'siddet', 'felaket', 'kayip', 'dusus', 'basarisiz', 'uyari', 'tehdit', 'tehlike', 'skandal', 'sorusturma', 'yarali', 'zam',
])

export function analyzeSentiment(article: Pick<Article, 'title' | 'description'>): Sentiment {
  const tokens = `${article.title} ${article.description || ''}`
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[\p{L}\p{N}]+/gu) || []

  let score = 0
  for (const token of tokens) {
    if (positiveTerms.has(token)) score += 1
    if (negativeTerms.has(token)) score -= 1
  }

  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
}
