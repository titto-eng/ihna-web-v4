import { beforeAll, describe, expect, it } from 'vitest'
import { findLegacyMarkup } from '../../scripts/import/lib/assert-clean'
import { formKeyForAction } from '../../scripts/import/lib/formkeys'
import { createLexicaliser, lexicalText, type Lexicalise } from '../../scripts/import/lib/lexical'
import { convertHtml, type PayloadBlock } from '../../scripts/import/lib/to-payload'
import { allBlockSlugs } from './helpers'

// Fixtures cover the patterns the production extractor must get right (30-import §7.1, DEC-15). Everything goes through the real
// pipeline: extract → real block shapes → Lexical (convertHTMLToLexical). No database is touched.
let lexical: Lexicalise
const MEDIA = { 'wp-content/uploads/2024/05/campus.jpg': 41 }
const run = (html: string, extra: { allowedEmbedHosts?: string[] } = {}) =>
  convertHtml(html, { url: 'https://ihm.edu.au/x/', wpType: 'page', ...extra }, { lexical, mediaMap: MEDIA })
const types = (blocks: PayloadBlock[]) => blocks.map((b) => b.blockType)
const text = (blocks: PayloadBlock[]): string =>
  blocks.map((b) => JSON.stringify(b, (_, v) => (v && typeof v === 'object' && 'root' in v ? lexicalText(v) : v))).join(' ')

beforeAll(async () => {
  lexical = await createLexicaliser(MEDIA)
})

const TABS = `
<div class="container"><h1 class="titleH2">Student life</h1>
  <ul class="nav nav-tabs" role="tablist">
    <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#t-a" type="button">Housing</button></li>
    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#t-b" type="button">Transport</button></li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane fade show active" id="t-a"><p class="lead" style="color:red">Find a <a class="btn" href="https://ihm.edu.au/housing/">home</a> near campus.</p></div>
    <div class="tab-pane fade" id="t-b"><h3>Trains</h3><p>Trains run every ten minutes.</p></div>
  </div>
</div>`

const ACCORDION_WITH_TABLE = `
<div class="accordion" id="fees">
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#f1">Tuition fees</button></h2>
    <div id="f1" class="accordion-collapse collapse show"><div class="accordion-body">
      <p>Fees per unit are below.</p>
      <table class="table"><thead><tr><th>Course</th><th>Fee</th></tr></thead><tbody><tr><td>Master of Nursing</td><td>$4,200</td></tr></tbody></table>
    </div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#f2">Payment</button></h2>
    <div id="f2" class="accordion-collapse collapse"><div class="accordion-body"><p>Pay by card.</p></div></div>
  </div>
</div>`

