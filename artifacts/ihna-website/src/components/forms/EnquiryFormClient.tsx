'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { site } from '@/content/site'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { brochureDownload, generateLead, pushOnce, type DataLayerEvent } from '@/components/tracking/datalayer'
import { countryNames } from '@/lib/enquiries/countries'
import { buildEnquirySchema } from '@/lib/enquiries/schema'
import { ATTRIBUTION_KEYS, type FormFieldDef, type PublicFormDef } from '@/lib/enquiries/types'

// The real EnquiryForm client (40 §4). react-hook-form + the SAME zod schema the server builds from the formDefinition.
// It posts JSON to /api/enquire/ and navigates to the thank-you path the SERVER returns (DEC-4): the browser never chooses it.
type Option = { value: string; label: string }
type Values = Record<string, string | boolean>
type Props = {
  def: PublicFormDef
  heading?: string | null
  campuses?: Option[]
  courses?: Option[]
  /** Course of the page the form sits on (course pages pass it through the render context). */
  presetCourseId?: string | null
  /** `sidebar` stacks the fields in one column. */
  layout?: 'card' | 'inline' | 'sidebar' | null
  className?: string
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const ERROR_FALLBACK = 'We could not save your enquiry. Please try again in a moment, or contact us by phone or email.'

declare global {
  interface Window { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, o: { action: string }) => Promise<string> } }
}

