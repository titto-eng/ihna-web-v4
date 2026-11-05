import type { VideoEmbedBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { mediaOf } from '@/components/blocks/media'
import { parseVideoUrl, videoSrc } from '../embeds'
import type { BlockProps } from '../types'
import { VideoPlayer } from './VideoPlayer'

// The iframe src is built from the parsed provider + id, never from the stored URL (20 "VideoEmbed allowlist").
export function VideoEmbed({ block, ctx }: BlockProps<Block>) {
  const ref = parseVideoUrl(block.url)
  if (!ref) return null
  const poster = mediaOf(block.poster)
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div className="mx-auto max-w-4xl">
        <VideoPlayer
          src={videoSrc(ref)}
          title={block.title}
          lightbox={block.variant === 'lightbox'}
          poster={poster ? { url: poster.url!, alt: poster.alt, width: poster.width ?? 1280, height: poster.height ?? 720 } : null}
        />
      </div>
    </Section>
  )
}
