import { getFormView } from '@/lib/enquiries/formView'
import { EnquiryDialogClient, type DialogView } from './EnquiryDialogClient'

import { site } from '@/content/site'

/** formKeys the site-wide dialog can show (`site.enquiryDialog.keys`; IHNA: `quick-enquiry` by default, and `whatsapp`). */
export const DIALOG_KEYS: readonly string[] = site.enquiryDialog.keys

// Server half of the site-wide enquiry dialog (the same `/api/enquire/` pipeline as every form, no new handler): loads the cached form views and hands them to the client dialog.
// It never opens by itself: only `?enquire=1` (or `?enquire=<formKey>`), the header "Enquire" CTA, or the WhatsApp button open it.
export async function EnquiryDialog() {
  const loaded = await Promise.all(DIALOG_KEYS.map(async (key) => [key, await getFormView(key)] as const))
  const views: Record<string, DialogView> = {}
  for (const [key, v] of loaded) if (v) views[key] = v
  if (!Object.keys(views).length) return null
  return <EnquiryDialogClient views={views} />
}
