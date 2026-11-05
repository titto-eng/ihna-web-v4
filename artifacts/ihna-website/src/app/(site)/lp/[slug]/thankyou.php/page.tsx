import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { lpPath, renderThankYou, thankYouMetadata } from '@/components/templates/landing/route'

// /lp/<slug>/thankyou.php: the thank-you view at its old handler URL (GTM counts conversions here). Always noindex.
const SEGMENT = 'thankyou.php'
type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return thankYouMetadata(lpPath((await params).slug), SEGMENT)
}

export default async function ThankYouPage({ params }: { params: Params }) {
  const { slug } = await params
  return (await renderThankYou(lpPath(slug), SEGMENT)) ?? notFound()
}
