import type { AccordionBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { blocksToText, safeJsonLd } from '@/components/blocks/lexicalText'
import { cn } from '@/lib/cn'
import { rootCtx, type BlockProps } from '../types'
import { AccordionClient } from './AccordionClient'

export function Accordion({ block, ctx = rootCtx }: BlockProps<Block>) {
  const items = (block.items ?? []).filter((i) => i.title)
  if (!items.length) return null
  const child = { ...ctx, depth: ctx.depth + 1 }
  const entries = items.map((it, i) => ({
    id: it.id ?? `item-${i}`,
    title: it.title,
    content: <RenderBlocks blocks={it.blocks as AnyBlock[] | undefined} ctx={child} />,
  }))
  const jsonLd = block.variant !== 'plain' && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .map((it) => ({ '@type': 'Question', name: it.title, acceptedAnswer: { '@type': 'Answer', text: blocksToText(it.blocks as Record<string, unknown>[] | undefined) } }))
      .filter((q) => q.acceptedAnswer.text),
  }
  const side = Boolean(block.heading || block.intro)
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx.depth}>
      <div className={cn('grid gap-12', side && ctx.depth === 0 && 'lg:grid-cols-[0.8fr_1.2fr]')}>
        {side && (
          <div>
            <SectionHeader heading={block.heading} className="mb-0" />
            {block.intro && <p className="mt-6 text-muted-foreground">{block.intro}</p>}
          </div>
        )}
        <AccordionClient items={entries} />
      </div>
      {jsonLd && jsonLd.mainEntity.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      )}
    </Section>
  )
}
