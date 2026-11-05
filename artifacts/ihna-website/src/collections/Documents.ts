import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeValidateHook, CollectionConfig, PayloadRequest } from 'payload'
import { anyone, fieldRoles, isAdmin, roles, staffField } from '@/lib/access'
import { DOCUMENT_PREFIXES } from '@/content/documents'

// Policy, procedure and form PDFs, course brochures (picked on the course as `courses.brochure`) and handbooks. Each document is served at its old URL (`publicPath`) by
// src/app/(site)/pdf/[...path]/route.ts, so marketing replaces a file here without a deploy and the URL never changes (rule 1).

/** URL prefixes a document may live under: the site's old static stores (src/content/documents.ts, 70-urls-seo "Non-WP paths are kept literally"). */
export { DOCUMENT_PREFIXES } from '@/content/documents'

// `brochure` marks a course brochure: only these can be picked as `courses.brochure` (DEC-69).
export const DOCUMENT_CATEGORIES = ['policy', 'procedure', 'staff-policy', 'form', 'guide', 'handbook', 'brochure', 'other'] as const
export const DOCUMENT_AUDIENCES = ['students', 'staff', 'public'] as const

/** Where a document is listed on /policies-procedures/ (one document can appear in several tabs, each with its own position). */
export const DOCUMENT_SECTIONS = [
  { value: 'student-policies', label: 'Students: policies' },
  { value: 'student-procedures', label: 'Students: procedures' },
  { value: 'staff-policies', label: 'Staff: policies' },
  { value: 'staff-procedures', label: 'Staff: procedures' },
  { value: 'glossary', label: 'Glossary' },
] as const
export type DocumentSection = (typeof DOCUMENT_SECTIONS)[number]['value']

/** Old URLs that serve another document's file with 200 (src/content/documents.ts). */
export { DOCUMENT_ALIASES } from '@/content/documents'

/** Decodes a pasted, percent-encoded URL path and trims it; never throws. Host and query are dropped. */
export function normalisePublicPath(input: string): string {
  let p = input.trim()
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname
    } catch {
      /* keep */
    }
  }
  p = p.replace(/[?#].*$/, '')
  try {
    p = decodeURIComponent(p)
  } catch {
    /* keep the raw value; validation reports it */
  }
  return p.startsWith('/') ? p : `/${p}`
}

/** True, or the reason the path cannot be a document URL. Pure, so the route and the tests share it. */
export function validatePublicPath(value: unknown): true | string {
  if (typeof value !== 'string' || !value) return 'A public path is required, e.g. /pdf/policies/Privacy_Policy.pdf'
  if (!DOCUMENT_PREFIXES.some((p) => value.startsWith(p))) return `The public path must start with ${DOCUMENT_PREFIXES.join(', ')}`
  if (!/\.pdf$/i.test(value)) return 'The public path must end with .pdf'
  const segments = value.split('/').slice(1)
  if (segments.some((s) => !s || s === '.' || s === '..')) return 'The public path cannot contain empty, "." or ".." segments'
  if (/[\0\\?#%]/.test(value) || /[\u0000-\u001f]/.test(value)) return 'The public path cannot contain \\, ?, #, % or control characters (type it decoded)'
  return true
}

/** Cache tags of the document index (src/app/(site)/pdf/documents.ts) and of one document. */
export const documentTags = (doc?: { publicPath?: unknown } | null): string[] => [
  'documents',
  'collection:documents',
  ...(doc && typeof doc.publicPath === 'string' ? [`document:${doc.publicPath}`] : []),
]

/**
 * Expire the tags at once (`{ expire: 0 }`), not stale-while-revalidate like the other collections: Payload deletes the old file when
 * a new one is uploaded, so a stale index would point at a file that is gone. Never throws (outside Next there is no cache store);
 * skipped for imports, which call /api/revalidate themselves.
 */
const expireDocumentTags = (req: PayloadRequest, docs: ({ publicPath?: unknown } | null | undefined)[]) => {
  if (req.context?.importing || req.context?.disableRevalidate) return
  for (const tag of new Set(docs.flatMap((d) => documentTags(d)))) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch {
      /* no Next request context (scripts, tests) */
    }
  }
}
const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  expireDocumentTags(req, [doc, previousDoc])
  return doc
}
const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  expireDocumentTags(req, [doc])
  return doc
}

const normalisePath: CollectionBeforeValidateHook = ({ data }) => {
  if (data && typeof data.publicPath === 'string') data.publicPath = normalisePublicPath(data.publicPath)
  return data
}

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publicPath', 'updatedAt'],
    listSearchableFields: ['title', 'publicPath'],
    description: 'Policy, procedure and form PDFs, course brochures and handbooks. Replace the file and save: the public URL stays the same.',
  },
  defaultSort: 'title',
  access: {
    read: anyone,
    create: roles('marketing'),
    update: roles('marketing'),
    delete: isAdmin,
  },
  upload: {
    // Same storage as `media`: local disk (gitignored /media tree) until a cloud storage adapter is configured for both.
    staticDir: 'media/documents',
    mimeTypes: ['application/pdf'],
  },
  hooks: {
    beforeValidate: [normalisePath],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, defaultValue: 'policy', options: DOCUMENT_CATEGORIES.map((v) => ({ label: v, value: v })) },
        { name: 'audience', type: 'select', required: true, defaultValue: 'public', options: DOCUMENT_AUDIENCES.map((v) => ({ label: v, value: v })) },
        { name: 'effectiveDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
    {
      name: 'publicPath',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      // Format first, then a friendly uniqueness check before the file is written (the unique index is the backstop).
      validate: async (value: unknown, { req, id }: { req: PayloadRequest; id?: number | string }) => {
        const valid = validatePublicPath(value)
        if (valid !== true) return valid
        const taken = await req.payload.find({
          collection: 'documents',
          where: { publicPath: { equals: value }, ...(id != null ? { id: { not_equals: id } } : {}) },
          limit: 1,
          depth: 0,
          pagination: false,
          overrideAccess: true,
          req,
          select: { title: true },
        })
        return taken.docs.length ? `Another document already uses ${String(value)} ("${taken.docs[0].title}")` : true
      },
      // Rule 1: a live URL never changes. Marketing sets it when creating a document; only an admin can move it later.
      access: { create: fieldRoles('marketing'), update: fieldRoles() },
      admin: {
        position: 'sidebar',
        description: 'The URL this file is served at, e.g. /pdf/policies/Privacy_Policy.pdf. Do not change it once it is live.',
      },
    },
    {
      name: 'listings',
      type: 'array',
      admin: { description: 'Where this document is listed on /policies-procedures/ (lower order first).', initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'section', type: 'select', required: true, options: DOCUMENT_SECTIONS.map((s) => ({ ...s })) },
            { name: 'order', type: 'number', required: true, defaultValue: 0 },
          ],
        },
      ],
    },
    { name: 'notes', type: 'textarea', access: { read: staffField }, admin: { description: 'Internal notes (version, owner, review date). Not shown on the site.' } },
  ],
}
