import type { CSSProperties, ReactNode } from 'react'
import { Epilogue, JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google'

const headline = Epilogue({
  subsets: ['latin'],
  variable: '--font-public-headline',
  weight: ['700', '800', '900'],
  display: 'swap',
})

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-public-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const label = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-public-label',
  weight: ['500', '700'],
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-public-mono',
  weight: ['500', '700'],
  display: 'swap',
})

const publicTheme = {
  '--color-background': '#f5f2ea',
  '--color-foreground': '#171a1f',
  '--color-card': '#ffffff',
  '--color-card-foreground': '#171a1f',
  '--color-primary': '#0f4671',
  '--color-primary-foreground': '#ffffff',
  '--color-primary-container': '#2f5e8a',
  '--color-on-primary-container': '#b4d6ff',
  '--color-primary-fixed': '#d0e4ff',
  '--color-primary-fixed-dim': '#9ecafc',
  '--color-secondary': '#00675d',
  '--color-secondary-foreground': '#ffffff',
  '--color-secondary-container': '#6df5e1',
  '--color-on-secondary-container': '#005b51',
  '--color-secondary-fixed': '#ffdad7',
  '--color-secondary-fixed-dim': '#ffb3ae',
  '--color-tertiary': '#994100',
  '--color-tertiary-foreground': '#ffffff',
  '--color-tertiary-container': '#ff955a',
  '--color-on-tertiary-container': '#552100',
  '--color-tertiary-fixed': '#9ff1e7',
  '--color-tertiary-fixed-dim': '#83d5cb',
  '--color-on-tertiary-fixed': '#00201d',
  '--color-on-tertiary-fixed-variant': '#00504a',
  '--color-error': '#b41340',
  '--color-on-error': '#ffffff',
  '--color-error-container': '#ffdad6',
  '--color-on-error-container': '#93000a',
  '--color-surface': '#ffffff',
  '--color-on-surface': '#171a1f',
  '--color-on-surface-variant': '#42474f',
  '--color-surface-container-lowest': '#ffffff',
  '--color-surface-container-low': '#f2efe9',
  '--color-surface-container': '#e8e1d8',
  '--color-surface-container-high': '#ddd5cb',
  '--color-surface-container-highest': '#d0c7bb',
  '--color-outline': '#72777f',
  '--color-outline-variant': '#c8c2b8',
  '--color-inverse-surface': '#2e3036',
  '--color-inverse-on-surface': '#eff0f8',
  '--color-inverse-primary': '#9ecafc',
  '--color-surface-tint': '#33618e',
} as CSSProperties & Record<string, string>

export default function RootGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${headline.variable} ${body.variable} ${label.variable} ${mono.variable} min-h-screen bg-background text-foreground antialiased`}
      style={publicTheme}
    >
      {children}
    </div>
  )
}
