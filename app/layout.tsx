import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ÖzelHaber - Yapay Zeka Destekli İnteraktif Haber Haritası',
  description:
    'Google News ve popüler RSS beslemelerinden gerçek zamanlı haberleri haritalandıran, cihazda ücretsiz yapay zeka özeti sunan treemap haber platformu.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', shortcut: '/favicon.ico' },
  openGraph: {
    title: 'ÖzelHaber - Yapay Zeka Destekli Haber Haritası',
    description: 'Haberleri treemap mozaik harita ile takip edin ve cihazınızda yapay zeka ile özetleyin.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="newsmap-html">
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
