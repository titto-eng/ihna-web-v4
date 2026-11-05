import * as acorn from 'acorn'
import * as cheerio from 'cheerio'

// Staff profile pages (30-import §7.2 step 4). Two variants:
//   script: research / grants / activities / supervision are literal arrays in an inline <script>, rendered client side
//   static: the same data as `.reasearch-output-box` blocks inside the tab panes
// The script is parsed with acorn and a LITERAL-ONLY walker. It is never evaluated (no eval, no Function, no vm).
export type Row = Record<string, string>
export type StaffProfile = {
  variant: 'script' | 'static'
  name: string
  nameFromFallback: boolean
  postNominals: string
  position: string
  photoSrc: string
  linkedin: string
  googleScholar: string
  orcid: string
  bio: string
  research: Row[]
  grants: Row[]
  activities: Row[]
  supervision: Row[]
  /** mailto:/tel: found on the page and NOT kept (rule 4, DEC open question 5). */
  personalContactsDropped: number
  /** Independent count of array entries in the source (script variant), for the validation check. */
  sourceCounts: Record<'research' | 'grants' | 'activities' | 'supervision', number>
}

const ARRAYS = { researchData: 'research', grantsData: 'grants', activitiesData: 'activities', supervisionData: 'supervision' } as const
const KEYS = {
  research: ['category', 'title', 'authors', 'year', 'journal', 'description', 'viewLink', 'articleLink', 'link'],
  grants: ['title', 'amount', 'year', 'description'],
  activities: ['category', 'title', 'detail', 'year'],
  supervision: ['role', 'title', 'institution', 'year'],
} as const

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Literal-only evaluation of one AST node: strings, numbers, booleans, null, arrays, objects, +/- numbers, plain template strings. */
function literal(node: acorn.AnyNode): unknown {
  switch (node.type) {
    case 'Literal': return node.value
    case 'TemplateLiteral':
      if (node.expressions.length) throw new Error('template literal with expressions')
      return node.quasis.map((q) => q.value.cooked).join('')
    case 'ArrayExpression': return node.elements.map((e) => (e ? literal(e) : null))
    case 'ObjectExpression':
      return Object.fromEntries(
        node.properties.map((p) => {
          if (p.type !== 'Property' || p.computed) throw new Error('non-literal property')
          const key = p.key.type === 'Identifier' ? p.key.name : String((p.key as acorn.Literal).value)
          return [key, literal(p.value)]
        }),
      )
    case 'UnaryExpression':
      if (node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number') return -node.argument.value
      throw new Error('non-literal unary')
    default: throw new Error(`non-literal ${node.type}`)
  }
}

/** The four data arrays of a script-variant page; other statements are ignored, anything non-literal inside an array throws. */
export function parseProfileScript(code: string): Partial<Record<keyof typeof KEYS, Row[]>> {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script' })
  const out: Partial<Record<keyof typeof KEYS, Row[]>> = {}
  for (const st of ast.body) {
    if (st.type !== 'VariableDeclaration') continue
    for (const d of st.declarations) {
      const target = d.id.type === 'Identifier' ? ARRAYS[d.id.name as keyof typeof ARRAYS] : undefined
      if (!target || d.init?.type !== 'ArrayExpression') continue
      const keys = KEYS[target] as readonly string[]
      out[target] = (literal(d.init) as Record<string, unknown>[]).map((o) =>
        Object.fromEntries(keys.filter((k) => o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== '').map((k) => [k, String(o[k]).trim()])),
      )
    }
  }
  return out
}

/**
 * Entries per array counted straight from the source text: the cross-check for the AST walker. A small scanner (strings, `//` and
 * block comments aware) counts the `{` that open an object directly inside `varName = [ ... ]`, so minified one-line arrays count too.
 */
function stripComments(code: string): string {
  let out = ''
  for (let i = 0; i < code.length; i++) {
    const c = code[i]
    if (c === '"' || c === "'" || c === '`') {
      const start = i
      for (i++; i < code.length && code[i] !== c; i++) if (code[i] === '\\') i++
      out += code.slice(start, i + 1)
    } else if (c === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++
      out += '\n'
    } else if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      i = end < 0 ? code.length : end + 1
    } else out += c
  }
  return out
}

