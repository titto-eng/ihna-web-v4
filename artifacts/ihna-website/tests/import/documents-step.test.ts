import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { categoryFromName, classify, plan, titleFromFile } from '../../scripts/import/steps/documents'

// The `documents` import step's planning (no database): folders → category/audience (seeds/documents.ts), titles from the policies
// page, held files.

describe('documents import: classification', () => {
  it('uses the folder for policies, procedures, student loan sheets and the course guide', () => {
    expect(classify('/ihna-policies/X.pdf')).toEqual({ category: 'policy', audience: 'students' })
    expect(classify('/ihna-procedures/X.pdf')).toEqual({ category: 'procedure', audience: 'students' })
    expect(classify('/pdf/VSL-VFH-policies-procedures/VSL_Refund_Procedure.pdf')).toEqual({ category: 'procedure', audience: 'students' })
    expect(classify('/pdf/VET_Student_Loan/2026/X.pdf')).toEqual({ category: 'guide', audience: 'students' })
    expect(classify('/IHNA_International_Course_Guide/IHNA_International_Course_Guide.pdf')).toEqual({ category: 'guide', audience: 'public' })
    expect(classify('/brochures/DON.pdf').category).toBe('brochure')
    expect(classify('/pdf/IHNA_International_Student_Application_Form.pdf')).toEqual({ category: 'form', audience: 'public' })
  })
  it('guesses loose files from the name', () => {
    expect(categoryFromName('IHM_Conflict_of_Interest_Declaration_Form.pdf')).toBe('form')
    expect(categoryFromName('Learning_Access_Plan.pdf')).toBe('form')
    expect(categoryFromName('IHM_Registration_Information.pdf')).toBe('guide')
    expect(categoryFromName('What-documents-do-I-need-to-submit-for-a-FEE-HELP-application.pdf')).toBe('guide')
    expect(categoryFromName('Glossary_of_Terms_Feb_2026.pdf')).toBe('guide')
    expect(categoryFromName('BSW Handbook 2026.pdf')).toBe('handbook')
    expect(categoryFromName('corporate_thing.pdf')).toBe('other')
  })
  it('cleans file names into titles', () => {
    expect(titleFromFile('/pdf/Fee-Help/How-do-I-apply.pdf')).toBe('How do I apply')
    expect(titleFromFile('/pdf/IHM_Prospectus 1.pdf')).toBe('IHM Prospectus 1')
  })
})

describe('documents import: plan', () => {
  const root = mkdtempSync(join(tmpdir(), 'docplan-'))
  const put = (p: string) => {
    mkdirSync(dirname(join(root, p)), { recursive: true })
    writeFileSync(join(root, p), '%PDF-1.4')
  }
  for (const p of [
    'ihna-policies/IHNA_Privacy_Policy.pdf',
    'ihna-procedures/IHNA_Access_and_Equity_Procedure.pdf',
    'pdf/IHNA_glossary_of_terms.pdf',
    'pdf/IHNA_Prospectus_old.pdf',
    'pdf/Diploma_of_Nursing/Entry requirement-International.docx',
    'wp-content/uploads/pdf/services_and_amenities.pdf',
    'alumni/docs/Newsletter.pdf',
    'emailers/don/header.pdf',
  ]) put(p)
  const { planned, skipped } = plan(root, new Set(['/pdf/IHNA_Prospectus_old.pdf']))
  const by = new Map(planned.map((p) => [p.publicPath, p]))

  it('creates one row per PDF of the document stores, skipping held files, non-PDFs and other folders', () => {
    expect([...by.keys()].sort()).toEqual([
      '/alumni/docs/Newsletter.pdf',
      '/ihna-policies/IHNA_Privacy_Policy.pdf',
      '/ihna-procedures/IHNA_Access_and_Equity_Procedure.pdf',
      '/pdf/IHNA_glossary_of_terms.pdf',
      '/wp-content/uploads/pdf/services_and_amenities.pdf',
    ])
    expect(skipped.map((s) => s.path)).toEqual(['/pdf/IHNA_Prospectus_old.pdf'])
  })
  it('takes titles and per-tab listings from the page links', () => {
    const privacy = by.get('/ihna-policies/IHNA_Privacy_Policy.pdf')!
    expect(privacy.title).toBe('Privacy Policy')
    expect(privacy.listings).toEqual([{ section: 'student-policies', order: expect.any(Number) }])
    expect(by.get('/ihna-procedures/IHNA_Access_and_Equity_Procedure.pdf')!.listings.map((l) => l.section)).toEqual(['student-procedures'])
    expect(by.get('/pdf/IHNA_glossary_of_terms.pdf')!.listings.map((l) => l.section)).toEqual(['glossary'])
    expect(by.get('/wp-content/uploads/pdf/services_and_amenities.pdf')!.title).toBe('List of Services and Amenities')
    expect(by.get('/alumni/docs/Newsletter.pdf')!).toMatchObject({ title: 'Newsletter', listings: [] })
  })
})
