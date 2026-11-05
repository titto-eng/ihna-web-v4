import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { normalisePublicPath, validatePublicPath } from '@/collections/Documents'
import { findDocumentUncached } from '@/app/(site)/pdf/documents'
import { serveDocumentPath } from '@/app/(site)/pdf/serve'
import { boot, Cleanup, makeAlumnus, makeStaff, nonce, rejectsWith } from './helpers'

// `documents` (policy/procedure PDFs served at their old URLs): access matrix, publicPath rules, lookup and serving by path.
// Real Postgres through the Local API; every row (and its file in media/documents) is deleted afterwards.

let payload: Payload
const cleanup = new Cleanup()
const n = nonce()
type StaffUser = Awaited<ReturnType<typeof makeStaff>>
const staff = {} as Record<'admin' | 'marketing' | 'events' | 'finance' | 'viewer', StaffUser>

const pdf = (label: string) => {
  const data = Buffer.from(`%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n% ${label}\nxref\n0 1\n0000000000 65535 f \ntrailer << /Root 1 0 R >>\nstartxref\n0\n%%EOF\n`)
  return { data, mimetype: 'application/pdf', name: `test-${n}-${label}.pdf`, size: data.length }
}
const pathFor = (label: string) => `/pdf/policies/test-${n}-${label}.pdf`

async function createDoc(label: string, extra: { title?: string; publicPath?: string } = {}) {
  const doc = await payload.create({
    collection: 'documents',
    data: { title: `Test ${label}`, category: 'policy' as const, audience: 'public' as const, publicPath: pathFor(label), ...extra },
    file: pdf(label),
    overrideAccess: true,
  })
  cleanup.track('documents', doc.id)
  return doc
}

describe('publicPath rules (pure)', () => {
  it('accepts the site document prefixes with a .pdf ending, decoded', () => {
    for (const p of ['/pdf/ToR/A.pdf', '/brochures/x/B.PDF', '/ihna-policies/IHNA_Privacy_Policy.pdf', '/ihna-procedures/IHNA_Admission_&_Enrolment_Procedure.pdf', '/IHNA_International_Course_Guide/IHNA_International_Course_Guide.pdf', '/alumni/docs/A.pdf', '/wp-content/uploads/pdf/services_and_amenities.pdf', "/ihna-procedures/IHNA_Procedure_for_Cancelling_Student's_Enrollment_in_a_Course.pdf"]) {
      expect(validatePublicPath(p), p).toBe(true)
    }
  })
  it('rejects other prefixes, other extensions, traversal and encoded or query characters', () => {
    for (const p of ['', '/media/a.pdf', 'pdf/a.pdf', '/pdf/a.docx', '/IHM_Domestic_SHB/IHM_Domestic_SHB.pdf', '/wp-content/uploads/cover_letter/a.pdf', '/ihna-policy/a.pdf', '/pdf/../.env.pdf', '/pdf//a.pdf', '/pdf/./a.pdf', '/pdf/a%20b.pdf', '/pdf/a.pdf?x=1', '/pdf/a\\b.pdf', null, 3]) {
      expect(validatePublicPath(p), String(p)).not.toBe(true)
    }
  })
  it('normalises a pasted URL: host and query dropped, percent-encoding decoded, leading slash added', () => {
    expect(normalisePublicPath(' https://www.ihm.edu.au/pdf/policies/A%20B.pdf?x=1 ')).toBe('/pdf/policies/A B.pdf')
    expect(normalisePublicPath('pdf/policies/A.pdf')).toBe('/pdf/policies/A.pdf')
    expect(normalisePublicPath('/pdf/%E0%A4%A.pdf')).toBe('/pdf/%E0%A4%A.pdf') // malformed: kept, then rejected by validation
  })
})

