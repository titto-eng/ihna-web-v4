import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { INVENTORY_DIR, LEGACY_BASE_URL } from '../../scripts/import/lib/config'
import { COURSE_RULES, SCHOOL_DEFAULTS, SITE_DEFAULT, T, decideWrite, imageRefs, ownImage, planCourseHero, sharedImages, type Current, type Resolve } from '../../scripts/import/lib/images-plan'
import { peopleCards } from '../../scripts/import/lib/images-people'
import { altFromPath, classify, dedupe, hashDistance, legacyPathOf, looksLikePortrait, type HashedFile, THEME_LEGACY_PREFIX } from '../../scripts/import/lib/images-select'
import { fileMentions, matchLocal, nameTokens, samePerson, themeRelOf } from '../../scripts/import/lib/images-staff'

const ok = (rel: string, width = 1200) => classify(rel, width)

describe('theme photo selection', () => {
  it('keeps photographs of at least 600 px and drops narrower ones', () => {
    expect(ok('images/gallery/CBD_6.jpg', 600)).toMatchObject({ ok: true, kind: 'photo' })
    expect(ok('images/gallery/CBD_6.jpg', 599)).toEqual({ ok: false, reason: 'too-small' })
    expect(classify('images/gallery/CBD_6.jpg', null)).toEqual({ ok: false, reason: 'unreadable' })
  })

  it('only takes jpg, jpeg, png and webp: svg and the rest are refused', () => {
    expect(ok('images/IHM-Logo.svg')).toEqual({ ok: false, reason: 'svg' })
    expect(ok('images/spinner.gif')).toEqual({ ok: false, reason: 'format' })
    expect(ok('images/e2.avif')).toEqual({ ok: false, reason: 'format' })
    for (const f of ['a.jpg', 'a.jpeg', 'a.png', 'a.webp']) expect(ok(`images/gallery/${f}`).ok).toBe(true)
  })

  it.each([
    ['images/ihm-logo.webp', 'logo'],
    ['images/teqsa.jpg', 'logo'],
    ['images/neas_qc_badge.webp', 'logo'],
    ['images/edusystems-banner-img.webp', 'partner-logo'],
    ['images/healthovation-logo.webp', 'logo'],
    ['images/bioIcon.png', 'ui-asset'],
    ['images/footer-line-design.webp', 'ui-asset'],
    ['images/arrow.webp', 'ui-asset'],
    ['images/profile-placeholder.jpg', 'placeholder'],
    ['images/people-dummy.jpg', 'placeholder'],
    ['images/flag-au.png', 'flag'],
    ['images/pixel.png', 'pixel'],
    ['images/web-design-and-development.png', 'screenshot'],
    ['images/screenshot-1.png', 'screenshot'],
    ['images/g3.webp', 'infographic'],
    ['images/ahpra-flow-chart.jpg', 'infographic'],
    ['images/IHM_GCANScholorshipPop-Up.jpg', 'promo-graphic'],
    ['images/IHM_Image-Resize_FBAdvt_1_V1_23Jun23.jpg', 'promo-graphic'],
    ['images/nurse-gcan_old.webp', 'superseded-copy'],
    ['images/testimonials/maxresdefault.jpg', 'video-thumbnail'],
    ['micro-credentials/images/ward-team.jpg', 'illustration'],
  ])('excludes %s (%s)', (rel, reason) => {
    expect(ok(rel)).toEqual({ ok: false, reason })
  })

  it('treats a named person as a portrait that is imported only for a staff page', () => {
    expect(looksLikePortrait('images/Frank_Xu.jpg')).toBe(true)
    expect(looksLikePortrait('images/academic-staff/divitha.png')).toBe(true)
    expect(looksLikePortrait('images/gallery/CBD_6.jpg')).toBe(false)
    expect(looksLikePortrait('images/melbourne-header.webp')).toBe(false)
    expect(looksLikePortrait('images/mnoba-rn.jpg')).toBe(false)
    expect(ok('images/Frank_Xu.jpg')).toEqual({ ok: false, reason: 'portrait-not-on-staff-page' })
    expect(classify('images/Frank_Xu.jpg', 800, { staffName: 'Frank Xu' })).toEqual({ ok: true, kind: 'portrait', alt: 'Frank Xu' })
    // a staff portrait may be narrower than a general photo (old profile photos are 250-580 px) but a placeholder never counts
    expect(classify('images/eleanor.jpg', 277, { staffName: 'Eleanor Hopper' }).ok).toBe(true)
    expect(classify('images/profile-placeholder.jpg', 800, { staffName: 'Kristi Latimore' })).toEqual({ ok: false, reason: 'placeholder' })
  })

  it('writes the legacyPath in the same shape as `media` and an alt that names the subject', () => {
    expect(legacyPathOf('images/gallery/CBD_6.jpg')).toBe(`${THEME_LEGACY_PREFIX}images/gallery/CBD_6.jpg`)
    expect(legacyPathOf('uploads:2021/10/master-nursing.webp')).toBe('wp-content/uploads/2021/10/master-nursing.webp')
    expect(altFromPath('images/gallery/CBD_6.jpg')).toBe('Melbourne CBD campus')
    expect(altFromPath('images/gallery/perth-lab-2013-2.jpg')).toMatch(/^Perth campus: /)
    expect(altFromPath('images/melbourne-header.webp')).toBe('Melbourne header')
    expect(altFromPath('images/gallery/IHM-NURSING-LAB-BED.jpg')).toBe('IHM NURSING LAB BED')
  })

  it('keeps one file per picture: same bytes or a near-identical rendition collapse onto the widest', () => {
    const f = (rel: string, sha: string, dhash: string, width: number, height = 600): HashedFile => ({ rel, sha, dhash, width, height })
    const { kept, alias } = dedupe([
      f('images/a-thumb.jpg', 's1', 'ffff0000ffff0000', 671, 593),
      f('images/a.jpg', 's2', 'ffff0001ffff0000', 1342, 1186), // one bit away, same aspect
      f('images/b.jpg', 's3', '0000ffff0000ffff', 900, 600),
      f('images/b2.jpg', 's3', 'aaaaaaaaaaaaaaaa', 900, 600), // same bytes
      f('images/c.jpg', 's4', 'ffff0000ffff0000', 800, 300), // same hash, different aspect: a different picture
    ])
    expect(kept.map((k) => k.rel)).toEqual(['images/a.jpg', 'images/b.jpg', 'images/c.jpg'])
    expect(alias).toEqual({ 'images/a-thumb.jpg': 'images/a.jpg', 'images/b2.jpg': 'images/b.jpg' })
    expect(hashDistance('ffff0000ffff0000', 'ffff0001ffff0000')).toBe(1)
  })
})

