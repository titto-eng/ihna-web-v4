import type { ReactNode } from 'react'
import { site } from '@/content/site'

// Brand panel + form card (05-design-system "AlumniLogin / Dashboard"). Server component, used by every alumni auth page.
export function AuthShell({ eyebrow = `${site.shortName} Alumni`, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/15">
      <div className="mx-auto grid w-full max-w-site gap-8 px-5 py-12 md:px-8 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <div className="rounded-card bg-ink p-8 text-ink-foreground md:p-12">
          <p className="label-mono text-secondary">{eyebrow}</p>
          <h1 className="display mt-4 text-4xl md:text-5xl">{title}</h1>
          {intro ? <p className="mt-5 max-w-prose text-ink-foreground/80">{intro}</p> : null}
        </div>
        <div className="rounded-card border bg-card p-6 text-card-foreground md:p-10">{children}</div>
      </div>
    </section>
  )
}
