/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StrataDASH',
  description: 'Strategic planning for educational districts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
