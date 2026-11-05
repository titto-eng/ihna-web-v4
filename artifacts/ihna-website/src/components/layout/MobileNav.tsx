'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/content/site'
import { GraduationCap, Menu, Phone } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { CtaLink, type CtaItem } from '@/components/CtaLink'
import type { NavItem, NavLink } from './MainNav'
import { hasLandingPage, telHref } from './nav-utils'

// Below xl (1280px): a sheet with the whole menu as accordion groups, both CTAs, the phone and the utility links.
// Radix traps focus and closes on Esc (05 §4.2).
export function MobileNav({ items, utility, primary, secondary, phone }: {
  items: NavItem[]; utility: NavLink[]; primary?: CtaItem | null; secondary?: CtaItem | null; phone?: string | null
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 rounded-full bg-primary-strong text-ink-foreground hover:bg-primary hover:text-ink xl:hidden" aria-label="Open menu"><Menu className="size-5" /></Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(92vw,26rem)] gap-0 overflow-y-auto overscroll-contain bg-background p-0 sm:max-w-[26rem] [&>button:last-child]:top-6 [&>button:last-child]:right-5 [&>button:last-child]:z-10 [&>button:last-child]:text-ink-foreground [&>button:last-child_svg]:size-5">
        <SheetHeader className="relative overflow-hidden border-b border-border bg-primary-strong p-5 text-ink-foreground">
          <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-secondary/30 blur-2xl" />
          <SheetTitle className="relative flex items-center gap-3"><Image src={site.logoLight.url} alt="" width={1453} height={665} className="h-10 w-auto" /><span className="sr-only">Menu</span></SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-5 py-2">
          <Accordion type="single" collapsible>
            {items.map((item) =>
              item.groups.length ? (
                <AccordionItem key={item.href + item.label} value={item.href + item.label}>
                  <AccordionTrigger className="items-center py-4 text-lg font-semibold hover:text-primary-strong hover:no-underline data-[state=open]:text-primary-strong">{item.label}</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {hasLandingPage(item.href) && (
                      <Link href={item.href} onClick={close} className="mb-3 block text-sm font-semibold text-primary-strong underline underline-offset-4">All {item.label.toLowerCase()}</Link>
                    )}
                    {item.groups.map((g, gi) => (
                      <div key={gi} className="mb-4 last:mb-0">
                        {g.heading && (g.href ? (
                          <Link href={g.href} onClick={close} className="mb-1 flex items-start gap-2 py-1 text-base leading-snug font-bold text-primary-strong hover:text-primary">
                            <GraduationCap aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />{g.heading}
                          </Link>
                        ) : g.column ? (
                          <p className="mb-1 flex items-start gap-2 py-1 text-base leading-snug font-bold text-primary-strong"><GraduationCap aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />{g.heading}</p>
                        ) : (
                          <p className="label-mono mb-1 text-[11px] leading-relaxed tracking-widest text-pretty text-accent">{g.heading}</p>
                        ))}
                        <ul>
                          {g.links.map((l) => (
                            <li key={l.href + l.label}><Link href={l.href} onClick={close} className="block border-l-2 border-border py-2 pl-3 text-base leading-snug text-pretty transition-colors hover:border-secondary hover:text-primary-strong">{l.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={item.href + item.label} className="border-b border-border">
                  <Link href={item.href} onClick={close} className="block py-4 text-lg font-semibold">{item.label}</Link>
                </div>
              ),
            )}
          </Accordion>
        </nav>
        <div className="mx-5 my-4 flex flex-col gap-3 rounded-card bg-gradient-to-br from-primary/10 to-secondary/15 p-4">
          {primary && <CtaLink cta={{ ...primary, style: 'primary' }} />}
          {secondary && <CtaLink cta={{ ...secondary, style: 'secondary' }} />}
          {phone && (
            <a href={telHref(phone)} className="inline-flex items-center justify-center gap-2 py-2 font-semibold">
              <Phone aria-hidden className="size-4" />{phone}
            </a>
          )}
        </div>
        {utility.length > 0 && (
          <ul className="mt-auto grid grid-cols-2 gap-x-4 border-t border-border p-5 text-sm text-muted-foreground">
            {utility.map((l) => (
              <li key={l.href + l.label}><Link href={l.href} onClick={close} className="block py-1.5">{l.label}</Link></li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  )
}
