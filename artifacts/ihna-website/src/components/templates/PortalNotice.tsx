import Link from 'next/link'

// Shown by the date blocks when the portal cannot be reached and nothing is cached (50-portal-data §4 Failure).
export function PortalNotice() {
  return (
    <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground" data-portal-unavailable>
      Dates coming soon — <Link href="#quickContact" className="font-semibold text-primary-strong underline underline-offset-4">enquire for the next intake</Link>.
    </p>
  )
}
