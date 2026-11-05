export type Audience = 'domestic' | 'international'

// Renderer context (20-blocks §2): every block renderer receives { block, ctx }.
export type BlockCtx = {
  depth: number
  audience?: Audience
  course?: unknown
}

export const rootCtx: BlockCtx = { depth: 0 }

export type BlockProps<T> = { block: T; ctx?: BlockCtx }
