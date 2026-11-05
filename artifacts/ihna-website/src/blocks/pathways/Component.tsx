import type { PathwaysBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import type { BlockProps } from '../types'
import { PathwaysClient } from './PathwaysClient'

export function Pathways({ block, ctx }: BlockProps<Block>) {
  const paths = (block.paths ?? []).map((p, i) => ({
    id: p.id ?? `path-${i}`, label: p.label, title: p.title, tagline: p.tagline, structure: p.structure, body: p.body, suits: p.suits,
    advantages: (p.advantages ?? []).map((a) => a.text), progression: p.progression, notice: p.notice,
    ctas: (p.ctas ?? []).map((c) => ({ ...c, style: c.style ?? 'primary' })),
  }))
  if (!paths.length) return null
  // BON look: this section is always ink.
  return (
    <Section tone="ink" spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} onDark />
      <PathwaysClient paths={paths} />
    </Section>
  )
}
