'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/cn'

/** A testimonial quote; a long one shows its first lines with a "Read more" toggle so carousel cards stay a similar height. */
export function QuoteText({ text, className, clamp }: { text: string; className?: string; clamp: boolean }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  if (!clamp) return <blockquote className={cn('flex-1', className)}>{text}</blockquote>
  return (
    <div className="flex flex-1 flex-col items-start gap-3">
      <blockquote id={id} className={cn(className, !open && 'line-clamp-7')}>{text}</blockquote>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer text-sm font-semibold text-primary-strong underline underline-offset-4 hover:no-underline"
      >
        {open ? 'Show less' : 'Read more'}
      </button>
    </div>
  )
}
