import Image from '@/components/blocks/MediaImage'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CardGridBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mediaOf } from '@/components/blocks/media'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'

type CardData = NonNullable<Block['cards']>[number]

// Three looks, picked from the card's content (05 §4.5):
// - image cards: photo with a slow zoom, gradient wash and an arrow chip on hover;
// - link-only cards (no image, no body): compact tiles that flood with the brand gradient on hover;
// - text cards (body, no link): numbered feature cards with an accent bar.
function CardItem({ card, index }: { card: CardData; index: number }) {
  const image = mediaOf(card.image)
  const linkOnly = !image && !card.body && !!card.href
  const textOnly = !image && !card.href
  const portrait = !!image && (image.height ?? 0) > (image.width ?? 0) * 1.1
  let inner
  if (linkOnly) {
    inner = (
      <div className="group/card relative flex h-full min-h-28 items-center justify-between gap-5 overflow-hidden rounded-card border border-border bg-card p-6 transition-all duration-500 group-hover/link:-translate-y-1 group-hover/link:border-transparent group-hover/link:shadow-2xl group-hover/link:shadow-primary-strong/25">
        <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-br from-primary to-primary-strong transition-transform duration-500 ease-out group-hover/link:scale-y-100" />
        <span className="relative">
          {card.badge && <span className="label-mono mb-1 block text-[10px] text-primary-strong group-hover/link:text-secondary">{card.badge}</span>}
          <h3 className="text-lg leading-snug font-semibold transition-colors group-hover/link:text-ink-foreground" style={{ fontFamily: 'var(--font-sans)' }}>{card.title}</h3>
        </span>
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-strong transition-all duration-300 group-hover/link:rotate-45 group-hover/link:bg-secondary group-hover/link:text-ink">
          <ArrowUpRight aria-hidden className="size-5" />
        </span>
      </div>
    )
  } else if (textOnly) {
    inner = (
      <div className="group/card reveal relative h-full overflow-hidden rounded-card border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 md:p-8">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 group-hover/card:scale-x-100" />
        <span aria-hidden className="display grid size-12 place-items-center rounded-2xl bg-primary/10 text-xl text-primary-strong transition-colors duration-300 group-hover/card:bg-secondary group-hover/card:text-ink">{String(index + 1).padStart(2, '0')}</span>
        {card.badge && <Badge variant="secondary" className="label-mono mt-5 w-fit rounded-full px-3 text-[10px] tracking-widest">{card.badge}</Badge>}
        <h3 className="mt-5 text-xl leading-snug font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>{card.title}</h3>
        {card.body && <p className="mt-2 leading-relaxed text-muted-foreground">{card.body}</p>}
      </div>
    )
  } else {
    inner = (
      <Card className="group/card h-full gap-0 overflow-hidden py-0 transition-all duration-500 group-hover/link:-translate-y-1 group-hover/link:shadow-2xl group-hover/link:shadow-primary-strong/15">
        {image && (
          <div className="relative overflow-hidden">
            <Image
              src={image.url!}
              alt={image.alt ?? ''}
              width={image.width ?? 800}
              height={image.height ?? 600}
              sizes="(min-width: 1024px) 30vw, 90vw"
              // Portraits (people) keep a 4:5 frame anchored at the top, so faces are never cropped.
              className={cn('w-full object-cover transition-transform duration-700 ease-out group-hover/link:scale-105 group-hover/card:scale-105', portrait ? 'aspect-[4/5] object-top' : 'aspect-[4/3]')}
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-primary-strong/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/link:opacity-100" />
          </div>
        )}
        <CardContent className="flex flex-1 flex-col gap-3 p-6 md:p-7">
          {card.badge && <Badge variant="secondary" className="label-mono w-fit rounded-full px-3 text-[10px] tracking-widest">{card.badge}</Badge>}
          <h3 className="flex items-start justify-between gap-3 text-lg leading-snug font-semibold transition-colors group-hover/link:text-primary-strong" style={{ fontFamily: 'var(--font-sans)' }}>
            {card.title}
            {card.href && (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-strong transition-all duration-300 group-hover/link:rotate-45 group-hover/link:bg-secondary group-hover/link:text-ink">
                <ArrowUpRight aria-hidden className="size-4" />
              </span>
            )}
          </h3>
          {card.body && <p className="text-muted-foreground">{card.body}</p>}
        </CardContent>
      </Card>
    )
  }
  if (!card.href) return inner
  const external = /^https?:\/\//i.test(card.href)
  const cls = 'group/link block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2'
  return external
    ? <a href={card.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <Link href={card.href} className={cls}>{inner}</Link>
}

const grid: Record<string, string> = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }

export function CardGrid({ block, ctx }: BlockProps<Block>) {
  const cards = block.cards ?? []
  const cols = block.columns ?? '3'
  const items = cards.map((c, i) => <CardItem key={c.id ?? i} card={c} index={i} />)
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} intro={block.intro} onDark={block.tone === 'ink'} />
      {block.variant === 'carousel' ? (
        <CardCarousel perView={cols === '2' ? 2 : cols === '4' ? 4 : 3} label={block.heading ?? 'Cards'}>{items}</CardCarousel>
      ) : (
        <div className={cn('grid grid-cols-1 gap-5 md:gap-6', grid[cols])}>{items}</div>
      )}
    </Section>
  )
}
