import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { basename, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'
import { Documents } from '@/collections/Documents'
import { env } from '@/env'
import { findDocument, findDocumentUncached, publicPathOf, type DocumentEntry } from './documents'

// Serves a document URL (`/pdf/**`, `/brochures/**`, `/IHM_Domestic_SHB/**`, `/International-SHB/**`) with 200 at that exact URL:
//   1. a `documents` row whose publicPath (or alias) matches → its stored file (local upload store; a cloud adapter's file endpoint
//      when the file is not on local disk);
//   2. otherwise the static copy under public/ (files the import has not turned into documents yet);
//   3. otherwise 404.
// Nothing outside public/ or the upload store is ever read: segments are validated (publicPathOf) and resolved paths are checked
// against their root after resolving symlinks.

const PUBLIC_DIR = resolve(process.cwd(), 'public')
const UPLOAD_DIR = resolve(process.cwd(), typeof Documents.upload === 'object' && Documents.upload.staticDir ? Documents.upload.staticDir : 'documents')

/** `root/rel` when it exists as a regular file inside `root` (symlinks resolved), else null. */
export async function fileInside(root: string, rel: string): Promise<{ path: string; size: number; mtime: Date } | null> {
  const target = resolve(root, `.${rel.startsWith('/') ? rel : `/${rel}`}`)
  if (!target.startsWith(root + sep)) return null
  try {
    const real = await realpath(target)
    const realRoot = await realpath(root)
    if (!real.startsWith(realRoot + sep)) return null
    const s = await stat(real)
    return s.isFile() ? { path: real, size: s.size, mtime: s.mtime } : null
  } catch {
    return null
  }
}

const asciiName = (name: string) => name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')

function headers(publicPath: string, size: number | null, etag: string, lastModified: Date | null): Headers {
  const name = basename(publicPath)
  const h = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${asciiName(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    ETag: etag,
  })
  if (size != null) h.set('Content-Length', String(size))
  if (lastModified) h.set('Last-Modified', lastModified.toUTCString())
  return h
}

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60', 'Content-Type': 'text/plain' } })

function fileResponse(req: Request, file: { path: string; size: number; mtime: Date }, publicPath: string, etag: string): Response {
  const h = headers(publicPath, file.size, etag, file.mtime)
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: h })
  if (req.method === 'HEAD') return new Response(null, { status: 200, headers: h })
  return new Response(Readable.toWeb(createReadStream(file.path)) as ReadableStream, { status: 200, headers: h })
}

async function serveDocument(req: Request, doc: DocumentEntry, publicPath: string, cloud: boolean): Promise<Response | null> {
  if (!doc.filename) return null
  const local = await fileInside(UPLOAD_DIR, doc.filename)
  if (local) return fileResponse(req, local, publicPath, `"doc-${doc.id}-${local.size}-${local.mtime.getTime()}"`)
  if (!cloud) return null
  // Cloud storage: Payload's own file endpoint streams it (read access is public). The origin is the configured site URL, never the
  // request's Host header (which a client controls).
  const res = await fetch(new URL(`/api/documents/file/${encodeURIComponent(doc.filename)}`, env.NEXT_PUBLIC_SITE_URL), {
    method: req.method === 'HEAD' ? 'HEAD' : 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) return null
  const h = headers(publicPath, doc.filesize, `"doc-${doc.id}-${new Date(doc.updatedAt).getTime()}"`, new Date(doc.updatedAt))
  return new Response(req.method === 'HEAD' ? null : res.body, { status: 200, headers: h })
}

export async function serveDocumentPath(req: Request, segments: string[]): Promise<Response> {
  const publicPath = publicPathOf(segments)
  if (!publicPath) return notFound()
  let doc: DocumentEntry | null = null
  try {
    doc = await findDocument(publicPath)
  } catch {
    // No cache store (outside a Next request) or the cache failed: ask the database directly; if that fails too (database down),
    // the static copy, if any, still answers.
    doc = await findDocumentUncached(publicPath).catch(() => null)
  }
  if (doc) {
    // Not on local disk: the cached row may be stale (Payload renames and deletes on replace), so ask the database once more
    // before trying a cloud adapter's endpoint.
    const res =
      (await serveDocument(req, doc, publicPath, false)) ??
      (await findDocumentUncached(publicPath).then((fresh) => (fresh ? serveDocument(req, fresh, publicPath, true) : null), () => null))
    if (res) return res
  }
  const file = await fileInside(PUBLIC_DIR, publicPath)
  if (!file) return notFound()
  return fileResponse(req, file, publicPath, `"static-${file.size}-${file.mtime.getTime()}"`)
}
