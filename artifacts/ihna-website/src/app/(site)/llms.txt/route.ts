// /llms.txt (llmstxt.org): a plain-markdown map of the site for AI answer engines (GEO). Built from the same constants as the header,
// footer and Organization JSON-LD (src/content/nav.ts, footer.ts, site.ts), so it never drifts from the navigation.
import { nav } from '@/content/nav'
import { footer } from '@/content/footer'
import { site } from '@/content/site'

export const dynamic = 'force-static'

export function GET() {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ihna.edu.au').replace(/\/+$/, '')
  const abs = (href: string) => (/^https?:/.test(href) ? href : `${origin}${href}`)
  const org = site.organisation
  const lines: string[] = [
    `# ${site.siteName} (${site.shortName})`,
    '',
    `> ${site.siteName} is an Australian registered training organisation (RTO ${org.rto}, CRICOS provider ${org.cricos}) offering nursing, allied health, community services, first aid and English courses to domestic and international students, with campuses in Melbourne, Sydney (Parramatta), Perth and Brisbane. Legal entity: ${org.legalName} (ABN ${org.abn}).`,
    '',
    `- Phone (Australia): ${site.phone}`,
    `- Phone (international): ${site.phoneInternational}`,
    `- Email: ${site.email}`,
    '',
    '## Campuses',
    ...site.contact.campuses.map((c) => `- ${c.name}: ${c.address} (${c.phone})`),
    '',
  ]
  for (const item of nav.menu) {
    const links = item.groups.flatMap((g) => g.links)
    if (!links.length) continue
    lines.push(`## ${item.label}`)
    for (const g of item.groups) {
      if (g.heading) lines.push(g.href ? `### [${g.heading}](${abs(g.href)})` : `### ${g.heading}`)
      for (const l of g.links) lines.push(`- [${l.label}](${abs(l.href)})`)
    }
    lines.push('')
  }
  lines.push('## Students and partners')
  for (const c of footer.columns) for (const l of c.links) if (!/^(tel|mailto):/.test(l.href)) lines.push(`- [${l.label}](${abs(l.href)})`)
  for (const l of nav.utilityLinks) lines.push(`- [${l.label}](${abs(l.href)})`)
  lines.push('', '## Optional', `- [Sitemap](${origin}/sitemap.xml)`, `- [Blog](${origin}/blog/)`)
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
