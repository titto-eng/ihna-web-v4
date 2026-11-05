import type { MapEmbedBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { isMapEmbedUrl } from '../embeds'
import type { BlockProps } from '../types'

export function MapEmbed({ block, ctx }: BlockProps<Block>) {
  if (!isMapEmbedUrl(block.embedUrl)) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <figure>
        <iframe
          src={block.embedUrl}
          title={block.caption || 'Map'}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full rounded-card border border-border md:aspect-[21/9]"
        />
        {block.caption && <figcaption className="mt-3 text-sm text-muted-foreground">{block.caption}</figcaption>}
      </figure>
    </Section>
  )
}
