import { FEED_USER_AGENT } from '@/lib/safe-fetch'

const ALLOWED_ROOTS = new Set(['topics', 'search', 'headlines'])

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  if (!path?.length || !ALLOWED_ROOTS.has(path[0])) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { search } = new URL(request.url)
  const upstream = `https://news.google.com/rss/${path.map(encodeURIComponent).join('/')}${search}`

  try {
    const response = await fetch(upstream, {
      signal: AbortSignal.timeout(10_000),
      headers: { 'user-agent': FEED_USER_AGENT, 'accept-language': '' },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return Response.json(
        { error: `Google News responded with HTTP ${response.status}` },
        { status: 502 },
      )
    }

    return new Response(await response.text(), {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    })
  } catch {
    return Response.json({ error: 'Could not reach Google News' }, { status: 502 })
  }
}
