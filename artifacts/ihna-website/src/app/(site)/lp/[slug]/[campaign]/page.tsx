import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { campaignMetadata, lpPath, renderCampaign } from '@/components/templates/landing/route'

// /lp/<slug>/<campaign-code>/: renders the base page (a route file under lp/<slug>/) with the code in the attribution cookie; canonical to
// the base page, noindex. The reserved segments (thanks.php, thankyou*, application_form.php, index.php) are sibling folders and win.
type Params = Promise<{ slug: string; campaign: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return campaignMetadata(lpPath((await params).slug))
}

export default async function CampaignLandingPage({ params }: { params: Params }) {
  const { slug, campaign } = await params
  return (await renderCampaign(lpPath(slug), campaign)) ?? notFound()
}
