/**
 * `staff` on IHNA: the people the live site shows. IHNA's staff live in the WordPress table `staff_profile` (template-academic-staff.php,
 * template-staff-profile.php), which is not in any dump we have, so the public pages are read instead (GET, at most one request per
 * second, cached in out/cache/live-staff/):
 *   - `/academic-staff/?cpage=N` (every page of the pager): the "Academic Staff" cards, then the "Management Team" cards, each with a
 *     `/staff-profile/?id=<id>` link -> the order and the team;
 *   - `/staff-profile/?id=<id>`: `.stNme` name, `.stDesig` position, `.stprofDet` bio, `.orcidID` / `.sch_btn` / `.linkedInBtn` links,
 *     `img.profImage` photo (a theme file under assets/images/academic-staff/; the dummy placeholders are not photos).
 * Upsert key `legacyId` = the staff_profile id; `slug` from the name. Emails and phone numbers are never stored (rule 4): the email
 * line of the page is not read. A doc whose written fields are unchanged is skipped (`staffUnchanged`); `--force` rewrites.
 * The photo is imported into `media` (legacyPath = the theme path) from the old repo's copy, else from the live site, and set only
 * when `staff.photo` is empty. `--offline` uses the cache only.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { CACHE_DIR, LEGACY_BASE_URL, LEGACY_ROOT } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { assertNoLegacyMarkup } from '../lib/assert-clean'
import { slugOf } from '../steps/lookups'
import { staffUnchanged, type StaffData } from '../steps/staff'

const PAGE_CACHE = resolve(CACHE_DIR, 'live-staff')
const flat = (s: string) => s.replace(/\s+/g, ' ').trim()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type StaffCard = { id: number; team: 'academic' | 'management'; order: number }
export type IhnaStaffProfile = { name: string; position: string; bio: string; orcid: string | null; googleScholar: string | null; linkedin: string | null; photoSrc: string | null }

/** Pure: the staff cards of one /academic-staff/ page and the highest page number of its pager. */
export function parseStaffList(html: string, offset = 0): { cards: StaffCard[]; pages: number } {
  const $ = cheerio.load(html.replace(/<!--[\s\S]*?-->/g, ''))
  const cards: StaffCard[] = []
  // the cards follow the "Academic Staff" heading until the "Management Team" heading; each holds one profile link
  let team: StaffCard['team'] = 'academic'
  $('h1, h2, h3, h4, a[href*="staff-profile/?id="]').each((_, el) => {
    const node = $(el)
    if (/^h\d$/.test((el as { name: string }).name)) {
      // "Our Academic Staff" ... "Management Team" (the page title "Our Academic Management Team" comes first and is neither)
      const h = flat(node.text()).toLowerCase()
      if (/academic staff/.test(h)) team = 'academic'
      else if (/^management team$/.test(h)) team = 'management'
      return
    }
    // name and position are read from the profile page itself; the card gives the order and the team
    const id = Number(/[?&]id=(\d+)/.exec(node.attr('href') ?? '')?.[1])
    if (!id || cards.some((c) => c.id === id)) return
    cards.push({ id, team, order: offset + cards.length })
  })
  const pages = Math.max(1, ...$('a[href*="cpage="]').toArray().map((a) => Number(/cpage=(\d+)/.exec($(a).attr('href') ?? '')?.[1] ?? 1)))
  return { cards, pages }
}

/** Pure: one /staff-profile/?id= page. The email line is never read. */
export function parseStaffProfile(html: string): IhnaStaffProfile | null {
  const $ = cheerio.load(html.replace(/<!--[\s\S]*?-->/g, ''))
  const box = $('.stProf').first()
  if (!box.length) return null
  const link = (sel: string) => {
    const href = (box.find(sel).attr('href') ?? '').trim()
    return /^https?:\/\//.test(href) && !box.find(sel).hasClass('d-none') ? href : null
  }
  const bio = box.find('.stprofDet').first()
  const paras = bio.find('p').toArray().map((p) => flat($(p).text())).filter(Boolean)
  const src = box.find('img.profImage').attr('src') ?? null
  return {
    name: flat(box.find('.stNme').first().text()),
    position: flat(box.find('.stDesig').first().text()),
    bio: (paras.length ? paras : [flat(bio.text())]).filter(Boolean).join('\n\n'),
    orcid: link('a.orcidID'),
    googleScholar: link('a.sch_btn'),
    linkedin: link('a.linkedInBtn'),
    photoSrc: src && !/dummy|placeholder/i.test(src) ? src : null,
  }
}

