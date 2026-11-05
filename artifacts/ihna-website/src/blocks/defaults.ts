import type { BlockSlug } from './index'

// One valid, minimal default per slug (20-blocks §7). Used by tests and the dev block gallery.
const lexical = (text: string) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] }],
  },
})

type Default = { blockType: string } & Record<string, unknown>

export const defaults: Record<BlockSlug, Default> = {
  hero: { blockType: 'hero', heading: 'A *clear* heading', variant: 'split', audienceSwitch: true, ctas: [{ label: 'Apply', href: '/apply/', style: 'primary' }] },
  richText: { blockType: 'richText', content: lexical('Body text') },
  imageText: { blockType: 'imageText', content: lexical('Text beside an image'), chips: [{ text: 'Melbourne' }] },
  stats: { blockType: 'stats', items: [{ value: '3', label: 'Years' }, { value: '800h', label: 'Placement' }] },
  cardGrid: { blockType: 'cardGrid', heading: 'Cards', columns: '3', cards: [{ title: 'One', body: 'First', href: '/one/' }, { title: 'Two' }] },
  accordion: { blockType: 'accordion', variant: 'faq', items: [] },
  tabs: { blockType: 'tabs', variant: 'underline', tabs: [] },
  table: { blockType: 'table', caption: 'Table', headerRow: true, rows: [['A', 'B'], ['1', '2']] },
  cta: { blockType: 'cta', heading: 'Do the *thing*', variant: 'centered', links: [{ label: 'Go', href: '/go/', style: 'primary' }] },
  testimonials: { blockType: 'testimonials', variant: 'carousel', inline: [{ quote: 'Great', name: 'Pat' }] },
  logoStrip: { blockType: 'logoStrip', logos: [] },
  videoEmbed: { blockType: 'videoEmbed', title: 'Video', url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', variant: 'inline' },
  iframeEmbed: { blockType: 'iframeEmbed', title: 'Form', url: 'https://my.matterport.com/show/?m=abc' },
  mapEmbed: { blockType: 'mapEmbed', caption: 'Campus', embedUrl: 'https://www.google.com/maps/embed?pb=!1m18' },
  teamGrid: { blockType: 'teamGrid', variant: 'grid', members: [{ name: 'Alex', role: 'Lead', bio: 'Bio' }] },
  gallery: { blockType: 'gallery', variant: 'grid', images: [] },
  steps: { blockType: 'steps', variant: 'numbered', steps: [{ title: 'Apply' }, { title: 'Interview' }] },
  pathways: { blockType: 'pathways', paths: [{ label: 'A', title: 'Direct', advantages: [{ text: 'Fast' }] }, { label: 'B', title: 'Diploma' }] },
  curriculum: { blockType: 'curriculum', years: [{ label: 'Year 1', units: [{ semester: 'Semester 1', code: 'N1', title: 'Unit' }] }] },
  admissionsPanel: { blockType: 'admissionsPanel', domestic: lexical('Domestic'), international: lexical('International'), cards: [{ audience: 'both', label: 'Everyone', value: 'Interview' }], steps: [{ text: 'Apply' }] },
  enquiryForm: { blockType: 'enquiryForm', formKey: 'quick-enquiry', heading: 'Enquire', variant: 'card' },
  courseFacts: { blockType: 'courseFacts' },
  startDates: { blockType: 'startDates', mode: 'all' },
  censusDates: { blockType: 'censusDates' },
  feesTable: { blockType: 'feesTable' },
  intakeCalendar: { blockType: 'intakeCalendar', months: 12 },
  relatedCourses: { blockType: 'relatedCourses', limit: 6 },
  brochureDownload: { blockType: 'brochureDownload', label: 'Download' },
  courseManagers: { blockType: 'courseManagers' },
}
