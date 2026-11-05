import Link from 'next/link'
import type { IntakeCalendarBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { PortalNotice } from '@/components/templates/PortalNotice'
import { courseOf } from '@/components/templates/courseContext'
import { calendarColour, calendarLabel, contrastTextColour, formatStartDate, getIntakeCalendar, portalEnabled, portalToday, type CalendarEntry } from '@/lib/portal'
import type { BlockProps } from '../types'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Courses without a published Payload course of that khId are dropped (legacy: wp_postmeta LIKE). */
async function publishedByKhId(khIds: number[]): Promise<Map<number, { path: string; title: string }>> {
  if (!khIds.length) return new Map()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'courses', where: { and: [{ khId: { in: khIds } }, { _status: { equals: 'published' } }] },
    depth: 0, limit: 200, pagination: false, select: { khId: true, path: true, title: true },
  })
  return new Map(docs.flatMap((d) => (d.khId ? [[d.khId, { path: d.path ?? '/courses/', title: d.title }] as const] : [])))
}

// Next `months` months of intakes (one cached portal query per month). Month cards in a grid >= md, a stack on mobile.
export async function IntakeCalendar({ block, ctx }: BlockProps<Block>) {
  const months = Math.min(Math.max(block.months ?? 12, 1), 24)
  const shell = (children: React.ReactNode) => (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="intakeCalendar">
        <SectionHeader eyebrow="Intakes" heading="Upcoming *intakes*" />
        {children}
      </div>
    </Section>
  )
  if (!portalEnabled()) return shell(<PortalNotice />) // PORTAL_ENABLED=0: static fallback, nothing fetched
  const course = courseOf(ctx)
  const studentType = course?.studentType === 'domestic' ? 0 : course?.studentType === 'international' ? 1 : null
  const [y0, m0] = portalToday().split('-').map(Number)
  const slots = Array.from({ length: months }, (_, i) => ({ year: y0 + Math.floor((m0 - 1 + i) / 12), month: ((m0 - 1 + i) % 12) + 1 }))
  const results = await Promise.all(slots.map((s) => getIntakeCalendar(s.year, s.month, studentType)))
  const section = shell
  if (results.every((r) => r.unavailable)) return section(<PortalNotice />)

  const all = results.flatMap((r) => r.data)
  let known = new Map<number, { path: string; title: string }>()
  try {
    known = await publishedByKhId([...new Set(all.map((e) => e.khId))])
  } catch {
    return section(<PortalNotice />)
  }
  const byMonth = slots.map((s, i) => ({ ...s, entries: results[i].data.filter((e) => known.has(e.khId)) }))
  if (byMonth.every((m) => !m.entries.length)) return null
  const entryRow = (e: CalendarEntry) => {
    const bg = calendarColour(e.courseName)
    return (
      <li key={`${e.date}-${e.khId}-${e.campusId}`}>
        <Link href={known.get(e.khId)!.path} className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: bg, outline: `1px solid ${contrastTextColour(bg)}22` }} aria-hidden />
          <span className="text-sm">
            <span className="block font-medium">{formatStartDate(e.date)} · {e.courseName}</span>
            <span className="text-muted-foreground">{e.campusName} · {calendarLabel(e)}</span>
          </span>
        </Link>
      </li>
    )
  }
  return section(
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {byMonth.filter((m) => m.entries.length).map((m) => (
        <div key={`${m.year}-${m.month}`} className="rounded-card border border-border bg-card p-6">
          <h3 className="display text-2xl">{MONTH_NAMES[m.month - 1]} {m.year}</h3>
          <ul className="mt-4 space-y-1">{m.entries.map(entryRow)}</ul>
        </div>
      ))}
    </div>,
  )
}

// Payload loads on first use, so a block with nothing to fetch (no course, portal down) never boots the CMS config.
async function getPayloadClient() {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
}