describe('staff photo matching', () => {
  const rels = ['images/Abhishek_Sharma.jpg', 'images/Gail_Baker.jpg', 'images/academic-staff/Helen_Almond.jpg', 'images/eleanor.jpg', 'images/Greety_Anthony.jpg']
  const ref = (name: string, photoSrc: string) => ({ slug: 's', name, photoSrc })

  it('reads the theme path of a profile image from an absolute or root-relative URL', () => {
    expect(themeRelOf(`https://ihm.edu.au/${THEME_LEGACY_PREFIX}images/mandeep_kaur.webp`)).toBe('images/mandeep_kaur.webp')
    expect(themeRelOf(`/${THEME_LEGACY_PREFIX}images/dr-%20zubair-ahmed-ratan.png`)).toBe('images/dr- zubair-ahmed-ratan.png')
    expect(themeRelOf('/wp-content/uploads/2021/a.jpg')).toBeNull()
  })

  it('finds the exact file, then the same file ignoring case; never a placeholder', () => {
    expect(matchLocal(ref('Eleanor Hopper', `/${THEME_LEGACY_PREFIX}images/eleanor.jpg`), rels)).toEqual({ rel: 'images/eleanor.jpg', method: 'exact' })
    expect(matchLocal(ref('Gail Baker', `/${THEME_LEGACY_PREFIX}images/gail_baker.jpg`), rels)).toEqual({ rel: 'images/Gail_Baker.jpg', method: 'case-insensitive' })
    expect(matchLocal(ref('Dr. Abhishek Sharma', `/${THEME_LEGACY_PREFIX}images/abhishek_sharma.webp`), rels)).toBeNull() // gone from the repo copy: live site or name match next
    expect(matchLocal(ref('Kristi Latimore', `/${THEME_LEGACY_PREFIX}images/profile-placeholder.jpg`), ['images/profile-placeholder.jpg'])).toBeNull()
  })

  it('matches a file name to a person by first and last name, tolerating a typo, never by first name alone', () => {
    expect(nameTokens('Assoc. Prof. Helen Mary Almond')).toEqual(['helen', 'almond'])
    expect(fileMentions('images/Abhishek_Sharma.jpg', 'Dr. Abhishek Sharma')).toBe(true)
    expect(fileMentions('images/Greety_Anthony.jpg', 'Greety Antony')).toBe(true)
    expect(fileMentions('images/academic-staff/Helen_Almond.jpg', 'Assoc. Prof. Helen Mary Almond')).toBe(true)
    expect(fileMentions('images/pankaj.webp', 'Mr Pankaj Patel')).toBe(false)
    expect(fileMentions('images/Bindu_Varguese.jpg', 'Dr. Bindu K Abraham')).toBe(false)
    expect(samePerson('Associate Professor Stephen McKeever', 'Assoc Prof. Stephen Mckeever')).toBe(true)
    expect(samePerson('Dr. Mandeep Kaur', 'Dr. Arundeep Kaur')).toBe(false)
  })

  it('lists the cards of a tabs block so a photo can be set in place', () => {
    const layout = [{ blockType: 'tabs', tabs: [{ blocks: [{ blockType: 'cardGrid', cards: [{ title: 'A One' }, { title: 'B Two', image: 5 }] }, { blockType: 'richText' }] }] }, { blockType: 'cardGrid', cards: [{ title: 'ignored' }] }]
    const cards = peopleCards(layout)
    expect(cards.map((c) => c.title)).toEqual(['A One', 'B Two'])
    cards[0].ref.image = 9
    expect((layout[0] as { tabs: { blocks: { cards: { image?: number }[] }[] }[] }).tabs[0].blocks[0].cards[0].image).toBe(9)
  })
})

