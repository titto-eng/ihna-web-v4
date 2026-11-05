import type { TeamGridBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { mediaOf } from '@/components/blocks/media'
import type { BlockProps } from '../types'
import { TeamGridClient } from './TeamGridClient'

export function TeamGrid({ block, ctx }: BlockProps<Block>) {
  const members = (block.members ?? []).map((m, i) => {
    const p = mediaOf(m.photo)
    return {
      id: m.id ?? `m-${i}`, name: m.name, role: m.role, bio: m.bio,
      photo: p ? { url: p.url!, alt: p.alt, width: p.width ?? 640, height: p.height ?? 800 } : null,
    }
  })
  if (!members.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} onDark={block.tone === 'ink'} />
      <TeamGridClient members={members} carousel={block.variant === 'carousel'} label={block.heading ?? 'Team'} />
    </Section>
  )
}
