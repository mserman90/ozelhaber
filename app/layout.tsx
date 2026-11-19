import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ÖzelHaber - İnteraktif Haber Haritası',
  description:
    'Google News ve popüler RSS beslemelerinden gerçek zamanlı haberleri haritalandıran dinamik treemap haber platformu.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', shortcut: '/favicon.ico' },
  openGraph: {
    title: 'ÖzelHaber - İnteraktif Haber Haritası',
    description: 'Haberleri treemap mozaik harita ile anlık takip edin.',
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
