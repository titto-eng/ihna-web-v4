import { formByKey } from '@/content/forms'
import type { PublicFormDef } from './types'
import { toPublicDef } from './lookups'

export type Option = { value: string; label: string }
export type FormView = { def: PublicFormDef; campuses: Option[]; courses: Option[] }

/**
 * Everything the EnquiryForm server component needs. The definition is code (src/content/forms.ts); the campus and course options
 * come from the CMS, cached under their collection tags. Imports are dynamic so a block render outside Next (unit tests, no
 * database) simply gets the definition with empty option lists instead of crashing.
 */
export async function getFormView(formKey: string): Promise<FormView | null> {
  const raw = formByKey(formKey)
  if (!raw || raw.active === false) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[EnquiryForm] form "${formKey}" not available`)
    return null
  }
  const def = toPublicDef(raw)
  const wants = (t: string) => def.fields.some((f) => f.type === t)
  if (!wants('campus') && !wants('course')) return { def, campuses: [], courses: [] }
  try {
    const { unstable_cache } = await import('next/cache')
    const load = unstable_cache(
      async () => {
        const { getPayload } = await import('payload')
        const config = (await import('@payload-config')).default
        const payload = await getPayload({ config })
        const campuses = wants('campus')
          ? (await payload.find({ collection: 'campuses', limit: 100, depth: 0, sort: 'sortOrder', overrideAccess: false, pagination: false })).docs.map((c) => ({ value: String(c.id), label: c.name }))
          : []
        const courses = wants('course')
          ? (await payload.find({ collection: 'courses', where: { _status: { equals: 'published' } }, limit: 300, depth: 0, sort: 'title', select: { title: true }, overrideAccess: false, pagination: false })).docs.map((c) => ({ value: String(c.id), label: c.title }))
          : []
        return { campuses, courses }
      },
      ['enquiry-form-options', String(wants('campus')), String(wants('course'))],
      { tags: ['collection:campuses', 'collection:courses', 'campuses', 'courses'], revalidate: 3600 },
    )
    return { def, ...(await load()) }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[EnquiryForm] options for "${formKey}" not available: ${e instanceof Error ? e.message : e}`)
    return { def, campuses: [], courses: [] }
  }
}
