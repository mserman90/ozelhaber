export const runtime = 'nodejs'

import { generateFreeAISummary } from '@/lib/free-ai'

interface SummaryRequest {
  title: string
  source?: string
  locale?: 'tr' | 'en'
}

const RATE_WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  const clientId = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const previous = requestCounts.get(clientId)
  if (previous && previous.resetAt > now && previous.count >= MAX_REQUESTS) {
    return Response.json({ error: 'Too many summary requests. Try again shortly.' }, { status: 429 })
  }
  requestCounts.set(clientId, previous && previous.resetAt > now
    ? { count: previous.count + 1, resetAt: previous.resetAt }
    : { count: 1, resetAt: now + RATE_WINDOW_MS })

  try {
    const body = await request.json() as Partial<SummaryRequest>
    if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.length > 400) {
      return Response.json({ error: 'A valid title is required (max 400 characters).' }, { status: 400 })
    }
    if (body.source !== undefined && (typeof body.source !== 'string' || body.source.length > 120)) {
      return Response.json({ error: 'Invalid source name.' }, { status: 400 })
    }
    const locale = body.locale === 'en' ? 'en' : 'tr'
    const result = await generateFreeAISummary(body.title.trim(), body.source?.slice(0, 120), locale)
    return Response.json(result, { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    console.error('[AI Summary] Error processing summary:', error)
    return Response.json({ error: 'Failed to process summary' }, { status: 500 })
  }
}
