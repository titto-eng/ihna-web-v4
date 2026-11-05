import type { Field, FieldAccess, TextField } from 'payload'
import { blockConfigs } from '@/blocks'
import { fieldRoles } from '@/lib/access'
import { slugify } from '@/lib/paths'

export const REVIEW_STATUSES = ['auto', 'check', 'needs-rebuild', 'kh-unresolved', 'ok'] as const
export const IMPORT_CLASSES = ['A', 'B', 'C-lite', 'C', 'D', 'new'] as const

const options = (values: readonly string[]) => values.map((v) => ({ label: v, value: v }))

/**
 * The `layout` blocks field (letter L in 10-content-model). Blocks are defined once at config level
 * (`payload.config.ts` → `blocks`) and referenced by slug (DEC-6). Read lazily so blocks added to the
 * registry by the blocks module appear without touching this file.
 */
export const layoutField = (name = 'layout'): Field => ({
  name,
  type: 'blocks',
  blocks: [],
  blockReferences: blockConfigs.map((b) => b.slug) as never, // slugs of config-level blocks
})

/** Slug that is generated from another field when left empty. Kebab-case only. */
/** `underscores`: also allow `_` (blog posts: a few live App Runner URLs use underscores, and a URL never changes, rule 1). */
export const slugField = (opts: { from?: string; required?: boolean; unique?: boolean; underscores?: boolean } = {}): TextField => {
  const { from = 'title', required = false, unique = false, underscores = false } = opts
  const re = underscores ? /^[a-z0-9_-]+$/ : /^[a-z0-9-]+$/
  return {
    name: 'slug',
    type: 'text',
    required,
    unique,
    index: true,
    admin: { position: 'sidebar', description: 'URL segment: lower-case letters, numbers, hyphens. Generated from the title when empty.' },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return value.trim().toLowerCase()
          const source = data?.[from]
          return typeof source === 'string' && source.trim() ? slugify(source) : value
        },
      ],
    },
    validate: (v: unknown) => !v || (typeof v === 'string' && re.test(v)) || (underscores ? 'Lower-case letters, numbers, hyphens and underscores only' : 'Lower-case letters, numbers and hyphens only'),
  }
}

/** Computed URL path, written by the path hook. */
export const pathField = (): TextField => ({
  name: 'path',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', readOnly: true, description: 'Computed from the slug. Do not edit.' },
})

/** `seo` extras beside the plugin's title/description/image (`meta` group). */
export const seoExtras = (): Field => ({
  name: 'seo',
  type: 'group',
  label: 'Indexing and structured data',
  fields: [
    { name: 'noindex', type: 'checkbox', defaultValue: false },
    { name: 'canonical', type: 'text', admin: { description: 'Absolute or site-relative URL. Empty = the page itself.' } },
    { name: 'structuredData', type: 'json', admin: { description: 'JSON-LD object, merged into the generated block.' } },
  ],
})

/**
 * Import group (10-content-model §2). The system fields are admin-only to edit; marketing works the review
 * queue through `reviewStatus` (`ok` stamps reviewedBy/reviewedAt, see `stampReview`).
 */
export const importGroup = (opts: { uniqueWpId?: boolean; classes?: readonly string[]; extra?: Field[] } = {}): Field => {
  const { uniqueWpId = true, classes = IMPORT_CLASSES, extra = [] } = opts
  const system = { update: fieldRoles(), create: fieldRoles() }
  return {
    name: 'import',
    type: 'group',
    fields: [
      { name: 'wpId', type: 'number', unique: uniqueWpId, index: true, access: system, admin: { readOnly: true } },
      { name: 'importClass', type: 'select', index: true, options: options(classes), access: system, admin: { readOnly: true } },
      { name: 'reviewStatus', type: 'select', index: true, options: options(REVIEW_STATUSES) },
      { name: 'importReport', type: 'json', access: system, admin: { readOnly: true } },
      { name: 'reviewedBy', type: 'text', access: system, admin: { readOnly: true } },
      { name: 'reviewedAt', type: 'date', access: system, admin: { readOnly: true } },
      ...extra,
    ],
  }
}

/**
 * Locks every named field (recursing through tabs, rows, collapsibles) to `access` for create and update,
 * unless the field already sets its own. Used where finance may edit one field of a collection (`courses.fees`)
 * and marketing everything else (90-security §2, helper `lockFields`).
 */
export const lockFields = (fields: Field[], access: FieldAccess): Field[] =>
  fields.map((f): Field => {
    if (f.type === 'tabs') return { ...f, tabs: f.tabs.map((t) => ({ ...t, fields: lockFields(t.fields, access) })) }
    if (f.type === 'row' || f.type === 'collapsible') return { ...f, fields: lockFields(f.fields, access) }
    if ('name' in f && f.name && f.type !== 'join' && f.type !== 'ui') {
      const existing = ('access' in f && f.access) || {}
      return { ...f, access: { ...existing, create: existing.create ?? access, update: existing.update ?? access } } as Field
    }
    return f
  })
