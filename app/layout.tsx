import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Cormorant_Garamond, Great_Vibes, Montserrat } from 'next/font/google'

const serif = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '600'], style: ['normal', 'italic'] })
const script = Great_Vibes({ subsets: ['latin'], variable: '--font-script', weight: '400' })
const sans = Montserrat({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600'] })

export const metadata: Metadata = {
  title: 'María Mabel & Isaías Antonio | Nuestra boda',
  description: 'Invitación de boda de María Mabel e Isaías Antonio, sábado 2 de enero de 2027.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FAF6EF',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${script.variable}`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
