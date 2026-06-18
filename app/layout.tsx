import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Geist_Mono, Noto_Sans_Arabic, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/app-context'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const notoArabic = Noto_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
})
const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Smart Reglili — Votre stock, notre intelligence',
  description:
    'Smart Reglili : gestion de stock, caisse épicerie et pilotage intelligent pour les commerçants. Gérez · Contrôlez · Développez.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  applicationName: 'Smart Reglili',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Reglili',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d2137',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} ${geistMono.variable} ${notoArabic.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
