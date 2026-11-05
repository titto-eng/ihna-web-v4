import { revalidateTag } from 'next/cache'
import { ValidationError } from 'payload'
import { hostAllowed, isMapEmbedUrl } from '@/blocks/embeds'
import { site } from '@/content/site'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

type Doc = Record<string, unknown>
export type UrlCollection = 'courses' | 'posts'

// ---------------------------------------------------------------------------------------------
// Revalidation (10-content-model hook 3, 00-architecture "Publish hook")
// ---------------------------------------------------------------------------------------------

/** Never throws: outside Next (scripts, tests) `revalidateTag` has no store and is a no-op. */
export const revalidateTags = (tags: string[]): void => {
  for (const tag of new Set(tags)) {
    try {
      revalidateTag(tag, 'max')
    } catch {
      /* no Next request context */
    }
  }
}

const skipRevalidate = (req: PayloadRequest): boolean => Boolean(req.context?.importing || req.context?.disableRevalidate)

// Both tag spellings are emitted: `collection:<slug>` (10) and the bare `<slug>` (00).
const collectionTags = (slug: string, extra: string[] = []): string[] =>
  [slug, ...extra].flatMap((s) => [s, `collection:${s}`])

// A doc is live when the collection has no drafts or the doc is published.
const isLive = (doc: Doc | undefined | null): boolean => !doc || doc._status === undefined || doc._status === 'published'

export type RevalidateOptions = {
  /** Doc tags, e.g. `page:/about/`. Called for the new doc and the previous one (slug/path change). */
  docTags?: (doc: Doc) => string[]
  /** Extra collection tags (lookups also tag `courses`). */
  alsoCollections?: string[]
  /** Plain tags such as `sitemap` or `nav`. */
  extraTags?: string[]
}

const tagsFor = (slug: string, opts: RevalidateOptions, docs: (Doc | undefined)[]): string[] => [
  ...collectionTags(slug, opts.alsoCollections),
  ...(opts.extraTags ?? []),
  ...docs.flatMap((d) => (d && Object.keys(d).length && opts.docTags ? opts.docTags(d) : [])),
]

export const revalidateAfterChange =
  (slug: string, opts: RevalidateOptions = {}): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req }) => {
    if (skipRevalidate(req)) return doc
    if (!isLive(doc as Doc) && !isLive(previousDoc as Doc)) return doc
    revalidateTags(tagsFor(slug, opts, [doc as Doc, previousDoc as Doc]))
    return doc
  }

export const revalidateAfterDelete =
  (slug: string, opts: RevalidateOptions = {}): CollectionAfterDeleteHook =>
  ({ doc, req }) => {
    if (skipRevalidate(req)) return doc
    revalidateTags(tagsFor(slug, opts, [doc as Doc]))
    return doc
  }

export const revalidateGlobalAfterChange =
  (slug: string, extraTags: string[] = []): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    if (skipRevalidate(req)) return doc
    revalidateTags([`global:${slug}`, ...extraTags])
    return doc
  }

/** Standard hook pair for a public collection. */
export const revalidateHooks = (slug: string, opts: RevalidateOptions = {}) => ({
  afterChange: [revalidateAfterChange(slug, opts)],
  afterDelete: [revalidateAfterDelete(slug, opts)],
})

// ---------------------------------------------------------------------------------------------
// Path validation (hook 1)
// ---------------------------------------------------------------------------------------------

const fail = (collection: string, message: string, field = 'slug'): never => {
  throw new ValidationError({ collection, errors: [{ message, path: field }] })
}

const sameDoc = (value: unknown, id: unknown): boolean => {
  const v = value && typeof value === 'object' ? (value as { id?: unknown }).id : value
  return id != null && String(v) === String(id)
}

/** Rejects a URL that another document of the same collection already uses. */
export async function assertPathFree(args: {
  req: PayloadRequest
  collection: UrlCollection
  path: string
  id?: number | string | null
  field?: string
}): Promise<void> {
  const { req, collection, path, id, field = 'slug' } = args
  const { payload } = req
  const find = async (slug: UrlCollection, withSelfExcluded: boolean) =>
    (
      await payload.find({
        collection: slug,
        where: { path: { equals: path }, ...(withSelfExcluded && id != null ? { id: { not_equals: id } } : {}) },
        limit: 1,
        depth: 0,
        pagination: false,
        overrideAccess: true,
        req,
      })
    ).docs[0]

  if (await find(collection, true)) fail(collection, `Another ${collection} document already uses ${path}`, field)

}

// ---------------------------------------------------------------------------------------------
// 301 on URL change (hook 2)
// ---------------------------------------------------------------------------------------------

const liveKey = (collection: string, id: unknown) => `${collection}:${id}`

/**
 * beforeChange: remember the URL the doc has *live* right now. With drafts, `previousDoc` is the latest
 * (possibly draft) version, so it cannot tell us which URL was public. The main table can.
 */
