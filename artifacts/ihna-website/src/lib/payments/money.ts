// Money is integer cents everywhere. Amounts reach the portal and gateways as 2-dp decimal strings built from cents, never floats.

/** Parses what a payer types ("150", "150.5", "$1,250.00") to cents; null when it is not a plain AUD amount with at most 2 decimals. */
export function parseAmountToCents(input: unknown): number | null {
  const s = typeof input === 'number' ? (Number.isFinite(input) ? String(input) : '') : typeof input === 'string' ? input.trim() : ''
  const clean = s.replace(/^\$\s*/, '').replace(/,/g, '')
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(clean)
  if (!m) return null
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || '0')
  return Number.isSafeInteger(cents) ? cents : null
}

export const centsToDecimal = (cents: number): string => {
  const c = Math.round(cents)
  return `${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`
}

export const decimalToCents = (v: string | number | null | undefined): number | null => parseAmountToCents(typeof v === 'number' ? v.toFixed(2) : v)

export const formatAud = (cents: number): string => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

/** Half-up rounding of base * percent / 100. */
export const surchargeCents = (baseCents: number, percent: number): number => Math.round((baseCents * percent) / 100)
