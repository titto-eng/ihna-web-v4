// Pure URL validators for embed blocks (20-blocks "VideoEmbed allowlist", DEC-5). No I/O.
export type VideoRef = { provider: 'youtube' | 'vimeo'; id: string }

const YT_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']
const YT_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d{6,12}$/

export function parseVideoUrl(input: string | null | undefined): VideoRef | null {
  if (!input) return null
  let u: URL
  try { u = new URL(input.trim()) } catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  const host = u.hostname.toLowerCase()
  if (host === 'youtu.be') {
    const id = u.pathname.split('/')[1] ?? ''
    return YT_ID.test(id) ? { provider: 'youtube', id } : null
  }
  if (YT_HOSTS.includes(host)) {
    const parts = u.pathname.split('/').filter(Boolean)
    const id = u.searchParams.get('v') ?? (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '') ? parts[1] : '')
    return id && YT_ID.test(id) ? { provider: 'youtube', id } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p)) ?? ''
    return VIMEO_ID.test(id) ? { provider: 'vimeo', id } : null
  }
  return null
}

// The renderer builds the src itself, never from the stored URL. `enablejsapi` / `api` let the page pause a player when another
// one starts (src/components/media/exclusivePlayback.ts).
export const videoSrc = (v: VideoRef): string =>
  v.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&enablejsapi=1`
    : `https://player.vimeo.com/video/${v.id}?autoplay=1&dnt=1&api=1`

export const validateVideoUrl = (v: unknown): true | string =>
  parseVideoUrl(typeof v === 'string' ? v : null) ? true : 'Enter a YouTube or Vimeo link'

export const MAP_EMBED_PREFIX = 'https://www.google.com/maps/embed'

export const isMapEmbedUrl = (v: unknown): boolean => {
  if (typeof v !== 'string') return false
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:' && u.hostname === 'www.google.com' && u.pathname.startsWith('/maps/embed')
  } catch { return false }
}

export const validateMapEmbedUrl = (v: unknown): true | string =>
  isMapEmbedUrl(v) ? true : 'Use a Google Maps embed link (https://www.google.com/maps/embed?…)'

export const isHttpsUrl = (v: unknown): boolean => {
  try { return typeof v === 'string' && new URL(v.trim()).protocol === 'https:' } catch { return false }
}

export const validateHttpsUrl = (v: unknown): true | string => (isHttpsUrl(v) ? true : 'URL must start with https://')

// Hosts every iframeEmbed may use in addition to site.allowedEmbedHosts in src/content/site.ts (DEC-5).
// www.google.com is accepted only for Maps embeds.
export const BUILTIN_EMBED_HOSTS = ['www.youtube-nocookie.com', 'www.youtube.com', 'player.vimeo.com']

export function hostAllowed(url: string, allowedHosts: string[] = []): boolean {
  if (!isHttpsUrl(url)) return false
  const u = new URL(url.trim())
  const host = u.hostname.toLowerCase()
  if (isMapEmbedUrl(url)) return true
  return [...BUILTIN_EMBED_HOSTS, ...allowedHosts].some((h) => h.toLowerCase() === host)
}