describe('course hero plan', () => {
  const slugs = (() => {
    const file = resolve(INVENTORY_DIR, 'data/ihm/courses.json')
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as { slug: string }[]).map((c) => c.slug) : ['bachelor-of-nursing', 'diabetes-nursing', 'bachelor-of-social-work', 'nclex-for-rns', 'test-1']
  })()
  const everything = [...COURSE_RULES.flatMap(([, p]) => p), ...Object.values(SCHOOL_DEFAULTS).flat(), ...SITE_DEFAULT]
  const withAll: Resolve = (p) => (everything.includes(p) ? everything.indexOf(p) + 1 : null)

  it('gives every course a hero image, from the rules when the whole set exists', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(5)
    for (const slug of slugs) {
      const plan = planCourseHero({ slug, school: slug.includes('social-work') ? 'school-of-social-work' : 'school-of-nursing', refs: [] }, new Set(), withAll)
      expect(plan, slug).not.toBeNull()
    }
    expect(planCourseHero({ slug: 'diabetes-nursing', school: null, refs: [] }, new Set(), withAll)).toMatchObject({ source: 'rule', path: T('images/diabetes-nursing.jpg') })
  })

  it('falls back to the school default, then the site default, so even a bare media library leaves no course without one', () => {
    const onlySchool: Resolve = (p) => (p === SCHOOL_DEFAULTS['school-of-social-work'][0] ? 7 : null)
    expect(planCourseHero({ slug: 'unknown-course', school: 'school-of-social-work', refs: [] }, new Set(), onlySchool)).toMatchObject({ id: 7, source: 'school-default' })
    const onlySite: Resolve = (p) => (p === SITE_DEFAULT[0] ? 3 : null)
    for (const slug of slugs) expect(planCourseHero({ slug, school: 'school-of-dental', refs: [] }, new Set(), onlySite), slug).toMatchObject({ id: 3, source: 'site-default' })
    expect(planCourseHero({ slug: 'x', school: null, refs: [] }, new Set(), () => null)).toBeNull()
  })

  it("prefers the old page's own picture, but never a shared one, a logo or a portrait", () => {
    const html = (srcs: string[]) => srcs.map((s) => `<img src="${s}">`).join('')
    const refs = imageRefs(html([
      `/${THEME_LEGACY_PREFIX}images/teqsa.jpg`, // logo
      `/${THEME_LEGACY_PREFIX}images/academic-staff/Helen_Almond.jpg`, // portrait
      'https://img.youtube.com/vi/abc/hqdefault.jpg', // not ours
      `${LEGACY_BASE_URL}/wp-content/uploads/2022/10/MicrosoftTeams-image-1-scaled.jpg`, // furniture shared by many pages (the site's own host)
      'https://example.org/wp-content/uploads/2022/10/elsewhere.jpg', // another host: not ours
      `/${THEME_LEGACY_PREFIX}images/diabetes-thumb.jpg`,
    ]))
    expect(refs).toEqual([
      `${THEME_LEGACY_PREFIX}images/teqsa.jpg`, `${THEME_LEGACY_PREFIX}images/academic-staff/Helen_Almond.jpg`,
      'wp-content/uploads/2022/10/MicrosoftTeams-image-1-scaled.jpg', `${THEME_LEGACY_PREFIX}images/diabetes-thumb.jpg`,
    ])
    const shared = sharedImages([refs, refs, refs, refs, refs].map((r, i) => (i === 0 ? r : r.filter((x) => x.includes('MicrosoftTeams')))), 3)
    expect(shared.has('wp-content/uploads/2022/10/MicrosoftTeams-image-1-scaled.jpg')).toBe(true)
    const resolve: Resolve = () => 11
    expect(ownImage(refs, shared, resolve)).toEqual({ id: 11, path: `${THEME_LEGACY_PREFIX}images/diabetes-thumb.jpg` })
  })
})

