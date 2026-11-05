import type { TestimonialsBlock, VideoEmbedBlock } from '@/payload-types'
import { parseVideoUrl } from '../embeds'

// Video testimonials (20-blocks `testimonials`): an inline item with a YouTube / Vimeo `videoUrl` plays inside its card.

type SiblingItem = { videoUrl?: unknown } | undefined

/** `quote` is required unless the item carries a video. */
export const quoteOrVideo = (v: unknown, { siblingData }: { siblingData?: unknown }): true | string =>
  (typeof v === 'string' && v.trim()) || parseVideoUrl(String((siblingData as SiblingItem)?.videoUrl ?? '')) ? true : 'Add a quote or a video link'

/** Empty, or a YouTube / Vimeo link. */
export const optionalVideoUrl = (v: unknown): true | string =>
  v == null || v === '' || parseVideoUrl(typeof v === 'string' ? v : null) ? true : 'Enter a YouTube or Vimeo link'

type Layout = ReadonlyArray<{ blockType?: string } & Record<string, unknown>>

/**
 * A run of two or more consecutive `videoEmbed` blocks (the imported course pages list student videos one after another)
 * becomes one `testimonials` carousel whose cards play the videos in place. Other blocks pass through unchanged.
 */
export function groupVideoRuns<T extends Layout[number]>(blocks: readonly T[]): (T | TestimonialsBlock)[] {
  const out: (T | TestimonialsBlock)[] = []
  let run: VideoEmbedBlock[] = []
  const flush = () => {
    if (run.length >= 2) {
      out.push({
        blockType: 'testimonials', variant: 'carousel', spacing: 'none', id: run[0].id ? `${run[0].id}-videos` : undefined,
        inline: run.map((v) => ({ id: v.id, name: v.title, videoUrl: v.url, photo: v.poster ?? null })),
      })
    } else out.push(...(run as unknown as T[]))
    run = []
  }
  for (const b of blocks) {
    if (b?.blockType === 'videoEmbed' && parseVideoUrl((b as unknown as VideoEmbedBlock).url)) run.push(b as unknown as VideoEmbedBlock)
    else { flush(); out.push(b) }
  }
  flush()
  return out
}
