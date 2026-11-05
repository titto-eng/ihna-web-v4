import type { Metadata } from 'next'
import { landingMetadata } from '@/components/templates/landing/pages'

// /study-at-ihna/diploma-nursing-int: the old `.htaccess` extensionless alias of diploma-nursing-int.php. Same page, canonical to the .php URL.
export const metadata: Metadata = landingMetadata('/study-at-ihna/diploma-nursing-int.php', { noindex: true })

export { default } from '../diploma-nursing-int.php/page'