describe('assignment never overwrites a person and is idempotent', () => {
  it('fills an empty field, keeps the same image, keeps a person upload, and only swaps an imported one with --force', () => {
    expect(decideWrite(null, 5, false)).toBe('set')
    expect(decideWrite({ id: 5, legacyPath: 'wp-content/x.jpg' }, 5, true)).toBe('keep-same')
    const byPerson: Current = { id: 9, legacyPath: null } // uploaded in /admin: no legacyPath
    expect(decideWrite(byPerson, 5, false)).toBe('keep-existing')
    expect(decideWrite(byPerson, 5, true)).toBe('keep-existing')
    const imported: Current = { id: 9, legacyPath: 'lp/old.webp' }
    expect(decideWrite(imported, 5, false)).toBe('keep-existing')
    expect(decideWrite(imported, 5, true)).toBe('replace-auto')
  })

  it('a second run over the same plan changes nothing', () => {
    const paths = new Map<number, string | null>([[1, 'wp-content/a.jpg'], [2, 'wp-content/b.jpg'], [3, null]])
    const docs: { id: string; image: number | null }[] = [{ id: 'empty', image: null }, { id: 'auto', image: 1 }, { id: 'person', image: 3 }]
    const plan: Record<string, number> = { empty: 2, auto: 1, person: 2 }
    const run = () => docs.map((d) => {
      const decision = decideWrite(d.image == null ? null : { id: d.image, legacyPath: paths.get(d.image) ?? null }, plan[d.id], false)
      if (decision === 'set' || decision === 'replace-auto') d.image = plan[d.id]
      return decision
    })
    expect(run()).toEqual(['set', 'keep-same', 'keep-existing'])
    expect(docs.map((d) => d.image)).toEqual([2, 1, 3])
    expect(run()).toEqual(['keep-same', 'keep-same', 'keep-existing'])
    expect(docs.map((d) => d.image)).toEqual([2, 1, 3])
  })
})