describe('html-to-blocks (production extractor)', () => {
  it('turns a Bootstrap tabs page into a hero and a tabs block with nested blocks', () => {
    const out = run(TABS)
    expect(types(out.layout)).toEqual(['hero', 'tabs'])
    const tabs = out.layout[1] as PayloadBlock & { tabs: { label: string; blocks: PayloadBlock[] }[] }
    expect(tabs.tabs.map((t) => t.label)).toEqual(['Housing', 'Transport'])
    expect(types(tabs.tabs[0].blocks)).toContain('richText')
    expect(text(tabs.tabs[1].blocks)).toContain('Trains run every ten minutes')
    expect(findLegacyMarkup(out.layout)).toEqual([])
  })

  it('keeps a table inside an accordion body as a nested table block (DEC-15d)', () => {
    const out = run(ACCORDION_WITH_TABLE)
    const accordion = out.layout.find((b) => b.blockType === 'accordion') as PayloadBlock & { items: { title: string; blocks: PayloadBlock[] }[] }
    expect(accordion.items.map((i) => i.title)).toEqual(['Tuition fees', 'Payment'])
    expect(types(accordion.items[0].blocks)).toEqual(['richText', 'table'])
    const table = accordion.items[0].blocks[1] as PayloadBlock & { rows: string[][]; headerRow: boolean }
    expect(table.rows).toEqual([['Course', 'Fee'], ['Master of Nursing', '$4,200']])
    expect(table.headerRow).toBe(true)
    expect(types(accordion.items[1].blocks)).toEqual(['richText'])
  })

  it('strips scripts, on* handlers, javascript: links, classes and inline styles', () => {
    const out = run(`
      <div class="wrapper" style="background:url(/x.png)" id="main">
        <script>window.steal(document.cookie)</script>
        <style>.a{color:red}</style>
        <p class="intro" onclick="alert(1)">Read the <a href="javascript:alert(2)" onmouseover="x()">policy</a> now.</p>
        <button onclick="go()">Click</button>
      </div>`)
    const dump = JSON.stringify(out.layout)
    expect(dump).not.toMatch(/steal|alert|onclick|onmouseover|javascript:|<script|<style/i)
    expect(text(out.layout)).toContain('Read the policy now.')
    expect(findLegacyMarkup(out.layout)).toEqual([])
  })

  it('drops an iframe on a host that is not allowlisted and reports it', () => {
    const out = run(`<p>Before</p><iframe src="https://evil.example.com/steal" title="x" height="500"></iframe><p>After</p>`)
    expect(JSON.stringify(out.layout)).not.toContain('evil.example.com')
    expect(types(out.layout)).not.toContain('iframeEmbed')
    expect(out.reviewStatus).toBe('check')
    expect(out.reasons.some((r) => r.startsWith('unplaced:iframe'))).toBe(true)
    expect(text(out.layout)).toContain('Before')
    expect(text(out.layout)).toContain('After')
  })

  it('emits iframeEmbed / mapEmbed / videoEmbed only for allowlisted hosts', () => {
    const out = run(`
      <iframe src="https://my.matterport.com/show/?m=abc" title="Brisbane tour" height="600"></iframe>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12" title="Map"></iframe>
      <iframe src="https://www.youtube.com/embed/M7lc1UVf-VE" title="Intro"></iframe>
      <iframe src="https://www.google.com/search?q=x"></iframe>`)
    expect(types(out.layout)).toEqual(['iframeEmbed', 'mapEmbed', 'videoEmbed'])
    expect(out.layout[0]).toMatchObject({ url: 'https://my.matterport.com/show/?m=abc', title: 'Brisbane tour', height: 600 })
    expect(out.layout[2]).toMatchObject({ url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', title: 'Intro' })
  })

  it('honours siteSettings.allowedEmbedHosts passed in by the step', () => {
    const html = '<iframe src="https://forms.example.org/f/1" title="Form"></iframe>'
    expect(types(run(html).layout)).toEqual([])
    expect(types(run(html, { allowedEmbedHosts: ['forms.example.org'] }).layout)).toEqual(['iframeEmbed'])
  })

  it('maps a known form action to its formKey and drops unknown forms', () => {
    const out = run(`<form action="/wp-admin/admin-post.php?action=quick_enquiry_ihm_blog" method="post"><input name="email"></form>
      <form action="https://library.hci.edu.au/discovery/search" method="get"><input name="q"></form>`)
    expect(out.layout).toEqual([expect.objectContaining({ blockType: 'enquiryForm', formKey: 'blog-enquiry' })])
    expect(formKeyForAction('https://ihm.edu.au/wp-admin/admin-post.php?action=sae_enquiry_ihm')).toBe('sae-enquiry')
    expect(formKeyForAction('/action_page.php')).toBe('newsletter')
    expect(formKeyForAction('https://example.org/x')).toBeNull()
  })

  it('turns an owl-carousel into testimonials / cardGrid, never richText', () => {
    const out = run(`
      <div id="customers-testimonials" class="owl-carousel">
        <div class="item"><div class="shadow-effect"><p>The IHM teachers gave me super guidance and support throughout.</p></div><div class="testimonial-name">Ajitha A</div></div>
        <div class="item"><div class="shadow-effect"><p>The blended learning approach and the support staff were excellent.</p></div><div class="testimonial-name">Maria B</div></div>
      </div>
      <div class="owl-carousel blogList-carousel">
        <div class="item"><div class="news-thumb-box"><div class="news-list-item"><h5>Why nursing</h5><ul><li><a href="https://ihm.edu.au/blog/why/">Read more</a></li></ul></div></div></div>
      </div>`)
    expect(types(out.layout)).toEqual(['testimonials', 'cardGrid'])
    expect((out.layout[0] as unknown as { inline: unknown[] }).inline).toHaveLength(2)
    expect(out.layout[1]).toMatchObject({ variant: 'carousel', cards: [{ title: 'Why nursing', href: '/blog/why/' }] })
  })

  it('removes personal contact links but keeps role mailboxes (rule 4)', () => {
    const out = run(`<p>Email <a href="mailto:jane.citizen@ihm.edu.au">Jane</a>, <a href="mailto:enquiry@ihm.edu.au">the team</a> or call
      <a href="tel:0431030950">Jane</a> or <a href="tel:1800 763 757">us</a>.</p>`)
    const dump = JSON.stringify(out.layout)
    expect(dump).not.toContain('jane.citizen@')
    expect(dump).not.toContain('0431030950')
    expect(dump).toContain('mailto:enquiry@ihm.edu.au')
    expect(dump).toContain('tel:1800763757')
  })

  it('places an imported image as a Lexical upload node and drops one that was not imported', () => {
    const out = run(`<p>Campus <img src="https://ihm.edu.au/wp-content/uploads/2024/05/campus.jpg" alt="Campus"> view</p>
      <p><img src="https://example.org/other.jpg" alt="x"></p>`)
    const dump = JSON.stringify(out.layout)
    expect(dump).toContain('"type":"upload"')
    expect(dump).toContain('"value":41')
    expect(dump).not.toContain('example.org')
    expect(out.reasons).toContain('image-not-imported')
  })

  it('only emits block slugs that exist in the registry', () => {
    const out = run(TABS + ACCORDION_WITH_TABLE)
    const slugs = allBlockSlugs()
    const walk = (bs: PayloadBlock[]) => {
      for (const b of bs) {
        expect(slugs).toContain(b.blockType)
        for (const t of (b.tabs as { blocks: PayloadBlock[] }[]) ?? []) walk(t.blocks)
        for (const i of (b.items as { blocks: PayloadBlock[] }[]) ?? []) walk(i.blocks)
      }
    }
    walk(out.layout)
  })
})

describe('html-to-blocks: site host and WordPress form handlers', () => {
  it('relativises links to the page’s own host (www. and uat. too) and keeps other hosts absolute', async () => {
    const { extract } = await import('../../scripts/import/html-to-blocks')
    const html = '<p><a href="https://ihna.edu.au/usi/">USI</a> <a href="https://uat.ihna.edu.au/orientation/">Orientation</a> <a href="http://www.ihna.edu.au/">Home</a> <a href="https://ihm.edu.au/courses/">IHM</a></p>'
    const out = extract(html, { url: 'https://ihna.edu.au/current-students/', wpType: 'page' })
    const rich = String(out.layout[0].html)
    expect(rich).toContain('href="/usi/"')
    expect(rich).toContain('href="/orientation/"')
    expect(rich).toContain('href="/"')
    expect(rich).toContain('href="https://ihm.edu.au/courses/"')
  })

  it('reads the handler from a hidden action input and maps it with the site’s form keys', async () => {
    const { extract } = await import('../../scripts/import/html-to-blocks')
    const html = '<form action="/wp-admin/admin-post.php" method="get"><input type="hidden" name="action" value="quick_enquiry"><input name="email"></form>'
    const out = extract(html, { url: 'https://ihna.edu.au/x/', wpType: 'page' })
    expect(out.layout).toEqual([expect.objectContaining({ blockType: 'enquiryForm', formKey: 'quick-enquiry' })])
    expect(formKeyForAction('/wp-admin/admin-post.php?action=lib_enquiry')).toBe('library-enquiry')
    expect(formKeyForAction('/wp-admin/admin-post.php?action=lp_enquiry')).toBe('lp-enquiry')
  })
})

describe('html-to-blocks: hero image beside the h1', () => {
  it('takes a picture alone in the sibling column of the h1 as the hero image', async () => {
    const { extract } = await import('../../scripts/import/html-to-blocks')
    const html = '<section><div class="container"><div class="row"><div class="col-md-5"><h1>Your gateway</h1></div><div class="col-md-7"><img src="/images/a.jpg" alt="Nurse"></div></div></div></section><p>Body text that stays.</p>'
    const out = extract(html, { url: 'https://ihna.edu.au/about-us/', wpType: 'page' })
    expect(out.layout[0]).toMatchObject({ blockType: 'hero', heading: 'Your gateway', image: { src: 'https://ihna.edu.au/images/a.jpg', alt: 'Nurse' } })
    expect(JSON.stringify(out.layout.slice(1))).not.toContain('<img')
    expect(JSON.stringify(out.layout)).toContain('Body text that stays')
  })
})

describe('html-to-blocks: lite YouTube players', () => {
  it('keeps a div.youtube-player that has no text of its own', async () => {
    const { extract } = await import('../../scripts/import/html-to-blocks')
    const out = extract('<div class="videoBoxCT"><div class="pressmeetVideo"><div class="youtube-player" data-id="NZJlSIaRkSo"></div><h5>Perth</h5></div></div>', { url: 'https://ihna.edu.au/x/', wpType: 'page' })
    expect(out.layout).toEqual([expect.objectContaining({ blockType: 'videoEmbed', url: 'https://www.youtube.com/watch?v=NZJlSIaRkSo', title: 'Perth' })])
  })
})
