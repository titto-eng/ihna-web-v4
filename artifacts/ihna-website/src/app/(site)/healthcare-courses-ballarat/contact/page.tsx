import type { Metadata } from 'next'
import { landingMetadata } from '@/components/templates/landing/pages'

// /healthcare-courses-ballarat/contact: the old `.htaccess` extensionless alias of contact.php. Same page, canonical to the .php URL.
export const metadata: Metadata = landingMetadata('/healthcare-courses-ballarat/contact.php', { noindex: true })

export { default } from '../contact.php/page'
