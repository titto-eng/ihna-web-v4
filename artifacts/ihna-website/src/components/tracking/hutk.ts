/** The HubSpot visitor token from the first-party `hubspotutk` cookie (80-tracking "hutk handoff", DEC-13). The enquiry form imports this. */
export function readHutk(cookie?: string): string {
  const source = cookie ?? (typeof document === 'undefined' ? '' : document.cookie)
  for (const part of source.split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === 'hubspotutk') {
      try {
        return decodeURIComponent(part.slice(i + 1).trim())
      } catch {
        return ''
      }
    }
  }
  return ''
}
