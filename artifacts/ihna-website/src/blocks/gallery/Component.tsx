import type { GalleryBlock as Block, Media } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { mediaOf } from '@/components/blocks/media'
import type { BlockProps } from '../types'
import { GalleryClient } from './GalleryClient'

export function Gallery({ block, ctx }: BlockProps<Block>) {
  const shots = (block.images ?? [])
    .map((m) => mediaOf(m as number | Media))
    .filter((m): m is Media => !!m)
    .map((m, i) => ({ id: `${m.id}-${i}`, url: m.url!, alt: m.alt, width: m.width ?? 1600, height: m.height ?? 1200 }))
  if (!shots.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} onDark={block.tone === 'ink'} />
      <GalleryClient shots={shots} carousel={block.variant === 'carousel'} label={block.heading ?? 'Gallery'} />
    </Section>
  )
}
