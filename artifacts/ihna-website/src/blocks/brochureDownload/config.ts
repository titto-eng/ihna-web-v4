import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const BrochureDownloadBlock: Block = {
  slug: 'brochureDownload',
  interfaceName: 'BrochureDownloadBlock',
  fields: [
    { name: 'label', type: 'text', defaultValue: 'Download the course guide' },
    ...sectionFields,
  ],
}