async function getPage(url: string, file: string, offline: boolean, state: { fetched: number }): Promise<string | null> {
  if (existsSync(file)) return readFileSync(file, 'utf8')
  if (offline) return null
  if (state.fetched) await sleep(1100) // at most one request per second (AGENTS.md)
  state.fetched++
  const res = await fetch(url, { headers: { 'user-agent': 'ihna-web-import/1.0' }, signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  const html = await res.text()
  writeFileSync(file, html)
  return html
}

/** legacyPath of a theme photo src, and the media id (imported once). */
async function photoId(ctx: ImportContext, src: string, offline: boolean, state: { fetched: number }): Promise<number | null> {
  const legacyPath = new URL(src, LEGACY_BASE_URL).pathname.replace(/^\/+/, '')
  const found = (await ctx.payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
  if (found) return Number(found.id)
  if (ctx.dry) return null
  let file = resolve(LEGACY_ROOT, decodeURI(legacyPath))
  if (!existsSync(file)) {
    if (offline) return null
    file = resolve(PAGE_CACHE, `${createHash('sha1').update(legacyPath).digest('hex').slice(0, 10)}-${legacyPath.split('/').pop()}`)
    if (!existsSync(file)) {
      if (state.fetched) await sleep(1100)
      state.fetched++
      const res = await fetch(`${LEGACY_BASE_URL}/${legacyPath}`, { headers: { 'user-agent': 'ihna-web-import/1.0' }, signal: AbortSignal.timeout(30_000) })
      if (!res.ok || !/^image\//.test(res.headers.get('content-type') ?? '')) return null
      writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    }
  }
  const doc = await ctx.payload.create({ collection: 'media', data: { alt: 'Staff photo', legacyPath }, filePath: file, ...ctx.opts })
  return Number(doc.id)
}

export async function runIhnaStaff(ctx: ImportContext) {
  const { payload, report } = ctx
  const offline = Boolean(ctx.args.flags.offline)
  const state = { fetched: 0 }
  mkdirSync(PAGE_CACHE, { recursive: true })

  // 1. the directory, every page of the pager
  const cards: StaffCard[] = []
  let pages = 1
  for (let n = 1; n <= pages; n++) {
    const html = await getPage(`${LEGACY_BASE_URL}/academic-staff/${n > 1 ? `?cpage=${n}` : ''}`, resolve(PAGE_CACHE, `academic-staff-${n}.html`), offline, state)
    if (!html) {
      report.failed.push({ id: `academic-staff?cpage=${n}`, reason: 'not cached (--offline)' })
      break
    }
    const parsed = parseStaffList(html, cards.length)
    pages = Math.max(pages, parsed.pages)
    for (const c of parsed.cards) if (!cards.some((x) => x.id === c.id)) cards.push({ ...c, order: cards.length })
  }

  // 2. each profile
  const totals = { people: cards.length, academic: cards.filter((c) => c.team === 'academic').length, management: cards.filter((c) => c.team === 'management').length, withBio: 0, withPhoto: 0, emailsRead: 0 }
  for (const card of cards) {
    if (!ctx.wanted(card.id)) continue
    try {
      const html = await getPage(`${LEGACY_BASE_URL}/staff-profile/?id=${card.id}`, resolve(PAGE_CACHE, `staff-profile-${card.id}.html`), offline, state)
      if (!html) throw new Error('not cached (--offline)')
      const p = parseStaffProfile(html)
      if (!p?.name) throw new Error('no .stProf profile on the page')
      if (p.bio) totals.withBio++
      const data: StaffData = {
        name: p.name, position: p.position, postNominals: '', bio: p.bio, linkedin: p.linkedin ?? '', googleScholar: p.googleScholar ?? '',
        orcid: p.orcid ?? '', research: [], grants: [], activities: [], supervision: [], slug: slugOf(p.name), legacyId: card.id, active: true,
      }
      assertNoLegacyMarkup(data, `staff/${card.id}`)
      const existing = (await payload.find({ collection: 'staff', where: { legacyId: { equals: card.id } }, limit: 1, depth: 0, overrideAccess: true, draft: true })).docs[0] as unknown as Record<string, unknown> | undefined
      // two people with one name: the second keeps its staff_profile id in the slug
      const taken = (await payload.find({ collection: 'staff', where: { and: [{ slug: { equals: data.slug } }, { legacyId: { not_equals: card.id } }] }, limit: 1, depth: 0, overrideAccess: true, draft: true })).docs[0]
      if (taken) data.slug = `${data.slug}-${card.id}`
      const photo = p.photoSrc && !existing?.photo ? await photoId(ctx, p.photoSrc, offline, state) : null
      if (p.photoSrc) totals.withPhoto++
      const write = { ...data, sortOrder: card.order, ...(photo ? { photo } : {}) }
      if (!ctx.args.force && !photo && staffUnchanged(existing, data) && existing?.sortOrder === card.order) {
        report.skipped++
        continue
      }
      if (!ctx.dry) {
        if (existing) await payload.update({ collection: 'staff', id: existing.id as number, data: { ...write, _status: 'published' } as never, ...ctx.opts })
        else await payload.create({ collection: 'staff', data: { ...write, _status: 'published' } as never, ...ctx.opts })
      }
      if (existing) report.updated++
      else report.created++
    } catch (e) {
      report.failed.push({ id: card.id, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return { source: `${LEGACY_BASE_URL}/academic-staff/ and /staff-profile/?id= (live pages; staff_profile table not in a dump)`, pagesRead: pages, fetched: state.fetched, ...totals }
}
