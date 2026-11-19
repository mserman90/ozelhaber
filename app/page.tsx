import type { Metadata } from 'next'
import { NewsMapClient } from '@/components/newsmap-client'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'ÖzelHaber - Yapay Zeka Destekli İnteraktif Haber Haritası',
  description:
    'Google News ve popüler RSS beslemelerinden gerçek zamanlı haberleri haritalandıran, tek tıkla ücretsiz yapay zeka özeti sunan treemap haber platformu.',
  openGraph: {
    title: 'ÖzelHaber - Yapay Zeka Destekli İnteraktif Haber Haritası',
    description: 'Haberleri treemap mozaik harita ile takip edin, yapay zeka ile anında özetleyin.',
    type: 'website',
  },
}

export default function Page() {
  return <NewsMapClient />
}
