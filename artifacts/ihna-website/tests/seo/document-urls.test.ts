import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DOCUMENT_ALIASES } from '@/collections/Documents'
import { documentHref, documentsIn, findDocument, publicPathOf, type DocumentEntry } from '@/app/(site)/pdf/documents'
import { fileInside } from '@/app/(site)/pdf/serve'
import { PAGE_LINKS } from '../../scripts/import/steps/documents'

// Pure tests for document URLs (70-urls-seo): path parsing, alias lookup, the public/ containment check, and the page order.

const entry = (publicPath: string, extra: Partial<DocumentEntry> = {}): DocumentEntry => ({
  id: publicPath,
  title: publicPath,
  publicPath,
  filename: 'f.pdf',
  filesize: 1,
  updatedAt: '2026-10-20T00:00:00.000Z',
  category: 'policy',
  audience: 'public',
  listings: [],
  ...extra,
})

describe('publicPathOf', () => {
  it('maps direct /pdf segments and the proxy form /pdf/~/<prefix>/...', () => {
    expect(publicPathOf(['policies', 'A.pdf'])).toBe('/pdf/policies/A.pdf')
    expect(publicPathOf(['~', 'ihna-policies', 'IHNA_Privacy_Policy.pdf'])).toBe('/ihna-policies/IHNA_Privacy_Policy.pdf')
    expect(publicPathOf(['~', 'ihna-procedures', 'IHNA_Admission_&_Enrolment_Procedure.pdf'])).toBe('/ihna-procedures/IHNA_Admission_&_Enrolment_Procedure.pdf')
    expect(publicPathOf(['~', 'wp-content', 'uploads', 'pdf', 'services_and_amenities.pdf'])).toBe('/wp-content/uploads/pdf/services_and_amenities.pdf')
    expect(publicPathOf(['~', 'alumni', 'docs', 'IHNA-Alumni-Newsletter-October-2025.pdf'])).toBe('/alumni/docs/IHNA-Alumni-Newsletter-October-2025.pdf')
    expect(publicPathOf(['~', 'IHM_Domestic_SHB', 'Domestic-SHB.pdf'])).toBeNull() // an IHM store, not an IHNA one
  })
  it('decodes percent-encoded segments once', () => {
    expect(publicPathOf(['procedures', 'Student%20Selection_%20V%204.4_61_.pdf'])).toBe('/pdf/procedures/Student Selection_ V 4.4_61_.pdf')
    expect(publicPathOf(['procedures', 'Student Selection_ V 4.4_61_.pdf'])).toBe('/pdf/procedures/Student Selection_ V 4.4_61_.pdf')
  })
  it('rejects traversal, separators, foreign prefixes and non-PDF files', () => {
    for (const s of [['..', 'x.pdf'], ['%2e%2e', 'x.pdf'], ['a%2Fb.pdf'], ['a%5Cb.pdf'], ['', 'x.pdf'], ['x.txt'], ['~', 'media', 'x.pdf'], ['~', 'src', 'env.pdf'], ['~'], [], ['%E0%A4%A.pdf'], ['x%00.pdf']]) {
      expect(publicPathOf(s), s.join('/')).toBeNull()
    }
    for (const s of [['~', 'wp-content', 'uploads', 'cover_letter', 'x.pdf'], ['~', 'ihna-policy', 'x.pdf'], ['~', 'brochures-new', 'DON', 'x.pdf']]) {
      expect(publicPathOf(s), s.join('/')).toBeNull()
    }
  })
})

describe('findDocument', () => {
  const docs = [entry('/ihna-policies/IHNA_Privacy_Policy.pdf'), entry('/pdf/a.pdf')]
  const load = async () => docs
  it('finds the exact path, then an alias, else null', async () => {
    expect((await findDocument('/pdf/a.pdf', load))?.publicPath).toBe('/pdf/a.pdf')
    expect((await findDocument('/ihna-policies/IHNA_Privacy_Policy.pdf', load))?.publicPath).toBe('/ihna-policies/IHNA_Privacy_Policy.pdf')
    for (const [from, to] of Object.entries(DOCUMENT_ALIASES)) {
      expect((await findDocument(from, async () => [entry(to)]))?.publicPath).toBe(to)
    }
    expect(await findDocument('/pdf/b.pdf', load)).toBeNull()
  })
  it('every alias points at a different, valid document path', () => {
    for (const [from, to] of Object.entries(DOCUMENT_ALIASES)) {
      expect(from).not.toBe(to)
      expect(publicPathOf(['~', ...from.slice(1).split('/')])).toBe(from)
      expect(publicPathOf(['~', ...to.slice(1).split('/')])).toBe(to)
    }
  })
})

describe('fileInside', () => {
  const root = mkdtempSync(join(tmpdir(), 'docroot-'))
  const outside = mkdtempSync(join(tmpdir(), 'docout-'))
  mkdirSync(join(root, 'pdf'), { recursive: true })
  writeFileSync(join(root, 'pdf', 'a b&c.pdf'), '%PDF-1.4')
  writeFileSync(join(outside, 'secret.pdf'), 'secret')
  symlinkSync(join(outside, 'secret.pdf'), join(root, 'pdf', 'link.pdf'))
  it('finds a regular file inside the root', async () => {
    expect((await fileInside(root, '/pdf/a b&c.pdf'))?.size).toBe(8)
  })
  it('refuses traversal, directories and symlinks that leave the root', async () => {
    expect(await fileInside(root, '/pdf/../../etc/passwd')).toBeNull()
    expect(await fileInside(root, '/pdf')).toBeNull()
    expect(await fileInside(root, '/pdf/link.pdf')).toBeNull()
    expect(await fileInside(root, '/pdf/missing.pdf')).toBeNull()
  })
})

describe('/policies-procedures/ listing', () => {
  it('documentsIn keeps the listing order per section, so seeded orders reproduce the old page', () => {
    // Build entries the way the import seeds them: order = 10 × position within the section.
    const byPath = new Map<string, DocumentEntry>()
    const pos: Record<string, number> = {}
    for (const [section, href, label] of PAGE_LINKS) {
      const e = byPath.get(href) ?? entry(href, { title: label })
      pos[section] = (pos[section] ?? 0) + 10
      e.listings.push({ section, order: pos[section] })
      byPath.set(href, e)
    }
    const docs = [...byPath.values()].reverse()
    for (const section of ['student-policies', 'student-procedures', 'staff-policies', 'staff-procedures', 'glossary'] as const) {
      expect(documentsIn(docs, section).map((d) => d.publicPath)).toEqual(PAGE_LINKS.filter(([s]) => s === section).map(([, h]) => h))
    }
  })
  it('the page links no double-encoded or relative PDF', () => {
    for (const [, href] of PAGE_LINKS) {
      expect(href.startsWith('/'), href).toBe(true)
      expect(href, href).not.toMatch(/%25|%2F/i)
    }
    expect(PAGE_LINKS.some(([, h]) => h === '/ihna-policies/IHNA_Privacy_Policy.pdf')).toBe(true)
    for (const [, href] of PAGE_LINKS) expect(publicPathOf(['~', ...href.slice(1).split('/')]), href).toBe(href)
  })
  it('documentHref encodes spaces and keeps & as the old site linked it', () => {
    expect(documentHref('/pdf/procedures/Fraud &Corruption_Prevention&Control_Procedure.pdf')).toBe('/pdf/procedures/Fraud%20&Corruption_Prevention&Control_Procedure.pdf')
  })
})
