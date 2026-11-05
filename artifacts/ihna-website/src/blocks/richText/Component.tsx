import type { RichTextBlock as RichTextBlockType } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Prose } from '@/components/layout/Prose'
import type { BlockProps } from '../types'

export function RichText({ block, ctx }: BlockProps<RichTextBlockType>) {
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <Prose data={block.content} className={block.width === 'wide' ? 'max-w-none' : undefined} />
    </Section>
  )
}
