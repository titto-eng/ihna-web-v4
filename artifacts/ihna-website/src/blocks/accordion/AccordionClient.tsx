'use client'

import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export type AccordionEntry = { id: string; title: string; content: ReactNode }

// Single open, collapsible (05 §4.3). Content is server-rendered nested blocks.
export function AccordionClient({ items }: { items: AccordionEntry[] }) {
  return (
    <Accordion type="single" collapsible className="divide-y border-y border-border">
      {items.map((it) => (
        <AccordionItem key={it.id} value={it.id} className="border-b-0 py-1">
          <AccordionTrigger className="display items-center py-5 text-xl hover:no-underline md:text-2xl">{it.title}</AccordionTrigger>
          <AccordionContent className="pr-10 pb-6 text-base text-muted-foreground">{it.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
