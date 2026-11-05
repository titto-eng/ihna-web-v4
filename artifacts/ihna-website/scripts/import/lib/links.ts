import { loadPageRows } from './data'

// Dead-link bookkeeping (30-import §5): internal links must point at a URL the new site serves. Reported, never fixed silently.
const FILE_PREFIXES = ['/pdf/', '/brochures/', '/wp-content/uploads/', '/media/', '/lp/', '/enquirenow/', '/api/media/', '/IHM_', '/HCI_', '/International-SHB/', '/IHM_Domestic_SHB/']

let known: Set<string> | null = null
export function liveUrlSet(): Set<string> {
  known ??= new Set(loadPageRows().map((r) => r.path.split(/[?#]/)[0]).filter((p) => p.startsWith('/')))
  return known
}

export type LinkRefs = { internal: string[]; uat: string[]; pdf: number }

/** Every href/url in a block layout or Lexical state (link nodes, cta links, card links). */
export function collectLinks(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => collectLinks(v, out))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'href' || k === 'url') && typeof v === 'string') out.push(v)
      else if (v && typeof v === 'object') collectLinks(v, out)
    }
  }
  return out
}

export function classifyLinks(urls: string[]): LinkRefs {
  const refs: LinkRefs = { internal: [], uat: [], pdf: 0 }
  const live = liveUrlSet()
  for (const raw of urls) {
    if (/^https?:\/\/(www\.)?uat\./i.test(raw)) {
      refs.uat.push(raw)
      continue
    }
    if (!raw.startsWith('/') || raw.startsWith('//')) continue
    const path = raw.split(/[?#]/)[0]
    if (/\.pdf$/i.test(path)) refs.pdf++
    if (FILE_PREFIXES.some((p) => path.startsWith(p)) || /\.(pdf|docx?|pptx?|xlsx?|jpe?g|png|webp|gif)$/i.test(path)) continue
    const normal = path.endsWith('/') ? path : `${path}/`
    if (!live.has(normal) && !live.has(path)) refs.internal.push(normal)
  }
  return refs
}
