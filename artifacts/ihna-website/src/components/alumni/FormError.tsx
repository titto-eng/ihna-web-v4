import type { ReactNode } from 'react'

/** Inline form-level message. Announced to screen readers when it appears. */
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null
  return <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{children}</p>
}

export function FormNotice({ children }: { children: ReactNode }) {
  if (!children) return null
  return <p role="status" className="rounded-md border border-border bg-muted px-3 py-2 text-sm">{children}</p>
}
