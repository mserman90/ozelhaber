import { FeedFetchError, fetchPublicFeed } from '@/lib/safe-fetch'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url')?.trim()
  if (!url || url.length > 2048) {
    return Response.json({ error: 'A valid "url" parameter is required' }, { status: 400 })
  }

  try {
    const xml = await fetchPublicFeed(url)
    return new Response(xml, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (error) {
    if (error instanceof FeedFetchError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    console.error('[feed] unexpected error', error)
    return Response.json({ error: 'Failed to load feed' }, { status: 500 })
  }
}
