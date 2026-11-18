import type { Metadata } from 'next'
import { NewsMapClient } from '@/components/newsmap-client'
import editions from '@/newsmap/data/editions.json'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams
  const get = (key: string) => typeof params[key] === 'string' ? params[key] as string : ''
  const query = get('q').slice(0, 120)
  const editionIds = get('edition').split(',').filter(Boolean).slice(0, 3)
  const editionName = editionIds
    .map(id => editions.find(edition => edition.value === id)?.name)
    .filter(Boolean)
    .join(', ')
  let locale = get('locale') === 'tr' ? 'tr' : 'en'
  let categories: string[] = []
  try {
    const state = JSON.parse(get('d') || '{}') as { c?: unknown; l?: unknown }
    if (state.l === 'tr' || state.l === 'en') locale = state.l
    if (Array.isArray(state.c)) categories = state.c.filter((value): value is string => typeof value === 'string').slice(0, 8)
  } catch {
    categories = []
  }

  const title = query || (locale === 'tr' ? 'Paylaşılan haber haritası' : 'Shared news map')
  const description = [editionName, categories.join(', ')].filter(Boolean).join(' · ') || 'A live news map from NewsMap.JS'
  const imageParams = new URLSearchParams({ title, edition: editionName, locale })
  if (get('d').length <= 2500) imageParams.set('d', get('d'))
  const imageUrl = `/api/og?${imageParams.toString()}`

  return {
    title: `${title} | ÖzelHaber`,
    description,
    openGraph: {
      title: `${title} | ÖzelHaber`,
      description,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `NewsMap.JS — ${title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ÖzelHaber`,
      description,
      images: [imageUrl],
    },
  }
}

export default function Page() {
  return <NewsMapClient />
}
