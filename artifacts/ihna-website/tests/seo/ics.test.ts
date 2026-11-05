import { describe, expect, it } from 'vitest'
import { buildIcs, icsText } from '@/lib/events/ics'

describe('buildIcs (/iCalendar/scheduler.php)', () => {
  it('writes a valid VEVENT in UTC with escaped text and CRLF lines', () => {
    const out = buildIcs({ uid: 'event-1@ihna.edu.au', title: 'Open day, Melbourne; CBD', startsAt: '2026-11-04T23:00:00.000Z', location: 'Level 4, 399 Lonsdale St' }, new Date('2026-10-21T00:00:00Z'))
    expect(out.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(out).toContain('DTSTART:20261104T230000Z\r\n')
    expect(out).toContain('DTEND:20261105T000000Z\r\n')
    expect(out).toContain('SUMMARY:Open day\\, Melbourne\; CBD\r\n')
    expect(out.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
  })

  it('folds long lines at 75 octets and escapes newlines', () => {
    expect(icsText('a\nb')).toBe('a\\nb')
    const out = buildIcs({ uid: 'u', title: 'x', startsAt: '2026-01-01T00:00:00Z', description: 'y'.repeat(200) })
    for (const line of out.split('\r\n')) expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75)
  })
})
