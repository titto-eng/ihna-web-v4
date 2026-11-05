import type { CollectionConfig } from 'payload'
import { fieldRoles, isAdmin, publishedOrStaff, roles, staffOnly } from '@/lib/access'
import { postPathOf, URL_DATE_RE } from '@/lib/blog-paths'
import { previewUrl } from '@/lib/preview-url'
import { importGroup, pathField, seoExtras, slugField } from './shared/fields'
import { assertPathFree, contentHooks, validateEmbedHosts } from './shared/hooks'

// Blog posts (10-content-model §2, 70-urls-seo §5). A post lives at the URL it had on the old site (rule 1): `/blog/<urlDate>/<slug>/`
// when `urlDate` (YYYY/MM) is set, else `/blog/<slug>/`; the `news` category keeps `/news/<slug>/` (IHM). The other blog shape is an
// alias served by the blog route with this canonical (`postAliasPath`, src/lib/blog-paths.ts).
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'topic', 'publishedAt', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: { url: ({ data }) => previewUrl(data?.path ?? '/blog/') },
  },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 25 },
  defaultSort: '-publishedAt',
  access: {
    read: publishedOrStaff,
    create: roles('marketing'),
    update: roles('marketing'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: {
    beforeValidate: [
      validateEmbedHosts('posts'), // DEC-29 (posts hold Lexical only today; no-op until they get a layout)
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const slug = String(data.slug ?? originalDoc?.slug ?? '').trim()
        if (!slug) return data
        const category = (data.category ?? originalDoc?.category) as string | undefined
        const urlDate = String((data.urlDate !== undefined ? data.urlDate : originalDoc?.urlDate) ?? '').trim()
        const path = postPathOf({ slug, urlDate, category })
        await assertPathFree({ req, collection: 'posts', path, id: originalDoc?.id })
        data.path = path
        return data
      },
    ],
    ...contentHooks('posts', { docTags: (d) => [`post:${d.slug}`] }),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ required: true, unique: true, underscores: true }),
    pathField(),
    {
      name: 'urlDate',
      type: 'text',
      index: true,
      validate: (v: unknown) => !v || (typeof v === 'string' && URL_DATE_RE.test(v)) || 'YYYY/MM, e.g. 2024/06',
      admin: { position: 'sidebar', description: 'The YYYY/MM part of the live URL /blog/YYYY/MM/<slug>/ (empty = /blog/<slug>/). Kept from the old site; it is not the publish date. A published post cannot change it.' },
    },
    { name: 'category', type: 'select', required: true, index: true, defaultValue: 'blog', options: ['blog', 'news'], admin: { position: 'sidebar' } },
    { name: 'topic', type: 'relationship', relationTo: 'blogCategories', index: true, admin: { position: 'sidebar', description: 'Blog category shown on the post and card.' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true, admin: { position: 'sidebar', description: 'Old "breaking blog" flag.' } },
    { name: 'publishedAt', type: 'date', required: true, index: true, defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'author', type: 'text', admin: { position: 'sidebar' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'cardImage', type: 'upload', relationTo: 'media', admin: { description: 'Listing card crop; the hero image is used when empty.' } },
    { name: 'excerpt', type: 'textarea' },
    { name: 'readTime', type: 'number', min: 0, admin: { position: 'sidebar', description: 'Minutes' } },
    { name: 'content', type: 'richText', required: true },
    seoExtras(),
    importGroup({
      extra: [
        { name: 'apprunnerId', type: 'text', unique: true, index: true, access: { create: fieldRoles(), update: fieldRoles() }, admin: { readOnly: true, description: 'Id in the old App Runner content API (import key).' } },
        { name: 'sourceUpdatedAt', type: 'text', access: { create: fieldRoles(), update: fieldRoles() }, admin: { readOnly: true } },
      ],
    }),
  ],
}
