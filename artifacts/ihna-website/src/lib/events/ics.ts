// iCalendar (RFC 5545) text for one event. Pure: no I/O. Used by /iCalendar/scheduler.php (the old IHNA "add to calendar" link).

export type IcsEvent = { uid: string; title: string; startsAt: string; endsAt?: string | null; location?: string | null; description?: string | null; url?: string | null }

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

/** TEXT escaping (RFC 5545 §3.3.11): backslash, semicolon, comma and newlines. */
export const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Lines longer than 75 octets are folded with CRLF + space (§3.1). */
function fold(line: string): string {
  const out: string[] = []
  let rest = line
  while (Buffer.byteLength(rest, 'utf8') > 75) {
    let n = 75
    while (Buffer.byteLength(rest.slice(0, n), 'utf8') > 75) n--
    out.push(rest.slice(0, n))
    rest = ' ' + rest.slice(n)
  }
  out.push(rest)
  return out.join('\r\n')
}

export function buildIcs(e: IcsEvent, now = new Date()): string {
  const start = new Date(e.startsAt)
  const end = e.endsAt ? new Date(e.endsAt) : new Date(start.getTime() + 60 * 60 * 1000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IHNA//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText(e.title)}`,
    ...(e.location ? [`LOCATION:${icsText(e.location)}`] : []),
    ...(e.description ? [`DESCRIPTION:${icsText(e.description)}`] : []),
    ...(e.url ? [`URL:${e.url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