describe('documents collection', () => {
  beforeAll(async () => {
    payload = await boot()
    for (const role of ['admin', 'marketing', 'events', 'finance', 'viewer'] as const) staff[role] = await makeStaff(payload, cleanup, role, `doc${n}`)
  })
  afterAll(async () => {
    await cleanup.run(payload)
    // A refused upload can leave its file behind; remove anything this run named.
    const dir = join(process.cwd(), 'media/documents')
    if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.startsWith(`test-${n}-`)) rmSync(join(dir, f))
  })

  it('access: anyone reads; marketing and admin create and update; only admin deletes; notes are staff-only', async () => {
    for (const role of ['events', 'finance', 'viewer'] as const) {
      await expect(
        payload.create({ collection: 'documents', data: { title: 'x', category: 'policy' as const, audience: 'public' as const, publicPath: pathFor(`deny-${role}`) }, file: pdf(`deny-${role}`), user: staff[role], overrideAccess: false }),
        `create as ${role}`,
      ).rejects.toThrow()
    }
    const { doc: alumnus } = await makeAlumnus(payload, cleanup, `doc${n}`, true)
    await expect(
      payload.create({ collection: 'documents', data: { title: 'x', category: 'policy' as const, audience: 'public' as const, publicPath: pathFor('deny-alumni') }, file: pdf('deny-alumni'), user: alumnus, overrideAccess: false }),
    ).rejects.toThrow()

    const doc = await payload.create({
      collection: 'documents',
      data: { title: 'By marketing', category: 'policy' as const, audience: 'public' as const, publicPath: pathFor('mkt'), notes: 'internal note' },
      file: pdf('mkt'),
      user: staff.marketing,
      overrideAccess: false,
    })
    cleanup.track('documents', doc.id)

    const anon = await payload.findByID({ collection: 'documents', id: doc.id, overrideAccess: false })
    expect(anon.title).toBe('By marketing')
    expect(anon.notes).toBeUndefined()
    const asViewer = await payload.findByID({ collection: 'documents', id: doc.id, user: staff.viewer, overrideAccess: false })
    expect(asViewer.notes).toBe('internal note')

    await payload.update({ collection: 'documents', id: doc.id, data: { title: 'Renamed' }, user: staff.marketing, overrideAccess: false })
    for (const role of ['events', 'finance', 'viewer'] as const) {
      await expect(payload.update({ collection: 'documents', id: doc.id, data: { title: role }, user: staff[role], overrideAccess: false }), `update as ${role}`).rejects.toThrow()
    }
    await expect(payload.delete({ collection: 'documents', id: doc.id, user: staff.marketing, overrideAccess: false })).rejects.toThrow()
    await payload.delete({ collection: 'documents', id: doc.id, user: staff.admin, overrideAccess: false })
    await expect(payload.findByID({ collection: 'documents', id: doc.id, overrideAccess: true })).rejects.toThrow()
  })

  it('a live URL does not move: marketing cannot change publicPath, admin can', async () => {
    const doc = await createDoc('move')
    const kept = await payload.update({ collection: 'documents', id: doc.id, data: { publicPath: pathFor('moved') }, user: staff.marketing, overrideAccess: false })
    expect(kept.publicPath).toBe(pathFor('move'))
    const moved = await payload.update({ collection: 'documents', id: doc.id, data: { publicPath: pathFor('moved') }, user: staff.admin, overrideAccess: false })
    expect(moved.publicPath).toBe(pathFor('moved'))
  })

  it('publicPath is validated, normalised and unique; only PDFs upload', async () => {
    await rejectsWith(
      payload.create({ collection: 'documents', data: { title: 'x', category: 'policy' as const, audience: 'public' as const, publicPath: '/media/x.pdf' }, file: pdf('bad-prefix'), overrideAccess: true }),
      /must start with/,
    )
    await rejectsWith(
      payload.create({ collection: 'documents', data: { title: 'x', category: 'policy' as const, audience: 'public' as const, publicPath: `/pdf/x-${n}.doc` }, file: pdf('bad-ext'), overrideAccess: true }),
      /end with \.pdf/,
    )
    const encoded = await createDoc('enc', { publicPath: `/pdf/policies/test-${n}-a%20b.pdf` })
    expect(encoded.publicPath).toBe(`/pdf/policies/test-${n}-a b.pdf`)

    await createDoc('dup')
    await rejectsWith(
      payload.create({ collection: 'documents', data: { title: 'dup 2', category: 'policy' as const, audience: 'public' as const, publicPath: pathFor('dup') }, file: pdf('dup2'), overrideAccess: true }),
      /already uses/,
    )
    expect(existsSync(join(process.cwd(), 'media/documents', `test-${n}-dup2.pdf`))).toBe(false) // refused before the file is written

    const text = Buffer.from('just text, not a pdf')
    await expect(
      payload.create({
        collection: 'documents',
        data: { title: 'txt', category: 'other' as const, audience: 'public' as const, publicPath: pathFor('txt') },
        file: { data: text, mimetype: 'text/plain', name: `test-${n}.txt`, size: text.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('looks a document up by its public path and serves its file there with 200 application/pdf', async () => {
    const doc = await createDoc('serve', { title: 'Served policy' })
    const found = await findDocumentUncached(pathFor('serve'))
    expect(found?.id).toBe(doc.id)
    expect(found?.title).toBe('Served policy')
    expect(await findDocumentUncached(pathFor('missing'))).toBeNull()

    const segments = ['policies', `test-${n}-serve.pdf`]
    const res = await serveDocumentPath(new Request(`http://localhost${pathFor('serve')}`), segments)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    expect(res.headers.get('content-disposition')).toMatch(/^inline; filename="test-.*-serve\.pdf"/)
    const body = Buffer.from(await res.arrayBuffer())
    expect(body.toString()).toContain('% serve')

    // The proxy's internal form serves the same file.
    const viaProxy = await serveDocumentPath(new Request('http://localhost/x'), ['~', 'pdf', ...segments])
    expect(viaProxy.status).toBe(200)

    // Replacing the file through the Local API changes what the same URL serves.
    await payload.update({ collection: 'documents', id: doc.id, data: {}, file: pdf('serve-v2'), overrideAccess: true })
    const after = await serveDocumentPath(new Request(`http://localhost${pathFor('serve')}`), segments)
    expect(Buffer.from(await after.arrayBuffer()).toString()).toContain('% serve-v2')

    const head = await serveDocumentPath(new Request(`http://localhost${pathFor('serve')}`, { method: 'HEAD' }), segments)
    expect(head.status).toBe(200)
    expect(head.body).toBeNull()
  })

  it('answers 404 for traversal and for paths no document or static file has', async () => {
    for (const segments of [['..', '..', '.env'], ['%2e%2e', 'package.json'], ['a%2Fb.pdf'], ['~', 'media', 'x.pdf'], ['~'], [`nope-${n}.pdf`]]) {
      const res = await serveDocumentPath(new Request('http://localhost/x'), segments)
      expect(res.status, segments.join('/')).toBe(404)
    }
  })
})
