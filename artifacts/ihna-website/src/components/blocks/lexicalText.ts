// Plain text from a Lexical editor state (for FAQPage JSON-LD). No rendering, no HTML.
type LexNode = { type?: string; text?: string; children?: LexNode[] }

const walk = (n: LexNode | undefined, out: string[]) => {
  if (!n) return
  if (typeof n.text === 'string') out.push(n.text)
  n.children?.forEach((c) => walk(c, out))
  if (['paragraph', 'heading', 'listitem', 'quote'].includes(n.type ?? '')) out.push(' ')
}

export function lexicalToText(state: unknown): string {
  const root = (state as { root?: LexNode } | null | undefined)?.root
  const out: string[] = []
  walk(root, out)
  return out.join('').replace(/\s+/g, ' ').trim()
}

export const blocksToText = (blocks: ReadonlyArray<Record<string, unknown>> | null | undefined): string =>
  (blocks ?? [])
    .map((b) => (b.blockType === 'richText' ? lexicalToText(b.content) : typeof b.body === 'string' ? b.body : ''))
    .filter(Boolean)
    .join(' ')
    .trim()

// JSON for <script type="application/ld+json">: "<" is escaped so content can never close the tag.
export const safeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
