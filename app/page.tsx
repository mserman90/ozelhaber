import type { Metadata } from 'next'
import { NewsMapClient } from '@/components/newsmap-client'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'ÖzelHaber - İnteraktif Haber Haritası',
  description:
    'Google News ve popüler RSS beslemelerinden gerçek zamanlı haberleri haritalandıran dinamik treemap haber platformu.',
  openGraph: {
    title: 'ÖzelHaber - İnteraktif Haber Haritası',
    description: 'Haberleri treemap mozaik harita ile anlık takip edin.',
    type: 'website',
  },
}

export default function Page() {
  return <NewsMapClient />
}
