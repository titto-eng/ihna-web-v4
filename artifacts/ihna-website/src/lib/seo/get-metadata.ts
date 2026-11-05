import { site } from '@/content/site'
import { buildMetadata, type SeoDoc, type SeoFallback, type SeoOptions } from './metadata'

/** `buildMetadata` plus the site constants (default OG image, title template). Use from `generateMetadata`. */
export function getSeoMetadata(doc: SeoDoc | null | undefined, fallback: SeoFallback = {}, options: Omit<SeoOptions, 'settings'> = {}) {
  return buildMetadata(doc, fallback, { ...options, settings: site })
}
