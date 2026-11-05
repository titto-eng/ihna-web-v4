import type { ComponentType } from 'react'
import { blockComponents } from '@/blocks'
import { rootCtx, type BlockCtx } from '@/blocks/types'

export type AnyBlock = { blockType: string; id?: string | null } & Record<string, unknown>

const MAX_DEPTH = 3 // course section (depth 1) → tabs → accordion → leaf (20-blocks "Nesting")
const warned = new Set<string>()
const warnOnce = (key: string, msg: string) => {
  if (process.env.NODE_ENV === 'production' || warned.has(key)) return
  warned.add(key)
  console.warn(`[RenderBlocks] ${msg}`)
}

export async function RenderBlocks({ blocks, ctx = rootCtx }: { blocks?: AnyBlock[] | null; ctx?: BlockCtx }) {
  if (!blocks?.length) return null
  if (ctx.depth > MAX_DEPTH) {
    warnOnce('depth', `blocks nested deeper than ${MAX_DEPTH} levels are skipped`)
    return null
  }
  const rendered = await Promise.all(
    blocks.map(async (block, i) => {
      const load = (blockComponents as Record<string, (typeof blockComponents)[keyof typeof blockComponents]>)[block.blockType]
      if (!load) {
        warnOnce(`unknown:${block.blockType}`, `unknown block "${block.blockType}" skipped`)
        return null
      }
      const Component = (await load()) as unknown as ComponentType<{ block: AnyBlock; ctx: BlockCtx }>
      return <Component key={block.id ?? `${block.blockType}-${i}`} block={block} ctx={ctx} />
    }),
  )
  return <>{rendered}</>
}
