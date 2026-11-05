// People cards on /our-people/ (board, executive team): `cardGrid` cards inside `tabs`, one card per person, no staff doc behind them.
export type PersonCard = { title: string; image?: unknown; ref: Record<string, unknown> }

/** Every card in a tabs block's card grids, by reference so a caller can set `image` in place. */
export function peopleCards(layout: unknown): PersonCard[] {
  const out: PersonCard[] = []
  for (const block of Array.isArray(layout) ? layout : []) {
    const tabs = (block as { blockType?: string; tabs?: { blocks?: unknown[] }[] }).tabs
    if ((block as { blockType?: string }).blockType !== 'tabs' || !Array.isArray(tabs)) continue
    for (const tab of tabs)
      for (const inner of tab.blocks ?? []) {
        const b = inner as { blockType?: string; cards?: Record<string, unknown>[] }
        if (b.blockType === 'cardGrid') for (const c of b.cards ?? []) if (typeof c.title === 'string' && c.title) out.push({ title: c.title, image: c.image, ref: c })
      }
  }
  return out
}
