// /sitemap/: every page of the new site, grouped by section, with its migration status (src/content/migration-status.ts) so the team
// can see what is finished. Courses and posts come from the CMS (published only). Marking a page done = one row in migration-status.ts.
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react'
import { Hero, pageMetadata } from '@/components/page'
import { Section } from '@/components/layout/Section'
import { pages, sections, type SectionKey } from '@/content/pages'
import { landingPages } from '@/content/landing'
import { CONTENT_CHECKED, statusOf, type MigrationStatus } from '@/content/migration-status'
import { cn } from '@/lib/cn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Sitemap',
  path: '/sitemap/',
  description: 'Every page of the Institute of Health and Nursing Australia website, by section.',
  noindex: true,
})

type Item = { path: string; title: string }
type Group = { key: string; title: string; items: Item[] }

const STATUS: Record<MigrationStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  ready: { label: 'Ready', cls: 'bg-primary text-ink', Icon: CheckCircle2 },
  migrated: { label: 'Migrated', cls: 'bg-primary-strong/10 text-primary-strong', Icon: CircleDashed },
  review: { label: 'Review', cls: 'bg-secondary text-ink', Icon: AlertTriangle },
}

async function cmsItems(collection: 'courses' | 'posts'): Promise<Item[]> {
  try {
    const payload = await getPayload({ config })
    const r = await payload.find({ collection, where: { _status: { equals: 'published' } }, limit: 0, pagination: false, depth: 0, draft: false, overrideAccess: true, select: { title: true, path: true } as never })
    return (r.docs as unknown as { title?: string; path?: string }[]).filter((d) => d.path).map((d) => ({ path: d.path!, title: d.title ?? d.path! }))
  } catch {
    return []
  }
}

const sectionOrder: (SectionKey | 'other')[] = ['about', 'student', 'current-student', 'industry', 'library', 'other']

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function SitemapRoute({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const filter = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as MigrationStatus | undefined
  const [courses, posts] = await Promise.all([cmsItems('courses'), cmsItems('posts')])

  const groups: Group[] = sectionOrder.map((key) => ({
    key,
    title: key === 'other' ? 'Pages' : sections[key].title,
    items: pages.filter((p) => (p.section ?? 'other') === key && !p.noindex).map((p) => ({ path: p.path, title: p.title })),
  }))
  groups.push({ key: 'courses', title: 'Courses', items: courses.sort((a, b) => a.title.localeCompare(b.title)) })
  if (posts.length) groups.push({ key: 'posts', title: 'Blog and news', items: posts })
  groups.push({ key: 'landing', title: 'Landing pages', items: landingPages.map((l) => ({ path: l.path, title: l.title })) })
  groups.push({ key: 'utility', title: 'Forms, thank-you and utility pages', items: pages.filter((p) => p.noindex).map((p) => ({ path: p.path, title: p.title })) })

  const all = groups.flatMap((g) => g.items)
  const count = (s: MigrationStatus) => all.filter((i) => statusOf(i.path).status === s).length
  const shown = groups
    .map((g) => ({ ...g, items: filter ? g.items.filter((i) => statusOf(i.path).status === filter) : g.items }))
    .filter((g) => g.items.length)

  const pill = (s: MigrationStatus | undefined, label: string, n: number) => (
    <Link
      href={s ? `/sitemap/?status=${s}` : '/sitemap/'}
      className={cn(
        'flex flex-col rounded-card border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        filter === s ? 'border-primary bg-primary/10' : 'border-border bg-card',
      )}
    >
      <span className="display text-4xl text-primary-strong">{n}</span>
      <span className="mt-1 text-sm font-semibold">{label}</span>
    </Link>
  )

  return (
    <>
      <Hero heading="Sitemap" eyebrow="All pages" variant="compact" audienceSwitch={false} subheading={`Every page of the new IHNA website and its migration status. Content checked against the WordPress database on ${CONTENT_CHECKED}.`} />
      <Section spacing="compact" tone="muted">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {pill(undefined, 'All pages', all.length)}
          {pill('ready', 'Ready to go', count('ready'))}
          {pill('migrated', 'Migrated, redesign pending', count('migrated'))}
          {pill('review', 'Needs review', count('review'))}
        </div>
        {courses.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Courses appear here once they are imported into the CMS (`npm run import -- lookups,wp-courses`).</p>
        )}
      </Section>
      <Section>
        <div className="columns-1 gap-8 lg:columns-2">
          {shown.map((g) => (
            <section key={g.key} className="mb-10 break-inside-avoid">
              <h2 className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2 font-sans text-xl font-semibold text-primary-strong">
                {g.title}
                <span className="label-mono text-[10px] text-muted-foreground">{g.items.length}</span>
              </h2>
              <ul className="space-y-1">
                {g.items.map((i) => {
                  const st = statusOf(i.path)
                  const S = STATUS[st.status]
                  return (
                    <li key={i.path}>
                      <Link href={i.path} className="group flex items-start justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-primary/5">
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug group-hover:text-primary-strong">{i.title}</span>
                          <span className="block truncate font-mono text-[11px] text-muted-foreground">{i.path}{st.note ? ` · ${st.note}` : ''}</span>
                        </span>
                        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', S.cls)} title={`${S.label} · ${st.date}`}>
                          <S.Icon aria-hidden className="size-3" />{S.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </Section>
    </>
  )
}
