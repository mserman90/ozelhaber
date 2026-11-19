import type { Category } from './types'

const DATABASE_NAME = 'newsmap-offline'
const DATABASE_VERSION = 1
const CATEGORY_STORE = 'categories'

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable'))

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(CATEGORY_STORE)) {
        database.createObjectStore(CATEGORY_STORE, { keyPath: 'cacheKey' })
      }
      if (!database.objectStoreNames.contains('notificationSeen')) {
        database.createObjectStore('notificationSeen', { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Could not open offline cache'))
  })
}

export async function saveOfflineCategory(cacheKey: string, category: Category) {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(CATEGORY_STORE, 'readwrite')
    transaction.objectStore(CATEGORY_STORE).put({ cacheKey, category, savedAt: Date.now() })
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error || new Error('Could not save offline news'))
  })
  database.close()
}

export async function getOfflineCategory(cacheKey: string): Promise<Category | null> {
  const database = await openDatabase()
  const result = await new Promise<{ category: Category } | undefined>((resolve, reject) => {
    const request = database.transaction(CATEGORY_STORE, 'readonly').objectStore(CATEGORY_STORE).get(cacheKey)
    request.onsuccess = () => resolve(request.result as { category: Category } | undefined)
    request.onerror = () => reject(request.error || new Error('Could not read offline news'))
  })
  database.close()
  return result?.category || null
}

export async function wasNotificationSeen(id: string) {
  const database = await openDatabase()
  const request = database.transaction('notificationSeen', 'readonly').objectStore('notificationSeen').get(id)
  const result = await new Promise<boolean>((resolve, reject) => {
    request.onsuccess = () => resolve(Boolean(request.result))
    request.onerror = () => reject(request.error || new Error('Could not read notification cache'))
  })
  database.close()
  return result
}

export async function markNotificationSeen(id: string) {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('notificationSeen', 'readwrite')
    transaction.objectStore('notificationSeen').put({ id, seenAt: Date.now() })
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error || new Error('Could not save notification state'))
  })
  database.close()
}
