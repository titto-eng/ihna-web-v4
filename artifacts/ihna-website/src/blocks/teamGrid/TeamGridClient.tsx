'use client'

import Image from '@/components/blocks/MediaImage'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import { cn } from '@/lib/cn'

export type Member = { id: string; name: string; role?: string | null; bio?: string | null; photo?: { url: string; alt: string; width: number; height: number } | null }

function Portrait({ m }: { m: Member }) {
  return (
    <span className="block">
      <span className="relative block aspect-[4/5] overflow-hidden rounded-card bg-muted">
        {m.photo ? (
          <Image src={m.photo.url} alt={m.photo.alt || m.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
        ) : (
          <span aria-hidden className="grid h-full place-items-center display text-6xl text-muted-foreground">{m.name.slice(0, 1)}</span>
        )}
      </span>
      <span className="mt-4 block display text-xl leading-snug">{m.name}</span>
      {m.role && <span className="mt-1 block text-sm text-muted-foreground">{m.role}</span>}
    </span>
  )
}

function Member({ m }: { m: Member }) {
  if (!m.bio) return <div><Portrait m={m} /></div>
  return (
    <Dialog>
      <DialogTrigger className="block w-full cursor-pointer text-left"><Portrait m={m} /></DialogTrigger>
      <DialogContent>
        <DialogTitle className="display text-2xl">{m.name}</DialogTitle>
        <DialogDescription className="text-sm">{m.role}</DialogDescription>
        <p className="text-base">{m.bio}</p>
      </DialogContent>
    </Dialog>
  )
}

export function TeamGridClient({ members, carousel, label }: { members: Member[]; carousel?: boolean; label: string }) {
  const items = members.map((m) => <Member key={m.id} m={m} />)
  if (carousel) return <CardCarousel perView={4} label={label}>{items}</CardCarousel>
  return <div className={cn('grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4')}>{items}</div>
}
