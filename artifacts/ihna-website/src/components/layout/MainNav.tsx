'use client'

import { useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { hasLandingPage, isWidePanel, linkCount } from './nav-utils'

export type NavLink = { label: string; href: string }
export type NavGroup = { heading?: string | null; href?: string; column?: 1 | 2 | 3; links: NavLink[] }
export type NavItem = NavLink & { groups: NavGroup[] }

// Tighter at xl (1280-1535px), roomier from 2xl, so all items fit on one line from 1280px up (05 §4.2).
const trigger = 'h-10 rounded-full bg-transparent px-3 text-sm font-semibold whitespace-nowrap text-foreground/85 transition-colors hover:bg-primary/10 hover:text-primary-strong focus:bg-primary/10 data-[state=open]:bg-primary/10 data-[state=open]:text-primary-strong 2xl:px-4 2xl:text-[15px]'
const subLink = 'block rounded-lg border-l-2 border-transparent px-3 py-2 text-[15px] leading-snug font-medium text-pretty transition-all duration-200 hover:border-secondary hover:bg-primary/[0.07] hover:pl-4 hover:text-primary-strong focus:border-secondary focus:bg-primary/[0.07]'
const viewAll = 'inline-flex rounded-none px-0 text-sm font-semibold text-primary-strong underline underline-offset-4 hover:bg-transparent'

function SubLinks({ links, className, itemClassName }: { links: NavLink[]; className?: string; itemClassName?: string }) {
  return (
    <ul className={cn('space-y-0.5', className)}>
      {links.map((l) => (
        <li key={l.href + l.label} className={itemClassName}>
          <NavigationMenuLink asChild><Link href={l.href} className={subLink}>{l.label}</Link></NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

/** A group heading: a course category with a cap icon, linked to its school page when it has one (as on live); else a mono label. */
function GroupHeading({ g, compact = false }: { g: NavGroup; compact?: boolean }) {
  if (!g.heading) return null
  if (!g.column && !g.href) return <p className={cn('label-mono px-3 text-[11px] leading-relaxed tracking-widest text-accent', compact ? 'mt-2 mb-1' : 'mb-2')}>{g.heading}</p>
  const inner = (
    <>
      <GraduationCap aria-hidden className="size-5 shrink-0 text-primary transition-transform duration-300 group-hover/h:-rotate-12 group-hover/h:text-secondary" />
      <span>{g.heading}</span>
    </>
  )
  const cls = 'group/h mb-1.5 flex flex-row items-start gap-2 rounded-lg px-3 py-1.5 font-sans text-base! leading-snug font-bold text-primary-strong'
  return g.href ? (
    <NavigationMenuLink asChild><Link href={g.href} className={cn(cls, 'transition-colors hover:bg-primary/[0.07] hover:text-primary')}>{inner}</Link></NavigationMenuLink>
  ) : (
    <p className={cls}>{inner}</p>
  )
}

// Mega-menu (05 §4.2, DEC-70). Radix navigation-menu gives keyboard operation, Escape and outside-click close.
// Wide panels (several groups or many links) span the header bar, centred and capped at 64rem; compact ones drop under their
// trigger, opening leftwards for items in the right half. Panels never exceed the viewport and scroll inside when tall.
export function MainNav({ items }: { items: NavItem[] }) {
  const ref = useRef<HTMLElement>(null)
  const [panelTop, setPanelTop] = useState<number | null>(null)
  // On open, record where the header ends so the panel's max-height fits the space left in the viewport.
  const onValueChange = (value: string) => {
    const bottom = value ? ref.current?.closest('header')?.getBoundingClientRect().bottom : undefined
    if (bottom) setPanelTop(Math.round(bottom))
  }
  const style = panelTop ? ({ '--nav-panel-top': `${panelTop}px` } as CSSProperties) : undefined

  return (
    <NavigationMenu
      ref={ref}
      viewport={false}
      onValueChange={onValueChange}
      style={style}
      // static (and the Radix list wrapper static) so a wide panel's containing block is the header bar.
      className="static max-w-none [&>div]:static!"
      aria-label="Main"
    >
      <NavigationMenuList className="gap-0.5 2xl:gap-1">
        {items.map((item, index) => {
          if (!item.groups.length) {
            return (
              <NavigationMenuItem key={item.href + item.label}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={cn(trigger, 'inline-flex items-center justify-center')}>{item.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          const wide = isWidePanel(item.groups)
          const single = item.groups.length === 1
          return (
            <NavigationMenuItem key={item.href + item.label} className={wide ? 'static' : undefined}>
              <NavigationMenuTrigger className={trigger}>{item.label}</NavigationMenuTrigger>
              {wide ? (
                <NavigationMenuContent className="inset-x-8 mx-auto max-w-[64rem] md:overflow-hidden md:rounded-card md:border-t-4 md:border-t-primary md:bg-card md:p-0 md:shadow-2xl md:shadow-primary-strong/15">
                  <div className="grid grid-cols-[9.5rem_1fr] gap-x-8 p-6 2xl:grid-cols-[11rem_1fr] 2xl:p-8">
                    <div className="-my-6 -ml-6 border-r border-border bg-gradient-to-b from-primary/10 to-secondary/10 py-6 pr-6 pl-6 2xl:-my-8 2xl:-ml-8 2xl:py-8 2xl:pl-8">
                      <p className="display text-2xl">{item.label}</p>
                      {hasLandingPage(item.href) && (
                        <NavigationMenuLink asChild>
                          <Link href={item.href} className={cn(viewAll, 'mt-3')}>View all {item.label.toLowerCase()}</Link>
                        </NavigationMenuLink>
                      )}
                    </div>
                    {single ? (
                      <SubLinks
                        links={item.groups[0].links}
                        className={cn('gap-6', linkCount(item.groups) > 12 ? 'columns-3' : 'columns-2')}
                        itemClassName="break-inside-avoid"
                      />
                    ) : item.groups.some((g) => g.column) ? (
                      // fixed columns (Courses): each column stacks its categories, as on live
                      <div className="grid grid-cols-3 gap-6">
                        {([1, 2, 3] as const).map((c) => (
                          <div key={c} className="space-y-5">
                            {item.groups.filter((g) => (g.column ?? 1) === c).map((g, gi) => (
                              <div key={gi}>
                                <GroupHeading g={g} />
                                <SubLinks links={g.links} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="columns-3 gap-8">
                        {item.groups.map((g, gi) => (
                          <div key={gi} className="mb-6 break-inside-avoid">
                            <GroupHeading g={g} />
                            <SubLinks links={g.links} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </NavigationMenuContent>
              ) : (
                <NavigationMenuContent
                  className={cn(
                    'md:w-[min(18rem,calc(100vw-2.5rem))] md:rounded-card md:bg-card md:p-2 md:shadow-xl',
                    // the trigger sits 16px above the 72px bar's bottom edge: drop the panel to line up with the wide ones
                    // (same group variant as the primitive's mt-1.5 so it wins)
                    'group-data-[viewport=false]/navigation-menu:mt-[22px]',
                    index >= items.length / 2 && 'right-0 left-auto',
                  )}
                >
                  {item.groups.map((g, gi) => (
                    <div key={gi}>
                      <GroupHeading g={g} compact />
                      <SubLinks links={g.links} />
                    </div>
                  ))}
                  {hasLandingPage(item.href) && (
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={cn(viewAll, 'mx-3 mt-2 mb-2')}>View all {item.label.toLowerCase()}</Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
