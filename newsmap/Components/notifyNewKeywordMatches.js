import { markNotificationSeen, wasNotificationSeen } from '../offlineCache'

/**
 * Sends local browser notifications for newly received keyword matches.
 * This does not use a push server and only runs while NewsMap is open.
 * @param {import('../types').Article[]} articles
 * @param {Set<string>} previouslyCachedIds
 * @param {string} rawKeywords
 */
export async function notifyNewKeywordMatches(articles, previouslyCachedIds, rawKeywords) {
  const keywords = rawKeywords
    .split(',')
    .map(keyword => keyword.trim().toLocaleLowerCase())
    .filter(keyword => keyword.length >= 2)
  if (keywords.length === 0) return

  for (const article of articles) {
    if (previouslyCachedIds.has(article.id)) continue
    const content = `${article.title} ${article.description || ''}`.toLocaleLowerCase()
    if (!keywords.some(keyword => content.includes(keyword))) continue

    let alreadySeen = false
    try {
      alreadySeen = await wasNotificationSeen(article.id)
      if (alreadySeen) continue
      await markNotificationSeen(article.id)
    } catch {
      // Avoid sending duplicate alerts if local notification state cannot be stored.
      continue
    }

    const options = {
      body: article.title,
      tag: `news-${article.id}`,
      icon: '/icon.svg',
      data: { url: article.url },
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready.catch(() => null)
      if (registration) {
        await registration.showNotification('NewsMap.JS', options)
        continue
      }
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('NewsMap.JS', options)
    }
  }
}
