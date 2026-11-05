// Data the payment pages need. Server-only. Pages never 500 for missing CMS content: the imported page is optional.
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayProduct } from '@/components/payments/PayForm.client'
import { site } from '@/content/site'

export async function loadProducts(): Promise<(PayProduct & { gateways: string[] })[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({ collection: 'products', where: { active: { equals: true } }, sort: 'sortOrder', limit: 50, depth: 0, overrideAccess: true })
    return docs.map((p) => ({
      id: p.id, sku: p.sku, name: p.name, kind: p.kind, priceCents: Math.round(p.priceCents), legacyE2Btn: p.legacyE2Btn ?? null,
      gateways: ((p.gateways ?? ['securepay', 'airwallex']) as string[]),
    }))
  } catch {
    return []
  }
}

/** The page shell for a payment route: title and path (the old WordPress payment pages carried no content of their own). */
export async function loadPageOrStub(path: string, title: string): Promise<{ title: string; path: string; layout?: undefined }> {
  return { title, path }
}

export const contactOf = async () => ({ phone: site.phone, email: site.email })

/** Query-string guards: only plain values reach the page. */
export const intParam = (v: string | string[] | undefined, min: number, max: number): number | null => {
  const s = Array.isArray(v) ? v[0] : v
  if (!s || !/^\d{1,3}$/.test(s)) return null
  const n = Number(s)
  return n >= min && n <= max ? n : null
}
export const invoiceParam = (v: string | string[] | undefined): string | null => {
  const s = Array.isArray(v) ? v[0] : v
  return s && /^[A-Za-z0-9._-]{1,40}$/.test(s) ? s : null
}
export const gatewayParam = (v: string | string[] | undefined): string | undefined => {
  const s = Array.isArray(v) ? v[0] : v
  return s === 'payway' || s === 'securepay' || s === 'airwallex' ? s : undefined
}
