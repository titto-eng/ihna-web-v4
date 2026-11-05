import Link from 'next/link'
import { ArrowUpRight, Mail, Phone, Search } from 'lucide-react'
import { nav } from '@/content/nav'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { SiteLogo } from './SiteLogo'
import { MainNav, type NavItem, type NavLink } from './MainNav'
import { MobileNav } from './MobileNav'
import { SocialIcon, networkLabel } from './SocialIcon'
import { telHref } from './nav-utils'

const isExternal = (href: string) => /^https?:\/\//.test(href)

// Brand CTA: orange (#f7941d) pill with ink text (≈8:1), a soft glow and a sheen that sweeps across on hover.
export const ctaClass =
  'group/cta relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-secondary px-5 text-sm font-bold whitespace-nowrap text-ink shadow-[0_10px_24px_-12px_hsl(33_93%_54%/0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_hsl(33_93%_54%/1)] focus-visible:-translate-y-0.5 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:skew-x-[-20deg] before:bg-white/45 before:transition-[left] before:duration-700 hover:before:left-[130%]'

function HeaderCta({ cta, className }: { cta: NavLink; className?: string }) {
  return (
    <Link href={cta.href} className={cn(ctaClass, className)}>
      <span className="relative">{cta.label}</span>
      <ArrowUpRight aria-hidden className="relative size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
    </Link>
  )
}

// Navigation comes from src/content/nav.ts, contact details from src/content/site.ts (05 §4.2, DEC-70).
// Utility bar (≥lg): deep-teal band with phones, email, the utility links and social icons. Sticky bar: glass surface that gains a
// shadow once the page scrolls (CSS scroll timeline, `header-elevate`; no JS), logo, mega-menu ≥xl, search and the Enquire CTA.
export function Header() {
  const items: NavItem[] = nav.menu.map((m) => ({ label: m.label, href: m.href, groups: m.groups.filter((g) => g.links.length) }))
  const utility = nav.utilityLinks
  const primary = nav.primaryCta
  const secondary = nav.secondaryCta
  const promo = nav.promoBar.enabled && nav.promoBar.label && nav.promoBar.href ? { text: nav.promoBar.text, label: nav.promoBar.label, href: nav.promoBar.href } : null

  return (
    <>
      {promo && (
        <div className="bg-ink px-5 py-2.5 text-center text-sm text-pretty text-ink-foreground">
          {promo.text && <span className="mr-2">{promo.text}</span>}
          <Link href={promo.href} className="font-semibold text-secondary underline underline-offset-4">{promo.label}</Link>
        </div>
      )}
      {(utility.length > 0 || site.phone) && (
        <div data-slot="utility-bar" className="relative hidden overflow-hidden bg-primary-strong text-[13px] text-ink-foreground/85 lg:block">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/45 to-transparent" />
          <div className="relative mx-auto flex h-10 max-w-site items-center justify-between gap-6 px-8">
            <div className="flex shrink-0 items-center gap-5">
              {site.phone && (
                <a href={telHref(site.phone)} className="inline-flex items-center gap-2 font-semibold text-ink-foreground transition-colors hover:text-secondary">
                  <span className="grid size-6 place-items-center rounded-full bg-secondary text-ink"><Phone aria-hidden className="size-3" /></span>
                  {site.phone}
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="hidden items-center gap-2 transition-colors hover:text-secondary xl:inline-flex">
                  <Mail aria-hidden className="size-3.5 text-secondary" />{site.email}
                </a>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-5">
              <ul className="flex items-center whitespace-nowrap">
                {utility.map((l, i) => (
                  <li key={l.href + l.label} className={cn('flex items-center', i > 0 && "before:mx-3 before:h-3 before:w-px before:bg-ink-foreground/25 before:content-['']")}>
                    <Link href={l.href} {...(isExternal(l.href) ? { target: '_blank', rel: 'noopener' } : {})} className="transition-colors hover:text-secondary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {secondary && (
                <Link href={secondary.href} className="shrink-0 rounded-full border border-current px-3 py-0.5 font-semibold whitespace-nowrap hover:bg-white/10 min-[1440px]:hidden">
                  {secondary.label}
                </Link>
              )}
              <ul className="hidden items-center gap-1 border-l border-ink-foreground/20 pl-4 xl:flex" aria-label="Social media">
                {site.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={networkLabel[s.network as keyof typeof networkLabel]} className="grid size-7 place-items-center rounded-full transition-colors hover:bg-secondary hover:text-ink [&_svg]:size-3.5">
                      <SocialIcon network={s.network as keyof typeof networkLabel} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <header className="header-elevate sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl backdrop-saturate-150">
        {/* `relative`: the wide mega-menu panels position against this bar, not against their trigger (MainNav). */}
        <div className="relative mx-auto flex h-[72px] max-w-site items-center gap-3 px-5 md:px-8 xl:gap-4">
          <SiteLogo priority />
          <div className="hidden min-w-0 flex-1 justify-center xl:flex"><MainNav items={items} /></div>
          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
            <Link href="/search/" aria-label="Search the site" className="hidden size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary-strong sm:grid">
              <Search aria-hidden className="size-[18px]" />
            </Link>
            {secondary && <Link href={secondary.href} className="hidden h-10 items-center rounded-full border border-primary-strong px-4 text-sm font-semibold whitespace-nowrap text-primary-strong hover:bg-primary-strong hover:text-ink-foreground min-[1440px]:inline-flex">{secondary.label}</Link>}
            {primary && <HeaderCta cta={primary} className="hidden sm:inline-flex" />}
            <MobileNav items={items} utility={utility} primary={primary} secondary={secondary} phone={site.phone} />
          </div>
        </div>
        {/* brand hairline: teal → orange */}
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-80" />
      </header>
    </>
  )
}
