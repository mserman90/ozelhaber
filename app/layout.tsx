import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NewsMap.JS',
  description:
    'A squarified treemap visualization of Google News based on the original newsmap.jp - now with your own RSS feeds and Google News keyword searches.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', shortcut: '/favicon.ico' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="newsmap-html">
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
