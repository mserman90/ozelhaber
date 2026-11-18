import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const MAX_BYTES = 3 * 1024 * 1024
const MAX_REDIRECTS = 3
const TIMEOUT_MS = 10_000

export const FEED_USER_AGENT =
  'Mozilla/5.0 (compatible; NewsMapJS/1.0; +https://newsmap.ijmacd.com)'

export class FeedFetchError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

function isPrivateIPv4(ip: string) {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateAddress(ip: string) {
  const version = isIP(ip)
  if (version === 4) return isPrivateIPv4(ip)
  if (version === 6) {
    const lower = ip.toLowerCase()
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPrivateIPv4(mapped[1])
    return (
      lower === '::' ||
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe8') ||
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb')
    )
  }
  return true
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new FeedFetchError('Only http and https feed URLs are supported')
  }
  if (url.username || url.password) {
    throw new FeedFetchError('Feed URLs with credentials are not allowed')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.internal')) {
    throw new FeedFetchError('Private network addresses are not allowed')
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true }).catch(() => {
        throw new FeedFetchError('Could not resolve the feed host', 502)
      })

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new FeedFetchError('Private network addresses are not allowed')
  }
}

async function readLimited(response: Response) {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      await reader.cancel()
      throw new FeedFetchError('Feed is too large (max 3 MB)', 413)
    }
    chunks.push(value)
  }

  const buffer = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  }

  const charset = response.headers.get('content-type')?.match(/charset=([^;]+)/i)?.[1]?.trim()
  try {
    return new TextDecoder(charset || 'utf-8').decode(buffer)
  } catch {
    return new TextDecoder('utf-8').decode(buffer)
  }
}

/**
 * Fetches a user-supplied feed URL while refusing private/internal targets
 * (checked again on every redirect hop) to prevent SSRF.
 */
export async function fetchPublicFeed(rawUrl: string) {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new FeedFetchError('Invalid feed URL')
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url)

    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': FEED_USER_AGENT,
        accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.5',
      },
    }).catch((error: unknown) => {
      const timedOut = error instanceof Error && error.name === 'TimeoutError'
      throw new FeedFetchError(timedOut ? 'Feed request timed out' : 'Could not reach the feed', 502)
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new FeedFetchError('Feed redirect is missing a location', 502)
      url = new URL(location, url)
      continue
    }

    if (!response.ok) {
      throw new FeedFetchError(`Feed responded with HTTP ${response.status}`, 502)
    }

    const text = await readLimited(response)
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(text.slice(0, 4096))) {
      throw new FeedFetchError('URL did not return an RSS or Atom feed', 422)
    }
    return text
  }

  throw new FeedFetchError('Too many redirects', 502)
}
