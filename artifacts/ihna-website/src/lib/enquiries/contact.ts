// Canonical field names the seeds use. The contact columns of `enquiries` are read from them; everything else stays in `data`.
export type Contact = { firstName?: string; lastName?: string; email?: string; phone?: string; country?: string; studentType?: string; consent?: boolean }

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined)

export function splitName(full: string): { firstName: string; lastName?: string } {
  const parts = full.trim().split(/\s+/)
  return { firstName: parts[0] ?? '', lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined }
}

export function contactFrom(values: Record<string, unknown>): Contact {
  let firstName = str(values.firstName)
  let lastName = str(values.lastName)
  const name = str(values.name)
  if (!firstName && name) ({ firstName, lastName = lastName } = splitName(name))
  return {
    firstName,
    lastName,
    email: str(values.email),
    phone: str(values.phone),
    country: str(values.country),
    studentType: str(values.studentType),
    consent: typeof values.consent === 'boolean' ? values.consent : undefined,
  }
}
