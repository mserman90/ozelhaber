export const runtime = 'nodejs'

import { generateFreeAISummary } from '@/lib/free-ai'

interface SummaryRequest {
  title: string
  url?: string
  source?: string
  locale?: 'tr' | 'en'
}

export async function POST(request: Request) {
  try {
    const body: SummaryRequest = await request.json()
    const { title, source, locale = 'tr' } = body

    if (!title || typeof title !== 'string') {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    // Free zero-key AI execution
    const result = await generateFreeAISummary(title, source, locale)
    return Response.json(result)
  } catch (error) {
    console.error('[AI Summary] Error processing summary:', error)
    return Response.json({ error: 'Failed to process summary' }, { status: 500 })
  }
}
