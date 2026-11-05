import Image from '@/components/blocks/MediaImage'
import type { LogoStripBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { mediaOf } from '@/components/blocks/media'
import type { BlockProps } from '../types'

export function LogoStrip({ block, ctx }: BlockProps<Block>) {
  const logos = (block.logos ?? []).map((l) => ({ ...l, file: mediaOf(l.logo) })).filter((l) => l.file)
  if (!logos.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} className="mb-8" onDark={block.tone === 'ink'} />
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
        {logos.map((l, i) => {
          const img = <Image src={l.file!.url!} alt={l.alt} width={l.file!.width ?? 240} height={l.file!.height ?? 96} className="h-12 w-auto max-w-[10rem] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
          return (
            <li key={l.id ?? i}>
              {l.href ? <a href={l.href} target="_blank" rel="noopener noreferrer">{img}</a> : img}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
