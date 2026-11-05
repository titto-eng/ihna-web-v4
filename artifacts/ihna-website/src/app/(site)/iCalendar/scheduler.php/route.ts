import { getPayload } from 'payload'
import config from '@payload-config'
import { buildIcs } from '@/lib/events/ics'

// The old "add to calendar" link (`/iCalendar/scheduler.php?id=<n>`, SQL-injectable on the old site). The id must be digits and
// is matched to `events.legacyId`; only published events are served. Anything else answers the old plain "Invalid link" (200, as live).
export const dynamic = 'force-dynamic'

const invalid = () => new Response('Invalid link', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } })

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? ''
  if (!/^\d{1,9}$/.test(id)) return invalid()
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events',
      where: { and: [{ legacyId: { equals: Number(id) } }, { _status: { equals: 'published' } }] },
      limit: 1,
      depth: 0,
      overrideAccess: false,
    })
    const e = docs[0]
    if (!e) return invalid()
    const body = buildIcs({ uid: `event-${e.id}@ihna.edu.au`, title: e.title, startsAt: e.startsAt, location: e.venue ?? null, description: e.description ?? null, url: e.joinUrl ?? null })
    return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="event.ics"', 'Cache-Control': 'public, max-age=300' } })
  } catch {
    return invalid()
  }
}
