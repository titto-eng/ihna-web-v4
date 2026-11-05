import { ExternalLink } from 'lucide-react'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Container } from '@/components/layout/Container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pickSize } from '@/lib/media-sizes'
import type { Staff } from '@/payload-types'

type Row = Record<string, string | null | undefined> & { id?: string | null }

const initials = (name: string) => name.replace(/^(dr|prof|assoc|mrs|mr|ms)\.?\s+/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
const safeHref = (url?: string | null) => (url && /^https?:\/\//i.test(url) ? url : undefined)

function Entry({ row, meta }: { row: Row; meta: string[] }) {
  const href = safeHref(row.viewLink) ?? safeHref(row.articleLink) ?? safeHref(row.link)
  return (
    <li className="rounded-card border border-border bg-card p-5">
      {row.category && <p className="label-mono mb-2 text-accent">{row.category}</p>}
      <h3 className="font-semibold leading-snug">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 underline-offset-4 hover:underline">
            {row.title}<ExternalLink aria-hidden className="mt-1 size-3.5 shrink-0" />
          </a>
        ) : row.title}
      </h3>
      {meta.map((k) => row[k] && <p key={k} className="mt-1 text-sm text-muted-foreground">{row[k]}</p>)}
      {row.description && <p className="mt-2 text-sm">{row.description}</p>}
    </li>
  )
}

// Staff profile (09/05 templates). Rendered by /staff-profile/?id=N for the staff doc whose `legacyId` is N (DEC-111), and by the
// catch-all for a /<person>/ URL in staff-paths.ts (DEC-65; none on IHNA).
// Email and phone are never shown: they are not stored (open question 10 §10 Q3).
export function StaffProfile({ staff }: { staff: Staff }) {
  const photo = pickSize(mediaOf(staff.photo as never), 'thumb')
  const lists: { key: string; label: string; rows: Row[]; meta: string[] }[] = [
    { key: 'research', label: 'Research outputs', rows: (staff.research ?? []) as Row[], meta: ['authors', 'journal', 'year'] },
    { key: 'grants', label: 'Funded research', rows: (staff.grants ?? []) as Row[], meta: ['amount', 'year'] },
    { key: 'activities', label: 'Professional activities', rows: (staff.activities ?? []) as Row[], meta: ['detail', 'year'] },
    { key: 'supervision', label: 'Supervision', rows: (staff.supervision ?? []) as Row[], meta: ['role', 'institution', 'year'] },
  ].filter((l) => l.rows.length)
  const links = [
    { label: 'ORCID', href: safeHref(staff.orcid) },
    { label: 'Google Scholar', href: safeHref(staff.googleScholar) },
    { label: 'LinkedIn', href: safeHref(staff.linkedin) },
  ].filter((l) => l.href)
  const paragraphs = (staff.bio ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <section className="bg-background py-12 md:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-card bg-muted p-8">
            <div className="mx-auto mb-6 size-48 overflow-hidden rounded-full bg-card">
              {photo ? (
                <Image src={photo.url} alt={`Photo of ${staff.name}`} width={photo.width} height={photo.height} sizes="192px" className="size-full object-cover object-[50%_20%]" />
              ) : (
                <span aria-hidden className="display flex size-full items-center justify-center text-5xl text-primary-strong">{initials(staff.name)}</span>
              )}
            </div>
            <h1 className="display text-3xl leading-tight">{staff.name}</h1>
            {staff.postNominals && <p className="mt-2 text-sm text-muted-foreground italic">{staff.postNominals}</p>}
            {staff.position && <p className="label-mono mt-4 text-accent">{staff.position}</p>}
            {links.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm">
                {links.map((l) => (
                  <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{l.label}</a></li>
                ))}
              </ul>
            )}
          </aside>
          <div>
            <Tabs defaultValue="about">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
                <TabsTrigger value="about" className="px-4 py-2">About</TabsTrigger>
                {lists.map((l) => <TabsTrigger key={l.key} value={l.key} className="px-4 py-2">{l.label} ({l.rows.length})</TabsTrigger>)}
              </TabsList>
              <TabsContent value="about" className="mt-6">
                {paragraphs.length ? <div className="prose prose-lg max-w-prose-site">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div> : <p className="text-muted-foreground">No biography has been added yet.</p>}
              </TabsContent>
              {lists.map((l) => (
                <TabsContent key={l.key} value={l.key} className="mt-6">
                  <ul className="space-y-4">{l.rows.map((r, i) => <Entry key={r.id ?? i} row={r} meta={l.meta} />)}</ul>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </Container>
    </section>
  )
}
