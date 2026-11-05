'use client'

import { useState } from 'react'
import Image from '@/components/blocks/MediaImage'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import { Button } from '@/components/ui/button'

export type Shot = { id: string; url: string; alt: string; width: number; height: number }

// Grid or carousel of thumbnails; click opens a lightbox with prev/next (dialog is keyboard-trapped by Radix).
export function GalleryClient({ shots, carousel, label }: { shots: Shot[]; carousel?: boolean; label: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const current = open === null ? null : shots[open]
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + shots.length) % shots.length))
  const thumbs = shots.map((s, i) => (
    <button key={s.id} type="button" onClick={() => setOpen(i)} className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl" aria-label={`Open image ${i + 1} of ${shots.length}${s.alt ? `: ${s.alt}` : ''}`}>
      <Image src={s.url} alt={s.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
    </button>
  ))
  return (
    <>
      {carousel ? <CardCarousel label={label}>{thumbs}</CardCarousel> : <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{thumbs}</div>}
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl gap-3 border-0 bg-ink p-3 sm:max-w-5xl">
          <DialogTitle className="sr-only">{label}</DialogTitle>
          <DialogDescription className="sr-only">{current?.alt || 'Image'}</DialogDescription>
          {current && <Image src={current.url} alt={current.alt} width={current.width} height={current.height} sizes="90vw" className="max-h-[75vh] w-full rounded-xl object-contain" />}
          {shots.length > 1 && (
            <div className="flex justify-between">
              <Button variant="light" size="icon" onClick={() => go(-1)} aria-label="Previous image"><ChevronLeft /></Button>
              <Button variant="light" size="icon" onClick={() => go(1)} aria-label="Next image"><ChevronRight /></Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
