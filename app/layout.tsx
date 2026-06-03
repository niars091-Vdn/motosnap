import type { Metadata, Viewport } from 'next'
import { Syne, Rajdhani, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title:       'MotoSnap — Identifica la tua moto con l\'AI',
  description: 'Fotografa qualsiasi moto e scopri marca, modello e anno in secondi. Gestisci il tuo garage, traccia la manutenzione e trova prodotti compatibili.',
  keywords:    ['moto', 'identificazione moto', 'garage digitale', 'manutenzione moto', 'AI moto'],
  authors:     [{ name: 'MotoSnap' }],
  creator:     'MotoSnap',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://motosnap.app'),
  openGraph: {
    title:       'MotoSnap — Il tuo garage digitale',
    description: 'Fotografa qualsiasi moto e scopri marca, modello e anno in secondi.',
    url:         'https://motosnap.app',
    siteName:    'MotoSnap',
    locale:      'it_IT',
    type:        'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MotoSnap' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'MotoSnap — Identifica la tua moto con l\'AI',
    description: 'Fotografa qualsiasi moto e scopri marca, modello e anno in secondi.',
    images:      ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable:    true,
    title:      'MotoSnap',
    statusBarStyle: 'default',
  },
  icons: {
    icon:    [
      { url: '/icons/icon-32.png',  sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple:   [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width:          'device-width',
  initialScale:   1,
  maximumScale:   1,
  userScalable:   false,
  themeColor:     [
    { media: '(prefers-color-scheme: light)', color: '#eef0ec' },
    { media: '(prefers-color-scheme: dark)',  color: '#0d1418' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${syne.variable} ${rajdhani.variable} ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
