import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Every /pay/* page: noindex, no referrer (receipt links carry an email in the query string), never cached (each page is force-dynamic).
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default function PayLayout({ children }: { children: ReactNode }) {
  return children
}
