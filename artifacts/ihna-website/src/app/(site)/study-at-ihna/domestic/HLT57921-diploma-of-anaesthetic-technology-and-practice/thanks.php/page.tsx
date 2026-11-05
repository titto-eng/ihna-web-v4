import type { Metadata } from 'next'
import { landingThankYouMetadata, renderLandingThankYou } from '@/components/templates/landing/route'

// The thank-you view at the old handler URL (GTM counts conversions here; 60 §4). Always noindex.
const PAGE = '/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/'

export const generateMetadata = (): Promise<Metadata> => landingThankYouMetadata(PAGE, '/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/thanks.php')

export default async function ThankYouPage() {
  return renderLandingThankYou(PAGE)
}
