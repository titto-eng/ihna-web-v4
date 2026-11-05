import Link from 'next/link'
import { ArrowRight, ArrowUp, Mail, MapPin, Phone } from 'lucide-react'
import { footer } from '@/content/footer'
import { site } from '@/content/site'
import { RenderBlocks } from '@/components/RenderBlocks'
import { EnquiryDialog } from '@/components/forms/EnquiryDialog'
import { SiteLogo } from './SiteLogo'
import { SocialIcon, networkLabel } from './SocialIcon'
import { WhatsAppButton } from './WhatsAppButton'

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

// Content from src/content/footer.ts and site.ts (05 §4.2). Layout: the deep-teal footer (brand hairline, glows, logo, contacts, social, link columns, campuses), Acknowledgement of Country and the legal line.
export function Footer() {
  const columns = footer.columns
  const social = footer.social
  const year = new Date().getFullYear()
  const news = footer.newsletter
  const newsKey = news.enabled ? news.formKey : null
  const ackLink = (footer as { acknowledgementLink?: { label: string; href: string } | null }).acknowledgementLink ?? null
  return (
    <>
      <footer className="relative bg-ink text-ink-foreground">
        {/* brand hairline */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

        {/* brand glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute top-1/3 -left-40 size-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <span className="absolute -right-32 bottom-0 size-[22rem] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-site px-5 pt-16 pb-8 md:px-8 md:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_2.75fr]">
            <div>
              <SiteLogo onDark size="lg" />
              <ul className="mt-8 space-y-3 text-sm text-ink-foreground/80">
                {site.phone && (
                  <li><a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="group inline-flex items-center gap-3 hover:text-ink-foreground">
                    <span className="grid size-9 place-items-center rounded-full bg-white/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-ink"><Phone aria-hidden className="size-4" /></span>{site.phone}</a></li>
                )}
                {site.email && (
                  <li><a href={`mailto:${site.email}`} className="group inline-flex items-center gap-3 hover:text-ink-foreground">
                    <span className="grid size-9 place-items-center rounded-full bg-white/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-ink"><Mail aria-hidden className="size-4" /></span>{site.email}</a></li>
                )}
                {site.organisation.address && (
                  <li className="inline-flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-secondary"><MapPin aria-hidden className="size-4" /></span><span className="pt-2">{site.organisation.address}</span></li>
                )}
              </ul>
              {social.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Social media">
                  {social.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={networkLabel[s.network]} className="grid size-10 place-items-center rounded-full border border-ink-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:bg-secondary hover:text-ink">
                        <SocialIcon network={s.network} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {columns.length > 0 && (
              <nav aria-label="Footer" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {columns.map((c, i) => (
                  <div key={i}>
                    <h2 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wide text-ink-foreground uppercase">
                      <span aria-hidden className="h-0.5 w-5 rounded-full bg-secondary" />{c.heading}
                    </h2>
                    <ul className="space-y-3 text-[15px]">
                      {(c.links ?? []).map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener' } : {})} className="group inline-flex items-start gap-1.5 text-ink-foreground/75 transition-colors hover:text-secondary">
                            {!isExternal(l.href) && <ArrowRight aria-hidden className="mt-1 size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />}
                            <span className="break-words">{l.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </div>

          {site.contact.campuses.length > 0 && (
            <div className="mt-14 border-t border-ink-foreground/10 pt-10">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wide uppercase"><span aria-hidden className="h-0.5 w-5 rounded-full bg-secondary" />Our campuses</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {site.contact.campuses.map((c) => (
                  <li key={c.name} className="rounded-xl border border-ink-foreground/10 bg-white/[0.03] p-4 text-sm transition-colors hover:border-primary/60 hover:bg-white/[0.06]">
                    <p className="font-semibold text-ink-foreground">{c.name}</p>
                    <p className="mt-1 text-ink-foreground/65">{c.address}</p>
                    <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`} className="mt-2 inline-block text-secondary hover:underline">{c.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {newsKey && (
            <div id="newsletter" className="mt-14 grid gap-8 border-t border-ink-foreground/10 pt-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="display text-2xl text-ink-foreground">{news.heading}</h2>
                <p className="mt-2 max-w-md text-sm text-ink-foreground/75">{news.text}</p>
              </div>
              <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey: newsKey, variant: 'sidebar', spacing: 'none', anchorId: 'newsletterForm' }]} ctx={{ depth: 1 }} />
            </div>
          )}

          {footer.acknowledgement && (
            <div className="mt-14 grid gap-4 rounded-card border border-ink-foreground/10 bg-white/[0.03] p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-6 md:p-8">
              {/* the Aboriginal flag's colours as a quiet three-band mark */}
              <span aria-hidden className="relative flex h-10 w-16 flex-col overflow-hidden rounded-md"><span className="flex-1 bg-black" /><span className="flex-1 bg-[#c8102e]" /><span className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcd00]" /></span>
              <div>
                <h2 className="label-mono mb-2 text-[11px] tracking-widest text-secondary">Acknowledgement of Country</h2>
                <p className="max-w-4xl text-sm leading-relaxed text-ink-foreground/75">
                  {footer.acknowledgement}{' '}
                  {ackLink && <Link href={ackLink.href} className="font-semibold text-secondary underline underline-offset-4">{ackLink.label}</Link>}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 border-t border-ink-foreground/10 pt-6 text-xs text-ink-foreground/60 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-1">
              {footer.legalLines.map((l, i) => <p key={i}>{l}</p>)}
              <p>&copy; {year} {site.siteName}. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-5">
              {footer.legalLinks.length > 0 && (
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {footer.legalLinks.map((l) => (
                    <li key={l.href + l.label}><Link href={l.href} className="underline-offset-4 hover:text-ink-foreground hover:underline">{l.label}</Link></li>
                  ))}
                </ul>
              )}
              <a href="#main" className="group inline-flex items-center gap-2 font-semibold text-ink-foreground/80 hover:text-secondary">
                Back to top<span className="grid size-8 place-items-center rounded-full border border-ink-foreground/20 transition-transform group-hover:-translate-y-1 group-hover:border-secondary"><ArrowUp aria-hidden className="size-3.5" /></span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <EnquiryDialog />
      <WhatsAppButton number={site.whatsappNumber} />
    </>
  )
}
