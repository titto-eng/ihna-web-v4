import Image from '@/components/blocks/MediaImage'
import { Quote } from 'lucide-react'
import type { TestimonialsBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { mediaOf } from '@/components/blocks/media'
import { cn } from '@/lib/cn'
import { parseVideoUrl, videoSrc } from '../embeds'
import { VideoPlayer } from '../videoEmbed/VideoPlayer'
import { QuoteText } from './QuoteText'
import type { BlockProps } from '../types'

type Item = NonNullable<Block['inline']>[number]

const CARD_SIZES = '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw'
/** Quotes longer than this get a "Read more" toggle in carousel and grid cards. */
const LONG_QUOTE = 280

function Caption({ item, photo }: { item: Item; photo: ReturnType<typeof mediaOf> }) {
  return (
    <figcaption className="flex items-center gap-3">
      {photo && <Image src={photo.url!} alt="" width={96} height={96} className="size-12 rounded-full object-cover" />}
      <span>
        <span className="block font-semibold">{item.name}</span>
        {item.role && <span className="text-sm text-muted-foreground">{item.role}</span>}
      </span>
    </figcaption>
  )
}

function Testimonial({ item, large }: { item: Item; large?: boolean }) {
  const photo = mediaOf(item.photo)
  const video = parseVideoUrl(item.videoUrl)
  if (video) {
    // The photo is the poster; the iframe loads only after play (VideoPlayer facade), inside the card.
    return (
      <Card className="h-full gap-0 py-0" data-testimonial="video">
        <figure className="flex h-full flex-col">
          <div className="p-2">
            <VideoPlayer
              compact
              src={videoSrc(video)}
              title={`Video testimonial: ${item.name}`}
              sizes={large ? '(min-width: 768px) 48rem, 90vw' : CARD_SIZES}
              poster={photo ? { url: photo.url!, alt: photo.alt, width: photo.width ?? 1280, height: photo.height ?? 720 } : null}
            />
          </div>
          <CardContent className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
            {item.quote && <QuoteText text={item.quote} clamp={!large && item.quote.length > LONG_QUOTE} className="display text-lg leading-snug" />}
            <Caption item={{ ...item, role: item.role || 'Video testimonial' }} photo={null} />
          </CardContent>
        </figure>
      </Card>
    )
  }
  return (
    <Card className="h-full gap-0 py-0" data-testimonial="quote">
      <CardContent className="h-full p-6 md:p-8">
        <figure className="flex h-full flex-col gap-6">
          <Quote aria-hidden className="size-7 text-primary" />
          <QuoteText
            text={item.quote ?? ''}
            clamp={!large && (item.quote?.length ?? 0) > LONG_QUOTE}
            className={cn('display leading-snug', large ? 'text-2xl md:text-3xl' : (item.quote?.length ?? 0) > LONG_QUOTE ? 'text-lg' : 'text-xl')}
          />
          <Caption item={item} photo={photo} />
        </figure>
      </CardContent>
    </Card>
  )
}

// carousel (the default) = CardCarousel, 1 → 2 (md) → 3 (lg) cards per view, so the section height does not grow with the item count.
export function Testimonials({ block, ctx }: BlockProps<Block>) {
  const items = (block.inline ?? []).filter((it) => it.quote || parseVideoUrl(it.videoUrl))
  if (!items.length) return null
  const variant = block.variant ?? 'carousel'
  const cards = items.map((it, i) => <Testimonial key={it.id ?? i} item={it} large={variant === 'single'} />)
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-testimonials={variant}>
        <SectionHeader heading={block.heading} onDark={block.tone === 'ink'} />
        {variant === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{cards}</div>
        ) : variant === 'single' ? (
          <div className="mx-auto max-w-3xl">{cards[0]}</div>
        ) : (
          <CardCarousel label={block.heading?.replace(/\*/g, '') || 'Testimonials'} onDark={block.tone === 'ink'}>{cards}</CardCarousel>
        )}
      </div>
    </Section>
  )
}
