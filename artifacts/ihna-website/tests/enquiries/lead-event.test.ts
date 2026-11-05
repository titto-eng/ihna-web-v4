import { describe, expect, it } from 'vitest'
import { leadEventFor } from '@/components/forms/EnquiryFormClient'
import type { FormFieldDef } from '@/lib/enquiries/types'

// 80 §4: one conversion per successful submission, with the server's enquiryId as `enquiry_ref` and no personal data.
const fields = [
  { name: 'name', type: 'text', label: 'Name' },
  { name: 'email', type: 'email', label: 'Email' },
  { name: 'course', type: 'course', label: 'Course' },
  { name: 'campus', type: 'campus', label: 'Campus' },
] as FormFieldDef[]
const values = { name: 'Asha Nair', email: 'asha@example.test', course: '12', campus: '3', studentType: 'international' }

describe('leadEventFor', () => {
  it('generate_lead carries opaque ids and enquiry_ref = the response enquiryId', () => {
    const e = leadEventFor({ key: 'quick-enquiry', fields, thankYouType: 'path' }, values, 'z29vz2fkcw', 'a1b2c3d4e5f6')
    expect(e).toEqual({ event: 'generate_lead', form_key: 'quick-enquiry', campaign: 'z29vz2fkcw', course_code: '12', campus: '3', student_type: 'international', enquiry_ref: 'a1b2c3d4e5f6' })
    expect(JSON.stringify(e)).not.toMatch(/Asha|example\.test/)
  })
  it('a brochure form pushes brochure_download', () => {
    expect(leadEventFor({ key: 'course-brochure', fields, thankYouType: 'brochure' }, values, undefined, 'x')).toEqual({ event: 'brochure_download', form_key: 'course-brochure', course_code: '12' })
  })
  it('drops what is not there', () => {
    expect(leadEventFor({ key: 'newsletter', fields: [], thankYouType: 'inline' }, {}, undefined, undefined)).toEqual({ event: 'generate_lead', form_key: 'newsletter' })
  })
})
