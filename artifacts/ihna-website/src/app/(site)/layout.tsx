import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import '@/styles/theme.css'
import { AudienceProvider } from '@/components/audience/AudienceProvider'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'
import { Tracking } from '@/components/tracking/Tracking'
import { site } from '@/content/site'

// Fonts are self-hosted (src/fonts/, SIL OFL, from Fontsource): no request to Google at build or dev time, so a slow or offline
// network can never fail a build or a page with "Failed to fetch font". Same families, axes and CSS variables as before.
const fraunces = localFont({
  src: [
    { path: '../../fonts/fraunces-latin-full-normal.woff2', weight: '100 900', style: 'normal' },
    { path: '../../fonts/fraunces-latin-full-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})
const bricolage = localFont({
  src: [{ path: '../../fonts/bricolage-grotesque-latin-wght-normal.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-bricolage',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
})
const splineMono = localFont({
  src: [
    { path: '../../fonts/spline-sans-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/spline-sans-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-spline-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'Consolas', 'monospace'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'),
  title: { default: site.siteName, template: site.titleTemplate },
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={`${fraunces.variable} ${bricolage.variable} ${splineMono.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: extensions such as Grammarly add data-* attributes to <body> before hydration (attributes only, one level). */}
      <body suppressHydrationWarning>
        <Tracking />
        <AudienceProvider>
          <a href="#main" className="sr-only z-50 rounded-full bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </AudienceProvider>
        <Toaster />
      </body>
    </html>
  )
}
