import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { validateHttpsUrl } from '../embeds'

// The host must be in site.allowedEmbedHosts, src/content/site.ts (DEC-5); the renderer checks the allowlist.
export const IframeEmbedBlock: Block = {
  slug: 'iframeEmbed',
  interfaceName: 'IframeEmbedBlock',
  fields: [
    { name: 'url', type: 'text', required: true, validate: validateHttpsUrl, admin: { description: 'https URL; host must be on the embed allowlist' } },
    { name: 'title', type: 'text', required: true },
    { name: 'height', type: 'number', min: 200, max: 2000, admin: { description: 'Pixels. Empty = 16:9' } },
    ...sectionFields,
  ],
}
