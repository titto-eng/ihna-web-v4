import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import { site } from '@/content/site'
import { buildMetadata } from '@/lib/seo/metadata'

export type PageMeta = {
  title: string
  path: string
  /** `<title>` when it should differ from the page heading. */
  metaTitle?: string
  description?: string
  noindex?: boolean
  canonical?: string
  image?: Media
}

/** Metadata for a hardcoded page: title template, canonical, robots and OG from the site constants (70-urls-seo §4). */
export function pageMetadata(m: PageMeta): Metadata {
  return buildMetadata(
    { title: m.title, path: m.path, meta: { title: m.metaTitle, description: m.description, image: m.image }, seo: { noindex: m.noindex, canonical: m.canonical } },
    {},
    { settings: site },
  )
}
