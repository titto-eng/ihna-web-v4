import { z } from 'zod'
import type { FormFieldDef } from './types'

// Client-safe: nothing here imports Payload or Node APIs. The browser form and the route use the same builder (40 §4).
export const TEL_PATTERN = /^[0-9 +()-]{5,20}$/
const ID_PATTERN = /^\d{1,12}$/

const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const asBoolean = (v: unknown) => (v === 'on' || v === 'true' || v === '1' || v === 1 ? true : v === 'false' || v === '0' || v === 0 || v === 'off' ? false : v)
const asIdString = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? String(v) : v)

const label = (f: FormFieldDef) => f.label?.trim() || f.name

function safeRegExp(source: string | null | undefined): RegExp | null {
  if (!source) return null
  try {
    return new RegExp(source)
  } catch {
    return null
  }
}

/** One field's validator. Optional fields accept a blank string (treated as absent). */
export function fieldSchema(f: FormFieldDef): z.ZodType {
  const name = label(f)
  const required = Boolean(f.required)
  const requiredMsg = `${name} is required`
  const max = f.maxLength && f.maxLength > 0 ? f.maxLength : undefined
  let inner: z.ZodType

  switch (f.type) {
    case 'email':
      inner = z.string({ error: requiredMsg }).trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email address' })).pipe(z.string().max(254))
      break
    case 'tel':
      inner = z.string({ error: requiredMsg }).trim().regex(TEL_PATTERN, { error: 'Enter a valid phone number (digits, spaces, + ( ) -)' })
      break
    case 'select':
    case 'radio': {
      const values = (f.options ?? []).map((o) => o.value).filter((v) => typeof v === 'string' && v !== '')
      inner = values.length
        ? z.enum(values as [string, ...string[]], { error: `Choose a valid ${name.toLowerCase()}` })
        : z.string({ error: requiredMsg }).trim().max(max ?? 200)
      break
    }
    case 'checkbox': {
      const bool = z.preprocess(asBoolean, z.boolean({ error: requiredMsg }))
      return required ? z.preprocess(asBoolean, z.literal(true, { error: `${name}: please tick to continue` })) : bool.optional()
    }
    case 'course':
    case 'campus':
      inner = z.preprocess(asIdString, z.string({ error: requiredMsg }).trim().regex(ID_PATTERN, { error: `Choose a valid ${name.toLowerCase()}` }))
      break
    case 'textarea':
      inner = z.string({ error: requiredMsg }).trim().max(max ?? 2000, { error: `${name} must be ${max ?? 2000} characters or fewer` })
      break
    case 'country':
      inner = z.string({ error: requiredMsg }).trim().max(max ?? 80)
      break
    case 'hidden':
      inner = z.string().trim().max(max ?? 200)
      break
    default:
      inner = z.string({ error: requiredMsg }).trim().max(max ?? 200, { error: `${name} must be ${max ?? 200} characters or fewer` })
  }

  const re = f.type === 'text' || f.type === 'textarea' || f.type === 'hidden' ? safeRegExp(f.pattern) : null
  if (re) inner = (inner as z.ZodString).regex(re, { error: `${name} is not in the expected format` })

  if (required) return z.preprocess(blankToUndefined, inner.refine((v) => v !== undefined && v !== '', { error: requiredMsg }))
  return z.preprocess(blankToUndefined, inner.optional())
}

/** zod object for a form definition: trimmed strings, unknown keys stripped, required fields enforced. */
export function buildEnquirySchema(def: { fields: FormFieldDef[] }) {
  const shape: Record<string, z.ZodType> = {}
  for (const f of def.fields) shape[f.name] = fieldSchema(f)
  return z.object(shape)
}

export type EnquiryValues = Record<string, string | boolean | undefined>

/** `{ field: first message }` from a zod error, for the 400 response and the client form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
