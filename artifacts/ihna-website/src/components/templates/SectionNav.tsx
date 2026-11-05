import Link from 'next/link'
import { Section } from '@/components/layout/Section'
import { sectionLinks, sections, type SectionKey } from '@/content/pages'
import { cn } from '@/lib/cn'

// The old section sidebars (current students, future students, industry, about, library) as one "In this section" row under the
// hero. Links come from src/content/pages.ts (`sections`, or the registry rows of the section).
export function SectionNav({ section, current }: { section: SectionKey; current: string }) {
  const def = sections[section]
  const links = sectionLinks(section)
  if (!def || links.length < 2) return null
  return (
    <Section tone="muted" spacing="compact">
      <nav aria-label={`${def.title}: pages in this section`}>
        <p className="label-mono mb-4 text-muted-foreground">In {def.title}</p>
        <ul className="flex flex-wrap gap-2">
          {links.map((l) => {
            const here = l.href === current
            const cls = cn(
              'inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              here ? 'border-primary-strong bg-primary-strong text-primary-foreground' : 'border-border bg-card hover:border-primary-strong hover:text-primary-strong',
            )
            return (
              <li key={l.href}>
                {/^https?:\/\//.test(l.href) ? (
                  <a href={l.href} className={cls} rel="noopener noreferrer">{l.label}</a>
                ) : (
                  <Link href={l.href} className={cls} aria-current={here ? 'page' : undefined}>{l.label}</Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </Section>
  )
}
