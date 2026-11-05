import type { Media } from '@/payload-types'

// An image written into a page file. The shape mirrors a `media` doc closely enough for `mediaOf` / `pickSize`,
// so every block renders it like an upload. `src` is a site path (`/api/media/file/<name>` for the imported media, or a
// file under /public). `sizes` are optional pre-cut variants; a block picks the one that fits its slot.
export type ImgSize = { url: string; width: number; height: number }
export type ImgSpec = {
  src: string
  alt?: string
  width?: number
  height?: number
  /** Only for non-image uploads (a PDF in a rich text), rendered as a link. */
  mimeType?: string
  /** Focal point in percent `[x, y]`, becomes `object-position`. */
  focal?: [number, number]
  sizes?: Partial<Record<'thumb' | 'card' | 'hero' | 'og', ImgSize>>
}

export function img(spec: ImgSpec): Media {
  const sizes: Record<string, ImgSize & { mimeType?: null; filesize?: null; filename?: null }> = {}
  for (const [k, v] of Object.entries(spec.sizes ?? {})) if (v) sizes[k] = { ...v }
  return {
    id: 0,
    url: spec.src,
    alt: spec.alt ?? '',
    width: spec.width ?? null,
    height: spec.height ?? null,
    mimeType: spec.mimeType ?? 'image/*',
    filename: spec.src.split('/').pop() ?? null,
    focalX: spec.focal?.[0] ?? null,
    focalY: spec.focal?.[1] ?? null,
    sizes: sizes as never,
    updatedAt: '',
    createdAt: '',
  } as unknown as Media
}
