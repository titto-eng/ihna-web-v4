import { describe, expect, it } from 'vitest'
import { buildEnquirySchema, fieldErrors } from '@/lib/enquiries/schema'
import { forms as FORM_SEEDS } from '@/content/forms'

const def = {
  fields: [
    { name: 'firstName', type: 'text' as const, required: true, maxLength: 10 },
    { name: 'email', type: 'email' as const, required: true },
    { name: 'phone', type: 'tel' as const, required: true },
    { name: 'studentType', type: 'select' as const, options: [{ value: 'domestic' }, { value: 'international' }] },
    { name: 'consent', type: 'checkbox' as const, required: true },
    { name: 'note', type: 'textarea' as const, maxLength: 20 },
    { name: 'course', type: 'course' as const },
    { name: 'code', type: 'text' as const, pattern: '^[A-Z]{3}$' },
    { name: 'hidden', type: 'hidden' as const },
  ],
}
const valid = { firstName: ' Asha ', email: ' ASHA@Example.TEST ', phone: '+61 (4) 000-000', consent: true }

describe('buildEnquirySchema', () => {
  const schema = buildEnquirySchema(def)

  it('trims strings, lower-cases email and strips unknown keys', () => {
    const r = schema.safeParse({ ...valid, studentType: 'international', evil: '<script>', thankYouPath: 'https://evil.test' })
    expect(r.success).toBe(true)
    expect(r.data).toMatchObject({ firstName: 'Asha', email: 'asha@example.test', studentType: 'international' })
    expect(r.data).not.toHaveProperty('evil')
    expect(r.data).not.toHaveProperty('thankYouPath')
  })

  it('rejects missing required fields with the label in the message', () => {
    const r = schema.safeParse({})
    expect(r.success).toBe(false)
    const e = fieldErrors(r.error!)
    expect(Object.keys(e).sort()).toEqual(['consent', 'email', 'firstName', 'phone'])
    expect(e.firstName).toMatch(/required/i)
  })

  it('rejects a bad email, a bad phone, a select outside its options and an unticked required checkbox', () => {
    const bad = schema.safeParse({ ...valid, email: 'nope', phone: 'abc', studentType: 'martian', consent: false })
    expect(bad.success).toBe(false)
    expect(Object.keys(fieldErrors(bad.error!)).sort()).toEqual(['consent', 'email', 'phone', 'studentType'])
  })

  it('treats blank optional fields as absent and enforces maxLength and pattern', () => {
    expect(schema.safeParse({ ...valid, studentType: '', note: '' }).success).toBe(true)
    expect(schema.safeParse({ ...valid, firstName: 'x'.repeat(11) }).success).toBe(false)
    expect(schema.safeParse({ ...valid, note: 'x'.repeat(21) }).success).toBe(false)
    expect(schema.safeParse({ ...valid, code: 'abc' }).success).toBe(false)
    expect(schema.safeParse({ ...valid, code: 'ABC' }).success).toBe(true)
  })

  it('accepts a numeric course id and rejects anything that is not an id', () => {
    expect(buildEnquirySchema(def).safeParse({ ...valid, course: 12 }).data).toMatchObject({ course: '12' })
    expect(buildEnquirySchema(def).safeParse({ ...valid, course: '12; drop' }).success).toBe(false)
  })

  it('accepts checkbox strings from a no-JS post', () => {
    expect(schema.safeParse({ ...valid, consent: 'on' }).success).toBe(true)
  })
})

// Data-driven over the site's registry (src/content/forms.ts), so it covers IHNA's forms as they are added.
describe('seeded form definitions', () => {
  it('the registry is not empty and every key is canonical and appears once', () => {
    expect(FORM_SEEDS.length).toBeGreaterThan(0)
    expect(new Set(FORM_SEEDS.map((s) => s.key)).size).toBe(FORM_SEEDS.length)
    for (const s of FORM_SEEDS) expect(s.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it.each(FORM_SEEDS.map((s) => [s.key, s] as const))('%s compiles and rejects empty input when it has required fields', (_key, seed) => {
    const schema = buildEnquirySchema(seed)
    const required = seed.fields.filter((f) => f.required)
    const r = schema.safeParse({})
    expect(r.success).toBe(required.length === 0)
    if (!r.success) expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(required.map((f) => f.name).sort())
  })
})
