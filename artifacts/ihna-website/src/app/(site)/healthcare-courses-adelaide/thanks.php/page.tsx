import type { Metadata } from 'next'
import { landingThankYouMetadata, renderLandingThankYou } from '@/components/templates/landing/route'

// The thank-you view at the old handler URL (GTM counts conversions here; 60 §4). Always noindex.
const PAGE = '/healthcare-courses-adelaide/'

export const generateMetadata = (): Promise<Metadata> => landingThankYouMetadata(PAGE, '/healthcare-courses-adelaide/thanks.php')

export default async function ThankYouPage() {
  return renderLandingThankYou(PAGE)
}
