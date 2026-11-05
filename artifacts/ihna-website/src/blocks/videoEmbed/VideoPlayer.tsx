'use client'

import { useState } from 'react'
import { ExclusiveFrame } from '@/components/media/ExclusiveFrame'
import { announcePlay } from '@/components/media/exclusivePlayback'
import Image from '@/components/blocks/MediaImage'
import { Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Props = {
  src: string
  title: string
  poster?: { url: string; alt: string; width: number; height: number } | null
  lightbox?: boolean
  /** Card size: smaller play button, no title pill (the card shows the name). */
  compact?: boolean
  /** `sizes` for the poster image. */
  sizes?: string
}

// Poster facade: no third-party request until the visitor presses play (privacy + speed).
function Facade({ title, poster, compact, sizes }: Pick<Props, 'title' | 'poster' | 'compact' | 'sizes'>) {
  return (
    <span className="group relative block aspect-video w-full overflow-hidden rounded-card bg-ink text-ink-foreground">
      {poster && <Image src={poster.url} alt="" fill sizes={sizes ?? '(min-width: 1024px) 60vw, 100vw'} className="object-cover opacity-80" />}
      <span className="absolute inset-0 grid place-items-center">
        <span className={cn('grid place-items-center rounded-full bg-primary text-foreground transition-transform duration-300 group-hover:scale-105', compact ? 'size-14' : 'size-20')}>
          <Play aria-hidden className={cn('ml-1 fill-current', compact ? 'size-6' : 'size-8')} />
        </span>
      </span>
      {!compact && <span className="label-mono absolute bottom-4 left-4 rounded-full bg-foreground/70 px-3 py-1 text-[10px] tracking-widest">{title}</span>}
    </span>
  )
}

// the playing frame pauses any other video on the page, and is paused when another one starts (one video at a time)
const Frame = ({ src, title }: { src: string; title: string }) => (
  <ExclusiveFrame src={src} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded-card" />
)

export function VideoPlayer({ src, title, poster, lightbox, compact, sizes }: Props) {
  const [playing, setPlaying] = useState(false)
  if (lightbox) {
    return (
      <Dialog>
        <DialogTrigger onClick={() => announcePlay('')} className="block w-full cursor-pointer text-left" aria-label={`Play video: ${title}`}><Facade title={title} poster={poster} compact={compact} sizes={sizes} /></DialogTrigger>
        <DialogContent className="max-w-4xl border-0 bg-ink p-2 sm:max-w-4xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <Frame src={src} title={title} />
        </DialogContent>
      </Dialog>
    )
  }
  return playing ? (
    <Frame src={src} title={title} />
  ) : (
    <button type="button" onClick={() => { announcePlay(''); setPlaying(true) }} className="block w-full cursor-pointer text-left" aria-label={`Play video: ${title}`}>
      <Facade title={title} poster={poster} compact={compact} sizes={sizes} />
    </button>
  )
}