function loadRecaptcha(): void {
  if (!SITE_KEY || typeof document === 'undefined' || document.getElementById('recaptcha-v3')) return
  const s = document.createElement('script')
  s.id = 'recaptcha-v3'
  s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`
  s.async = true
  document.head.appendChild(s)
}

async function captchaToken(): Promise<string | undefined> {
  if (!SITE_KEY || !window.grecaptcha) return undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('captcha timeout')), 4000)
      window.grecaptcha!.ready(() => window.grecaptcha!.execute(SITE_KEY, { action: 'enquire' }).then((v) => { clearTimeout(t); resolve(v) }, reject))
    })
  } catch {
    return undefined // the server decides what a missing token means
  }
}

const cookie = (name: string): string | undefined => {
  const hit = document.cookie.split(/;\s*/).find((c) => c.startsWith(`${name}=`))
  return hit ? hit.slice(name.length + 1) : undefined
}
const cookieJson = (name: string): Record<string, unknown> => {
  try { return JSON.parse(decodeURIComponent(cookie(name) ?? '')) as Record<string, unknown> } catch { return {} }
}

/** campaign, UTM and click ids: this page's URL first, then the `site.attributionCookies` (last, first; 41 §4). Only plain strings leave. */
function attribution(): Record<string, string> {
  const out: Record<string, string> = {}
  const url = new URLSearchParams(window.location.search)
  const sources = [Object.fromEntries(url), cookieJson(site.attributionCookies.last), cookieJson(site.attributionCookies.first)] as Record<string, unknown>[]
  for (const k of ['campaign', ...ATTRIBUTION_KEYS]) {
    const v = sources.map((s) => s[k]).find((x) => typeof x === 'string' && x !== '')
    if (typeof v === 'string') out[k] = v.slice(0, 200)
  }
  return out
}

// Only a same-site path or the WhatsApp click-to-chat host may be followed. The server computed it; this is a second lock.
export function safeTarget(path: unknown): string | null {
  if (typeof path !== 'string') return null
  if (/^\/(?!\/)[^\s\\]*$/.test(path)) return path
  return /^https:\/\/api\.whatsapp\.com\/send\?/.test(path) ? path : null
}

/**
 * The conversion pushed once per submission (80 §4): `brochure_download` for a brochure form, else `generate_lead`. Opaque values only: the
 * form key, the campaign code, the course and campus ids, the student type and the server's `enquiryId` as `enquiry_ref`.
 */
export function leadEventFor(def: Pick<PublicFormDef, 'key' | 'fields' | 'thankYouType'>, values: Record<string, unknown>, campaign: string | undefined, enquiryId: unknown): DataLayerEvent {
  const of = (type: FormFieldDef['type']) => {
    const f = def.fields.find((x) => x.type === type)
    const v = f ? values[f.name] : undefined
    return typeof v === 'string' && v !== '' ? v : null
  }
  const courseCode = of('course')
  if (def.thankYouType === 'brochure') return brochureDownload({ formKey: def.key, courseCode })
  const studentType = typeof values.studentType === 'string' && values.studentType !== '' ? values.studentType : null
  return generateLead({ formKey: def.key, campaign: campaign ?? null, courseCode, campus: of('campus'), studentType, enquiryRef: typeof enquiryId === 'string' ? enquiryId : null })
}

function FieldControl({ f, field, campuses, courses, countries }: { f: FormFieldDef; field: { value: unknown; onChange: (v: unknown) => void; onBlur: () => void; name: string }; campuses: Option[]; courses: Option[]; countries: string[] }) {
  const value = field.value as string | boolean | undefined
  const select = (options: Option[], placeholder: string) => (
    <Select value={typeof value === 'string' ? value : ''} onValueChange={field.onChange}>
      <FormControl><SelectTrigger className="w-full min-w-0 max-w-full [&>span]:truncate" onBlur={field.onBlur}><SelectValue placeholder={placeholder} /></SelectTrigger></FormControl>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  )
  switch (f.type) {
    case 'textarea':
      return <FormControl><Textarea rows={4} maxLength={f.maxLength ?? 2000} {...field} value={(value as string) ?? ''} /></FormControl>
    case 'select':
      return select((f.options ?? []).map((o) => ({ value: o.value, label: o.label || o.value })), 'Choose…')
    case 'country':
      return select(countries.map((c) => ({ value: c, label: c })), 'Choose a country…')
    case 'campus':
      return select(campuses, 'Choose a campus…')
    case 'course':
      return select(courses, 'Choose a course…')
    case 'radio':
      return (
        <FormControl>
          <RadioGroup value={typeof value === 'string' ? value : ''} onValueChange={field.onChange} className="flex flex-wrap gap-x-6 gap-y-2 [&>label]:min-w-0">
            {(f.options ?? []).map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm"><RadioGroupItem value={o.value} />{o.label || o.value}</label>
            ))}
          </RadioGroup>
        </FormControl>
      )
    case 'email':
      return <FormControl><Input type="email" autoComplete="email" maxLength={254} {...field} value={(value as string) ?? ''} /></FormControl>
    case 'tel':
      return <FormControl><Input type="tel" autoComplete="tel" maxLength={20} {...field} value={(value as string) ?? ''} /></FormControl>
    default:
      return <FormControl><Input type="text" maxLength={f.maxLength ?? 200} autoComplete={f.name === 'firstName' ? 'given-name' : f.name === 'lastName' ? 'family-name' : f.name === 'name' ? 'name' : 'off'} {...field} value={(value as string) ?? ''} /></FormControl>
  }
}

export function EnquiryFormClient({ def, heading, campuses = [], courses = [], presetCourseId, layout, className }: Props) {
  const router = useRouter()
  const schema = useMemo(() => buildEnquirySchema(def), [def])
  const countries = useMemo(() => (def.fields.some((f) => f.type === 'country') ? countryNames() : []), [def])
  // Created once when the form mounts and kept for retries, so a double submit is one row. Never rendered, so SSR/CSR can differ.
  const [submissionId] = useState(() => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : ''))
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const defaults = useMemo(() => {
    const v: Values = {}
    for (const f of def.fields) v[f.name] = f.type === 'checkbox' ? false : ''
    return v
  }, [def])

  const form = useForm<Values>({ resolver: zodResolver(schema as never) as never, defaultValues: defaults, mode: 'onTouched' })

  useEffect(() => {
    if (def.captcha) loadRecaptcha()
    const q = new URLSearchParams(window.location.search)
    const courseField = def.fields.find((f) => f.type === 'course')
    const wanted = presetCourseId ?? q.get('course')
    if (courseField && wanted && /^\d+$/.test(wanted)) form.setValue(courseField.name, wanted)
    for (const f of def.fields) {
      const fromUrl = q.get(f.name)
      if (f.type === 'hidden' && fromUrl) form.setValue(f.name, fromUrl.slice(0, 100))
    }
  }, [def, presetCourseId, form])

  async function onSubmit(values: Values, event?: React.BaseSyntheticEvent) {
    setFormError(null)
    const attr = attribution()
    const body = {
      formKey: def.key,
      submissionId: submissionId || crypto.randomUUID(),
      fields: values,
      ...attr,
      hutk: cookie('hubspotutk'),
      pageUrl: `${window.location.origin}${window.location.pathname}${window.location.search}`,
      referrer: document.referrer || undefined,
      landingPath: window.location.pathname,
      _hp_url: (event?.target as HTMLFormElement | undefined)?.elements?.namedItem('_hp_url') instanceof HTMLInputElement ? ((event!.target as HTMLFormElement).elements.namedItem('_hp_url') as HTMLInputElement).value : '',
      captchaToken: def.captcha ? await captchaToken() : undefined,
    }
    let res: Response
    try {
      res = await fetch('/api/enquire/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.')
      return
    }
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string; fieldErrors?: Record<string, string>; thankYouPath?: string | null; enquiryId?: string }
    if (res.ok && json.ok) {
      // Pushed before navigating, so it reaches GTM whether the next page is ours, a brochure file or WhatsApp. Never blocks the redirect.
      try { pushOnce(`lead:${body.submissionId}`, leadEventFor(def, values, attr.campaign, json.enquiryId)) } catch { /* tracking only */ }
      const target = safeTarget(json.thankYouPath)
      if (target) {
        if (target.startsWith('/')) router.push(target)
        else window.location.assign(target)
        return
      }
      setDone(true)
      return
    }
    if (res.status === 400 && json.fieldErrors) {
      let first = true
      for (const [name, message] of Object.entries(json.fieldErrors)) {
        if (name in defaults) form.setError(name, { type: 'server', message }, { shouldFocus: first })
        first = false
      }
      setFormError('Please check the highlighted fields.')
      return
    }
    setFormError(json.message ?? (res.status >= 500 ? ERROR_FALLBACK : 'Something went wrong. Please try again.'))
  }

  if (done) {
    return (
      <div role="status" className={className} data-testid="enquiry-success">
        <h3 className="display text-2xl">Thank you</h3>
        <p className="mt-2 text-muted-foreground">We have received your enquiry and will be in touch shortly.</p>
      </div>
    )
  }

  const visible = def.fields.filter((f) => f.type !== 'hidden')
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values, e) => onSubmit(values, e))} noValidate className={className} data-form-key={def.key} aria-label={heading ?? def.name ?? 'Enquiry form'}>
        {heading && <h2 className="display text-3xl md:text-4xl">{heading}</h2>}
        <div className={layout === 'sidebar' ? 'mt-6 grid grid-cols-1 gap-5' : 'mt-6 grid grid-cols-1 gap-5 md:grid-cols-2'}>
          {visible.map((f) => {
            const wide = f.type === 'textarea' || f.type === 'radio' || f.type === 'checkbox'
            return (
              <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                <FormItem className={wide && layout !== 'sidebar' ? 'min-w-0 md:col-span-2' : 'min-w-0'}>
                  {f.type === 'checkbox' ? (
                    <div className="flex items-start gap-3">
                      <FormControl><Checkbox checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} onBlur={field.onBlur} /></FormControl>
                      <FormLabel className="text-sm font-normal leading-snug">{f.label || f.name}{f.required ? ' *' : ''}</FormLabel>
                    </div>
                  ) : (
                    <>
                      <FormLabel>{f.label || f.name}{f.required ? <span aria-hidden> *</span> : null}</FormLabel>
                      <FieldControl f={f} field={field} campuses={campuses} courses={courses} countries={countries} />
                    </>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
            )
          })}
        </div>

        {def.honeypot && (
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Leave this field empty<input type="text" name="_hp_url" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
          </div>
        )}

        {def.consentText && <p className="mt-5 text-xs text-muted-foreground">{def.consentText}</p>}
        {formError && <p role="alert" data-testid="enquiry-error" className="mt-5 text-sm font-medium text-destructive">{formError}</p>}
        <Button type="submit" size="lg" className="mt-6" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Sending…' : 'Send enquiry'}
        </Button>
      </form>
    </Form>
  )
}
