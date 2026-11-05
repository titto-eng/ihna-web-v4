import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DOCUMENT_ALIASES, DOCUMENT_PREFIXES, documentTags, type DocumentSection } from '@/collections/Documents'

// The `documents` lookup shared by the file route (src/app/(site)/pdf/[...path]/route.ts) and /policies-procedures/.
// One cached index of every document (~250 rows, a few fields each), tagged `documents` / `collection:documents`; the collection's
// afterChange / afterDelete hooks expire those tags at once, so a replaced file or a new title shows on the next request.

export const DOCUMENTS_TAGS = documentTags()

export type DocumentEntry = {
  id: number | string
  title: string
  publicPath: string
  filename: string | null
  filesize: number | null
  updatedAt: string
  category: string | null
  audience: string | null
  listings: { section: DocumentSection; order: number }[]
}

export type DocumentLoader = () => Promise<DocumentEntry[]>

async function query(publicPaths?: string[]): Promise<DocumentEntry[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'documents',
    ...(publicPaths ? { where: { publicPath: { in: publicPaths } } } : {}),
    pagination: false,
    limit: 0,
    depth: 0,
    overrideAccess: false, // public read; `notes` is staff-only and not selected anyway
    select: { title: true, publicPath: true, filename: true, filesize: true, updatedAt: true, category: true, audience: true, listings: true },
  })
  return docs.map((d) => ({
    id: d.id,
    title: d.title,
    publicPath: d.publicPath,
    filename: d.filename ?? null,
    filesize: d.filesize ?? null,
    updatedAt: d.updatedAt,
    category: d.category ?? null,
    audience: d.audience ?? null,
    listings: (d.listings ?? []).map((l) => ({ section: l.section as DocumentSection, order: Number(l.order ?? 0) })),
  }))
}

export const getDocumentIndex: DocumentLoader = unstable_cache(() => query(), ['documents-index-v1'], { tags: DOCUMENTS_TAGS, revalidate: 86_400 })

/** The same lookup straight from the database, for when the cached row points at a file that is no longer there. */
export const findDocumentUncached = async (path: string): Promise<DocumentEntry | null> =>
  findDocument(path, () => query([path, ...(DOCUMENT_ALIASES[path] ? [DOCUMENT_ALIASES[path]] : [])]))

/**
 * Route segments → the decoded public path, or null when they cannot name a document. `/pdf/~/<prefix>/...` is the internal form the
 * proxy rewrites every document URL to (so the collection wins over a copy in public/); `/pdf/<rest>` is the direct form.
 * Rejects empty, `.`/`..`, slash, backslash and NUL segments, a prefix outside DOCUMENT_PREFIXES and anything not ending in .pdf.
 */
export function publicPathOf(segments: string[]): string | null {
  const parts: string[] = []
  for (const raw of segments) {
    let s = raw
    if (/%[0-9A-Fa-f]{2}/.test(s)) {
      try {
        s = decodeURIComponent(s)
      } catch {
        return null
      }
    }
    if (!s || s === '.' || s === '..' || /[\0\\/]/.test(s)) return null
    parts.push(s)
  }
  const internal = parts[0] === '~'
  const rest = internal ? parts.slice(1) : parts
  if (!rest.length) return null
  const path = internal ? `/${rest.join('/')}` : `/pdf/${rest.join('/')}`
  if (!DOCUMENT_PREFIXES.some((p) => path.startsWith(p)) || !/\.pdf$/i.test(path)) return null
  return path
}

/** The document for a public path (exact first, then an alias in DOCUMENT_ALIASES), or null. */
export async function findDocument(path: string, load: DocumentLoader = getDocumentIndex): Promise<DocumentEntry | null> {
  const docs = await load()
  const exact = docs.find((d) => d.publicPath === path)
  if (exact) return exact
  const alias = DOCUMENT_ALIASES[path]
  return alias ? (docs.find((d) => d.publicPath === alias) ?? null) : null
}

/** Documents listed in a /policies-procedures/ section, in their listing order (title breaks ties). */
export function documentsIn(docs: DocumentEntry[], section: DocumentSection): DocumentEntry[] {
  return docs
    .flatMap((d) => d.listings.filter((l) => l.section === section).map((l) => ({ d, order: l.order })))
    .sort((a, b) => a.order - b.order || a.d.title.localeCompare(b.d.title))
    .map((x) => x.d)
}

/** The href for a public path: spaces and non-ASCII percent-encoded, `&` kept as the old site linked it (publicPath has no ?, #, %). */
export const documentHref = (publicPath: string) => encodeURI(publicPath)
