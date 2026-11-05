import type { ImportContext } from './context'
import { assertNoLegacyMarkup } from './assert-clean'
import { EXTRACTOR_VERSION } from './config'
import { fingerprint, sha } from './hash'

// Idempotent write for imported documents (30-import §7.3): key = `import.wpId` (or `import.apprunnerId` for App Runner posts);
// same sourceHash → skipped; an admin edit (fingerprint of the stored content ≠ the fingerprint recorded at import) → conflict,
// skipped unless --force.
export type Upserted = { outcome: 'created' | 'updated' | 'skipped' | 'conflict' | 'failed'; id?: number | string; path?: string; reviewStatus?: string }

type Collection = 'posts'
export type UpsertInput = {
  collection: Collection
  /** WordPress id (import key `import.wpId`); ignored when `apprunnerId` is given. */
  wpId?: number
  /** App Runner id (import key `import.apprunnerId`). */
  apprunnerId?: string
  /** `_status` to write (default `published`). */
  status?: 'published' | 'draft'
  /** Extra system fields written into the `import` group (e.g. `sourceUpdatedAt`). */
  importExtra?: Record<string, unknown>
  /** Everything the importer decides: title, slug, template, layout/content, parent, ... (no `import` group). */
  data: Record<string, unknown>
  /** The field holding the imported content, used for the edit-conflict fingerprint. */
  contentField: 'layout' | 'content'
  /** Raw source the content came from; same source + same extractor version = nothing to do. */
  source: unknown
  importClass?: string
  confidence?: number
  reviewStatus: 'auto' | 'check' | 'needs-rebuild' | 'kh-unresolved'
  reasons: string[]
  /** Expected URL; the written document must resolve to it (rule 1). */
  path: string
  extraReport?: Record<string, unknown>
}

type ImportGroup = { reviewStatus?: string | null; importReport?: { sourceHash?: string; contentHash?: string } | null }

export async function upsertImported(ctx: ImportContext, input: UpsertInput): Promise<Upserted> {
  const { payload, report } = ctx
  const { collection, data, contentField, path } = input
  const keyField = input.apprunnerId ? 'import.apprunnerId' : 'import.wpId'
  const wpId: string | number = input.apprunnerId ?? input.wpId ?? ''
  if (wpId === '') throw new Error('upsertImported: wpId or apprunnerId is required')
  const sourceHash = sha({ v: EXTRACTOR_VERSION, source: input.source, data: { ...data, [contentField]: undefined } })
  const contentHash = fingerprint(data[contentField])
  assertNoLegacyMarkup(data[contentField], `${collection}/${wpId}`)

  const found = await payload.find({ collection, where: { [keyField]: { equals: wpId } }, limit: 1, depth: 0, overrideAccess: true })
  const existing = found.docs[0] as unknown as (Record<string, unknown> & { id: number | string; import?: ImportGroup }) | undefined

  let reviewStatus: string = input.reviewStatus
  const reasons = [...input.reasons]
  if (existing) {
    const stored = existing.import?.importReport
    if (stored?.sourceHash === sourceHash && !ctx.args.force) {
      report.skipped++
      return { outcome: 'skipped', id: existing.id, path }
    }
    if (stored?.contentHash && fingerprint(existing[contentField]) !== stored.contentHash && !ctx.args.force) {
      report.skipped++
      report.conflicts = Number(report.conflicts ?? 0) + 1
      report.reviewQueue.push({ id: wpId, path, reasons: ['edited-in-admin'] })
      return { outcome: 'conflict', id: existing.id, path }
    }
    if (existing.import?.reviewStatus === 'ok') {
      reviewStatus = 'check'
      reasons.push('source-changed')
    }
  } else {
    const holder = await payload.find({ collection, where: { path: { equals: path } }, limit: 1, depth: 0, overrideAccess: true })
    if (holder.docs[0]) {
      report.skipped++
      report.reviewQueue.push({ id: wpId, path, reasons: ['path-held-by-hand-made-doc'] })
      return { outcome: 'skipped', id: holder.docs[0].id, path }
    }
  }

  const payloadData = {
    ...data,
    _status: input.status ?? 'published',
    import: {
      ...(input.apprunnerId ? { apprunnerId: input.apprunnerId } : { wpId }),
      ...input.importExtra,
      ...(input.importClass ? { importClass: input.importClass } : {}),
      ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
      reviewStatus,
      importedAt: new Date().toISOString(),
      importReport: { sourceHash, contentHash, reasons, extractor: EXTRACTOR_VERSION, ...input.extraReport },
    },
  }
  if (ctx.dry) {
    if (existing) report.updated++
    else report.created++
    return { outcome: existing ? 'updated' : 'created', path, reviewStatus }
  }
  try {
    const args = { collection, data: payloadData, ...ctx.opts } as never
    const doc = (existing
      ? await payload.update({ ...(args as object), id: existing.id } as never)
      : await payload.create(args)) as { id: number | string; path?: string }
    if (doc.path !== path) throw new Error(`stored path ${doc.path} is not ${path}`)
    if (existing) report.updated++
    else report.created++
    return { outcome: existing ? 'updated' : 'created', id: doc.id, path, reviewStatus }
  } catch (e) {
    const detail = (e as { data?: { errors?: { message?: string; path?: string }[] } }).data?.errors?.map((x) => `${x.path}: ${x.message}`).join('; ')
    report.failed.push({ id: wpId, reason: `${e instanceof Error ? e.message : String(e)}${detail ? ` (${detail})` : ''}` })
    return { outcome: 'failed', path }
  }
}
