'use client'

import { useEffect, useSyncExternalStore } from 'react'
import NewsMapRoot from './newsmap-root'

const subscribe = () => () => {}

// The app reads localStorage, window and DOMParser during construction,
// so it must only ever render in the browser.
export function NewsMapClient() {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined)
    }
  }, [])

  return isClient ? <NewsMapRoot /> : null
}
