import type { TabsBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { rootCtx, type BlockProps } from '../types'
import { TabsClient } from './TabsClient'

export function Tabs({ block, ctx = rootCtx }: BlockProps<Block>) {
  const tabs = block.tabs ?? []
  if (!tabs.length) return null
  const child = { ...ctx, depth: ctx.depth + 1 }
  const entries = tabs.map((t, i) => ({
    id: t.id ?? `tab-${i}`,
    label: t.label,
    anchorId: t.anchorId,
    content: <RenderBlocks blocks={t.blocks as AnyBlock[] | undefined} ctx={child} />,
  }))
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx.depth}>
      <TabsClient tabs={entries} variant={block.variant ?? 'underline'} />
    </Section>
  )
}
