const SHELL_CACHE = 'newsmap-shell-v1'
const FEED_CACHE = 'newsmap-feeds-v1'
const SHELL_FILES = ['/', '/icon.svg', '/manifest.webmanifest']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_FILES))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('newsmap-') && ![SHELL_CACHE, FEED_CACHE].includes(key))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = event.notification.data && event.notification.data.url
  if (typeof target !== 'string') return
  let url
  try {
    url = new URL(target, self.location.origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return
  } catch {
    return
  }
  event.waitUntil(self.clients.openWindow(url.href))
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/api/rss/') || url.pathname === '/api/feed') {
    event.respondWith((async () => {
      const cache = await caches.open(FEED_CACHE)
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put(request, response.clone())
        return response
      } catch {
        return await cache.match(request) || new Response(
          JSON.stringify({ error: 'This feed is not available offline yet.' }),
          { status: 503, headers: { 'content-type': 'application/json' } },
        )
      }
    })())
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE)
          await cache.put('/', response.clone())
        }
        return response
      } catch {
        return await caches.match('/') || Response.error()
      }
    })())
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname === '/icon.svg' || url.pathname === '/manifest.webmanifest') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE)
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    })())
  }
})
