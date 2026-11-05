import type { Metadata } from 'next'
import { landingThankYouMetadata, renderLandingThankYou } from '@/components/templates/landing/route'

// The thank-you view at the old handler URL (GTM counts conversions here; 60 §4). Always noindex.
const PAGE = '/study-at-ihna/domestic/certificate-iii-health-services-assistance-perth/'

export const generateMetadata = (): Promise<Metadata> => landingThankYouMetadata(PAGE, '/study-at-ihna/domestic/certificate-iii-health-services-assistance-perth/thanks.php')

export default async function ThankYouPage() {
  return renderLandingThankYou(PAGE)
}
