import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { MediaMap } from './context'
import { normaliseLegacyPath } from './context'

// HTML (our own minimal serialiser output: p, h2-h4, ul/ol/li, a, strong, em, img, br) → Lexical JSON via Payload's
// convertHTMLToLexical (30-import §7.1). Images become `upload` nodes pointing at media ids; an image that is not in the
// media map is dropped and reported.
type DomCtor = new (html: string) => { window: { document: Document } }
let cached: Promise<{ convert: typeof import('@payloadcms/richtext-lexical').convertHTMLToLexical; editorConfig: unknown; JSDOM: DomCtor }> | null = null

/** jsdom 28 does not load on Node 22.11 under vitest (DEC-28), so tests fall back to a happy-dom shim. */
async function loadDom(): Promise<DomCtor> {
  try {
    const m = (await import('jsdom')) as unknown as { JSDOM: DomCtor }
    new m.JSDOM('<p>x</p>')
    return m.JSDOM
  } catch {
    const { Window } = await import('happy-dom')
    return class {
      window: { document: Document }
      constructor(html: string) {
        const w = new Window()
        w.document.write(`<!doctype html><html><body>${html}</body></html>`)
        this.window = w as unknown as { document: Document }
      }
    } as unknown as DomCtor
  }
}

export type LexicalState = SerializedEditorState
export type Lexicalise = { (html: string): LexicalState; dropped: { src: string; alt: string }[]; uploads: number }

export async function createLexicaliser(mediaMap: MediaMap): Promise<Lexicalise> {
  // Load order matters: `payload` and the config first, `@payloadcms/richtext-lexical` last. A static import of the
  // richtext package ahead of `payload` deadlocks the ESM graph (the process exits silently) under tsx, intermittently.
  cached ??= (async () => {
    await import('payload')
    const { default: config } = await import('../../../src/payload.config')
    const lexical = await import('@payloadcms/richtext-lexical')
    return { convert: lexical.convertHTMLToLexical, editorConfig: await lexical.editorConfigFactory.default({ config: await config }), JSDOM: await loadDom() }
  })()
  const { convert, editorConfig, JSDOM } = await cached

  const fn = ((html: string): LexicalState => {
    const prepared = prepareImages(html, mediaMap, fn)
    const state = convert({ editorConfig: editorConfig as never, html: prepared, JSDOM: JSDOM as never }) as LexicalState
    fixUploads(state, fn)
    return state
  }) as Lexicalise
  fn.dropped = []
  fn.uploads = 0
  return fn
}

/** Lifts every `<img>` out of its paragraph (Lexical uploads are block nodes) and points it at a media id. */
function prepareImages(html: string, map: MediaMap, fn: Lexicalise): string {
  if (!html.includes('<img')) return html
  return html.replace(/<p>((?:(?!<\/p>)[^])*?)<\/p>|<img\b[^>]*>/g, (whole, inner: string | undefined) => {
    if (inner === undefined) return imgTag(whole, map, fn)
    if (!inner.includes('<img')) return whole
    // split the paragraph around its images: text <p>, image, text <p>
    return inner
      .split(/(<img\b[^>]*>)/)
      .map((part) => (part.startsWith('<img') ? imgTag(part, map, fn) : strip(part) ? `<p>${part}</p>` : ''))
      .join('')
  })
}

const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? ''

function imgTag(tag: string, map: MediaMap, fn: Lexicalise): string {
  const src = attr(tag, 'src').replace(/&amp;/g, '&')
  const id = map[normaliseLegacyPath(src)]
  if (!id) {
    fn.dropped.push({ src, alt: attr(tag, 'alt') })
    return ''
  }
  fn.uploads++
  return `<img data-lexical-upload-id="${id}" data-lexical-upload-relation-to="media">`
}

/** Lexical keeps the id from the DOM attribute as a string; Postgres ids are numbers. */
function fixUploads(node: unknown, fn: Lexicalise): void {
  if (Array.isArray(node)) return node.forEach((n) => fixUploads(n, fn))
  if (!node || typeof node !== 'object') return
  const n = node as { type?: string; value?: unknown; children?: unknown }
  if (n.type === 'upload' && typeof n.value === 'string' && /^\d+$/.test(n.value)) n.value = Number(n.value)
  for (const v of Object.values(n)) if (v && typeof v === 'object') fixUploads(v, fn)
}

/** Plain text of a Lexical state, used for coverage maths and tests. */
export function lexicalText(state: unknown): string {
  const out: string[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    const o = n as { text?: string; children?: unknown[] }
    if (typeof o.text === 'string') out.push(o.text)
    o.children?.forEach(walk)
  }
  walk((state as { root?: unknown })?.root)
  return out.join(' ')
}

/** Internal link targets in a Lexical state (for the dead-link report). */
export function lexicalLinks(state: unknown): string[] {
  const links: string[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    const o = n as { type?: string; fields?: { url?: string }; children?: unknown[] }
    if ((o.type === 'link' || o.type === 'autolink') && o.fields?.url) links.push(o.fields.url)
    o.children?.forEach(walk)
  }
  walk((state as { root?: unknown })?.root)
  return links
}
