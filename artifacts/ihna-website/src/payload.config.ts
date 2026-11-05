import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { gcsStorage } from '@payloadcms/storage-gcs'
import { storageOptions } from '../scripts/storage-client.mjs'

import { env } from './env'
import { collections } from './collections'
import { globals } from './globals'
import { blockConfigs } from './blocks'
import { jobsConfig } from './jobs'
import { buildEmailAdapter } from './lib/adapters/transport'
import { courseUrl, normalisePath, postUrl } from './lib/paths'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · IHNA CMS' },
    // Browser extensions (Grammarly, password managers) add attributes to <html>/<body> before React hydrates; don't treat that as an app error.
    suppressHydrationWarning: true,
  },
  collections,
  globals,
  blocks: blockConfigs, // DEC-6: defined once, referenced by `layout` fields via blockReferences
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  graphQL: { disable: true }, // DEC-14 / 90-security
  jobs: jobsConfig, // 40-enquiries: deliverEnquiry on queue `enquiries`
  email: buildEmailAdapter(), // Resend, or SMTP (Mailpit) in dev
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    blocksAsJSON: true, // D9: layouts are JSON; new block types need no migration
    // Dev pushes schema from the running app only; scripts (imports, seeds) must not race it (DISABLE_DB_PUSH=1).
    push: env.NODE_ENV === 'development' && process.env.DISABLE_DB_PUSH !== '1',
  }),
  sharp,
  upload: { limits: { fileSize: 50 * 1024 * 1024 }, requestSizeLimit: 51 * 1024 * 1024 }, // 90-security §4 Uploads: 50 MB per file (PDFs); `media` caps images at 20 MB in its hook
  // Pages, landing pages and redirects are code (src/app/(site)/**, src/content/redirects.ts); the SEO plugin covers the two
  // collections that render pages. `generateTitle` is the bare title: `site.titleTemplate` adds the suffix at render (70 §4).
  plugins: [
    gcsStorage({
      bucket: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID!,
      options: storageOptions,
      collections: {
        media: { prefix: 'ihna/media' },
        documents: { prefix: 'ihna/media/documents' },
      },
    }),
    seoPlugin({
      collections: ['courses', 'posts'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${doc?.title ?? ''}`,
      generateURL: ({ doc, collectionSlug }) => {
        const slug = String(doc?.slug ?? '')
        const path = doc?.path ?? (collectionSlug === 'courses' ? courseUrl(slug) : collectionSlug === 'posts' ? postUrl(slug) : '/')
        return `${env.NEXT_PUBLIC_SITE_URL}${normalisePath(String(path))}`
      },
    }),
  ],
})
