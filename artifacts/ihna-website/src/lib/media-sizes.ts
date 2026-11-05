import { localUrl } from '@/components/blocks/media'
import type { Media } from '@/payload-types'

// DEC-25: CMS media renders with Payload's generated sizes and `unoptimized` on next/image (MediaImage does the latter).
// This picks the generated size that fits the slot, falling back to the original when the source was narrower than the size
// (Payload does not enlarge, so that size is then null).
export type SizeName = 'thumb' | 'card' | 'hero'
export type PickedImage = { url: string; width: number; height: number; alt: string; position?: string }

/** `focalX`/`focalY` (percent) set in the admin become `object-position`, so a crop keeps what the editor marked. */
export const objectPosition = (m: Pick<Media, 'focalX' | 'focalY'> | null | undefined): string | undefined =>
  m && typeof m.focalX === 'number' && typeof m.focalY === 'number' ? `${m.focalX}% ${m.focalY}%` : undefined

export function pickSize(m: Media | null | undefined, name: SizeName): PickedImage | null {
  if (!m?.url) return null
  const s = m.sizes?.[name]
  const useSize = s?.url && s.width && s.height
  return {
    url: localUrl(useSize ? (s.url as string) : m.url),
    width: (useSize ? s.width : m.width) ?? 800,
    height: (useSize ? s.height : m.height) ?? 600,
    alt: m.alt ?? '',
    position: objectPosition(m),
  }
}
