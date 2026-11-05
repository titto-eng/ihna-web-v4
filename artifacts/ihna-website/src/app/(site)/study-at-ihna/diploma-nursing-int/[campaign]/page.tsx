import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { campaignMetadata, renderCampaign } from '@/components/templates/landing/route'

// /study-at-ihna/diploma-nursing-int/<campaign-code>: the old `.htaccess` campaign suffix rule. Renders the page with the code in the
// attribution cookie (41); canonical to the base page, noindex; a malformed code is a 404.
const PAGE = '/study-at-ihna/diploma-nursing-int.php'
type Params = Promise<{ campaign: string }>

export const metadata: Metadata = campaignMetadata(PAGE)

export default async function DiplomaNursingIntCampaign({ params }: { params: Params }) {
  return (await renderCampaign(PAGE, (await params).campaign)) ?? notFound()
}