export const captureLiveUrl =
  (collection: UrlCollection): CollectionBeforeChangeHook =>
  async ({ data, req, originalDoc, operation }) => {
    if (operation !== 'update' || originalDoc?.id == null) return data
    try {
      const live = (await req.payload.findByID({
        collection,
        id: originalDoc.id,
        depth: 0,
        draft: false,
        overrideAccess: true,
        req,
      })) as unknown as Doc
      const store = ((req.context.liveUrls as Record<string, string | null> | undefined) ??= {})
      store[liveKey(collection, originalDoc.id)] = live._status === undefined || live._status === 'published' ? ((live.path as string) ?? null) : null
    } catch {
      /* not found: nothing was live */
    }
    return data
  }

/**
 * beforeChange: a published doc keeps its URL (rule 1). There is no redirects collection, so a URL change
 * is refused with instructions; a developer adds the old URL to src/content/redirects.ts first, then saves with `context.allowUrlChange`.
 */
export const refuseUrlChange =
  (collection: UrlCollection): CollectionBeforeChangeHook =>
  ({ data, req, originalDoc, operation }) => {
    if (operation !== 'update' || originalDoc?.id == null || req.context?.allowUrlChange || req.context?.importing) return data
    const oldUrl = (req.context.liveUrls as Record<string, string | null> | undefined)?.[liveKey(collection, originalDoc.id)]
    const newUrl = (data as Doc | undefined)?.path as string | undefined
    const publishing = ((data as Doc | undefined)?._status ?? (originalDoc as Doc)._status) === 'published'
    if (oldUrl && newUrl && oldUrl !== newUrl && publishing) {
      fail(collection, `This ${collection === 'courses' ? 'course' : 'post'} is live at ${oldUrl}. A live URL never changes (rule 1): ask a developer to add a redirect in src/content/redirects.ts first.`)
    }
    return data
  }

// ---------------------------------------------------------------------------------------------
// Review stamping (hook 4)
// ---------------------------------------------------------------------------------------------

/** `ok` is set only by a person; stamps reviewedBy/reviewedAt when it is. Scripts cannot set it. */
export const stampReview: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const imp = data?.import as Record<string, unknown> | undefined
  if (!imp || imp.reviewStatus !== 'ok') return data
  const was = (originalDoc?.import as Record<string, unknown> | undefined)?.reviewStatus
  if (was === 'ok') return data
  if (!req.user) {
    imp.reviewStatus = was ?? 'check'
    return data
  }
  imp.reviewedBy = (req.user as { email?: string }).email ?? String(req.user.id)
  imp.reviewedAt = new Date().toISOString()
  return data
}

/**
 * The hooks every URL-bearing content collection shares, in a fixed order:
 * capture live URL → refuse a URL change on a live doc → stamp review → revalidate.
 */
export const contentHooks = (collection: UrlCollection, revalidate: RevalidateOptions) => ({
  beforeChange: [captureLiveUrl(collection), refuseUrlChange(collection), stampReview],
  afterChange: [revalidateAfterChange(collection, { extraTags: ['sitemap'], ...revalidate })],
  afterDelete: [revalidateAfterDelete(collection, { extraTags: ['sitemap'], ...revalidate })],
})

// ---------------------------------------------------------------------------------------------
// Embed host check (DEC-29): iframeEmbed / mapEmbed hosts are validated at save time, not in the block config
// ---------------------------------------------------------------------------------------------

type Node = Record<string, unknown>

/** Every iframeEmbed / mapEmbed found anywhere below `value` (layout, tabs[].blocks, accordion items[].blocks). */
export function findEmbeds(value: unknown, found: { type: 'iframeEmbed' | 'mapEmbed'; url: string }[] = []) {
  if (Array.isArray(value)) value.forEach((v) => findEmbeds(v, found))
  else if (value && typeof value === 'object') {
    const n = value as Node
    if (n.blockType === 'iframeEmbed') found.push({ type: 'iframeEmbed', url: String(n.url ?? '') })
    else if (n.blockType === 'mapEmbed') found.push({ type: 'mapEmbed', url: String(n.embedUrl ?? '') })
    for (const v of Object.values(n)) if (v && typeof v === 'object') findEmbeds(v, found)
  }
  return found
}

/** Messages for embeds whose host is neither built in nor in `allowedHosts`. Pure, so it is unit-testable. */
export function disallowedEmbeds(layout: unknown, allowedHosts: string[]): string[] {
  return findEmbeds(layout).flatMap((e) => {
    if (e.type === 'mapEmbed') return isMapEmbedUrl(e.url) ? [] : [`mapEmbed ${e.url} is not a Google Maps embed link`]
    return hostAllowed(e.url, allowedHosts) ? [] : [`iframeEmbed host is not allowed: ${e.url}`]
  })
}

/**
 * beforeValidate for collections with a `layout`: rejects an iframe whose host is not on
 * `site.allowedEmbedHosts` (src/content/site.ts) plus the fixed list (DEC-5, DEC-29). Runs on every write, including imports.
 */
export const validateEmbedHosts =
  (collection: string, field = 'layout'): CollectionBeforeValidateHook =>
  ({ data }) => {
    const layout = (data as Doc | undefined)?.[field]
    if (!layout || !findEmbeds(layout).length) return data
    const errors = disallowedEmbeds(layout, [...site.allowedEmbedHosts])
    if (errors.length) throw new ValidationError({ collection, errors: errors.map((message) => ({ message, path: field })) })
    return data
  }
