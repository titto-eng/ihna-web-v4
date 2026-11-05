import { describe, expect, it, vi } from 'vitest'
import type { ReactElement, ReactNode } from 'react'
import { defaults } from '@/blocks/defaults'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { html } from '../templates/html'

// DEC-6 / 20-blocks "Nesting": a course section layout renders at depth 1, so tabs > accordion > leaf puts the leaf at depth 3.
// Radix renders a closed accordion item's content only on open; render every item so the nested leaf is observable.
vi.mock('@/blocks/accordion/AccordionClient', () => ({
  AccordionClient: ({ items }: { items: { id: string; content: ReactNode }[] }) => <>{items.map((i) => <div key={i.id}>{i.content}</div>)}</>,
}))

const lexical = (text: string) => ({
  root: { type: 'root', version: 1, direction: null, format: '', indent: 0, children: [{ type: 'paragraph', version: 1, direction: null, format: '', indent: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})

const nested: AnyBlock[] = [
  {
    ...defaults.tabs,
    tabs: [{ label: 'Fees', blocks: [{ ...defaults.accordion, variant: 'plain', items: [{ title: 'Domestic', blocks: [{ blockType: 'richText', content: lexical('Leaf inside tabs and accordion') }] }] }] }],
  } as AnyBlock,
]

describe('RenderBlocks nesting depth', () => {
  it('renders tabs > accordion > richText inside a course section (depth 1)', async () => {
    const markup = await html((await RenderBlocks({ blocks: nested, ctx: { depth: 1 } })) as ReactElement)
    expect(markup).toContain('Leaf inside tabs and accordion')
  })

  it('keeps a finite guard below the deepest level the content model produces', async () => {
    expect(await RenderBlocks({ blocks: [{ ...defaults.richText }], ctx: { depth: 3 } })).not.toBeNull()
    expect(await RenderBlocks({ blocks: [{ ...defaults.richText }], ctx: { depth: 4 } })).toBeNull()
  })
})
