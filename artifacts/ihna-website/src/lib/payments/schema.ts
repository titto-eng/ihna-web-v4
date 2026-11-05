import { z } from 'zod'
import { GATEWAY_NAMES } from './config'

// `POST /api/payments/start/` (45 §6). Every object is strict: a product request that carries `amount` is a 400 (rule 6).
const text = (min: number, max: number) =>
  z.string().transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, '').trim()).pipe(z.string().min(min).max(max))
const optionalText = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, '').trim()).pipe(z.string().max(max)).optional()

const common = {
  gateway: z.enum(GATEWAY_NAMES),
  payerName: text(2, 120),
  payerEmail: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  submissionId: z.uuid(),
  captchaToken: z.string().max(4096).optional(),
}

export const startInvoiceSchema = z.strictObject({
  kind: z.literal('invoice'),
  ...common,
  invoiceNumber: text(1, 40),
  studentId: optionalText(20),
  paymentFor: text(1, 100),
  /** What the payer typed. Parsed server-side; stored and signed (partial payments are allowed). */
  amount: z.union([z.string().max(20), z.number()]),
})

export const startProductSchema = z
  .strictObject({
    kind: z.literal('product'),
    ...common,
    productId: z.union([z.number().int().positive(), z.string().min(1).max(80)]).optional(),
    e2btn: z.number().int().min(1).max(12).optional(),
    studentId: optionalText(20),
  })
  .refine((v) => v.productId !== undefined || v.e2btn !== undefined, { message: 'productId or e2btn is required', path: ['productId'] })

export const startSaeSchema = z.strictObject({
  kind: z.literal('sae'),
  ...common,
  saeApplicationId: z.union([z.number().int().positive(), z.string().min(1).max(80)]),
})

export const startSchema = z.discriminatedUnion('kind', [startInvoiceSchema, startProductSchema, startSaeSchema])
export type StartRequest = z.infer<typeof startSchema>

export const chargeSchema = z.strictObject({
  paymentId: z.uuid(),
  token: z.string().min(4).max(200),
  dccAccepted: z.boolean().optional(),
})

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const i of err.issues) {
    const key = i.path.join('.') || (i.code === 'unrecognized_keys' ? 'request' : 'request')
    out[key] ??= i.code === 'unrecognized_keys' ? `Not allowed: ${(i as { keys?: string[] }).keys?.join(', ')}` : i.message
  }
  return out
}
