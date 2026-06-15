import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Geist_Mono } from 'next/font/google'
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
  maximumScale: 1,
  userScalable: false,
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
      className={`${inter.variable} ${poppins.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