export function countSourceEntries(source: string): StaffProfile['sourceCounts'] {
  const counts = { research: 0, grants: 0, activities: 0, supervision: 0 }
  const code = stripComments(source) // a commented-out `// const grantsData = [` must not count
  for (const [varName, key] of Object.entries(ARRAYS)) {
    const m = new RegExp(`\\b${varName}\\s*=\\s*\\[`).exec(code)
    if (!m) continue
    let depth = 0
    let rows = 0
    for (let i = m.index + m[0].length - 1; i < code.length; i++) {
      const c = code[i]
      const next = code[i + 1]
      if (c === '"' || c === "'" || c === '`') {
        for (i++; i < code.length && code[i] !== c; i++) if (code[i] === '\\') i++
      } else if (c === '/' && next === '/') {
        while (i < code.length && code[i] !== '\n') i++
      } else if (c === '/' && next === '*') {
        i = code.indexOf('*/', i + 2) + 1
        if (i === 0) break
      } else if (c === '[' || c === '{') {
        if (c === '{' && depth === 1) rows++
        depth++
      } else if (c === ']' || c === '}') {
        depth--
        if (depth === 0) break
      }
    }
    counts[key] = rows
  }
  return counts
}

const linkOf = ($: cheerio.CheerioAPI, part: string) => $(`.personal-details-box a[href*="${part}"]`).first().attr('href')?.trim() ?? ''

function bioOf($: cheerio.CheerioAPI): string {
  const lines: string[] = []
  const box = $('#about .details-container').first()
  box.children().each((_, el) => {
    if (el.type !== 'tag') return
    const $el = $(el)
    if ($el.is('h4.tab-title')) return
    if ($el.is('p, h5, h6')) lines.push(norm($el.text()))
    else if ($el.is('ul, ol')) $el.find('li').each((_, li) => void lines.push(`- ${norm($(li).text())}`))
    else if ($el.is('table')) $el.find('tr').each((_, tr) => void lines.push($(tr).children('th,td').toArray().map((c) => norm($(c).text())).filter(Boolean).join(' | ')))
    else if ($el.text().trim()) lines.push(norm($el.text()))
  })
  return lines.filter(Boolean).join('\n\n')
}

function staticRows($: cheerio.CheerioAPI, pane: string): Row[] {
  return $(`#${pane} .reasearch-output-box`).toArray().map((box) => {
    const b = $(box)
    const row: Row = {}
    const set = (k: string, v: string) => v && (row[k] = v)
    set('category', norm(b.find('.category-text').first().text()))
    set('title', norm(b.find('.journal-title').first().text()))
    set('authors', norm(b.find('.authors-name').first().text()))
    b.find('.link-container a').each((_, a) => {
      const href = $(a).attr('href')?.trim() ?? ''
      const label = norm($(a).text()).toLowerCase()
      if (!href) return
      if (label.includes('details')) row.articleLink = href
      else if (label.includes('view')) row.viewLink = href
      else row.link ??= href
    })
    return row
  })
}

export function parseStaffPage(html: string, fallbackName = ''): StaffProfile {
  const $ = cheerio.load(html)
  const scripts = $('script').toArray().map((s) => $(s).html() ?? '').filter((c) => /\b(researchData|grantsData|activitiesData|supervisionData)\s*=/.test(c))
  const script = scripts.join('\n')
  const details = $('.personal-details-box .details').first()
  let name = norm(details.find('h4').first().text()) || norm(details.find('h2, h3, h1').first().text())
  const nameFromFallback = !name
  if (!name) name = fallbackName
  const parsed = script ? parseProfileScript(script) : {}
  const isScript = Boolean(script)
  const fromStatic = (k: 'research' | 'grants' | 'activities' | 'supervision', pane: string) => (isScript ? (parsed[k] ?? []) : staticRows($, pane).map((r) => (k === 'research' ? r : { title: r.title ?? '', ...(r.category ? { category: r.category } : {}), ...(r.authors ? { detail: r.authors } : {}) })))
  return {
    variant: isScript ? 'script' : 'static',
    name,
    nameFromFallback,
    postNominals: norm(details.find('p.xsm-text').first().text()),
    position: norm(details.find('p.designation-text').first().text()),
    photoSrc: $('.profile-img-box img').first().attr('src')?.trim() ?? '',
    linkedin: linkOf($, 'linkedin.com'),
    googleScholar: linkOf($, 'scholar.google'),
    orcid: linkOf($, 'orcid.org'),
    bio: bioOf($),
    research: fromStatic('research', 'reasearchOutputs'),
    grants: fromStatic('grants', 'fundedResearch'),
    activities: fromStatic('activities', 'professionalActivities'),
    supervision: fromStatic('supervision', 'supervision'),
    personalContactsDropped: $('.personal-details-box a[href^="mailto:"], .personal-details-box a[href^="tel:"]').length,
    sourceCounts: script ? countSourceEntries(script) : { research: 0, grants: 0, activities: 0, supervision: 0 },
  }
}
