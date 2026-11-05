// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, img, Rich } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Partner With Us',
  path: '/partner-with-us/',
  description: 'We welcome expressions of interest from healthcare organisations, hospitals, and clinical bodies looking to collaborate and leverage mutual strengths for…',
})

export default function PartnerWithUsRoute() {
  return (
    <>
      <Hero heading="Are you interested in exploring partnership opportunities with IHNA?" variant="split" look="mosaic" audienceSwitch={false} image={img({ src: '/images/ihna/theme/partner-with-us.jpg', alt: 'IHNA', width: 800, height: 732 })} />
      <Rich tone="muted">
        <p className="lead">We welcome expressions of interest from healthcare organisations, hospitals, and clinical bodies looking to collaborate and leverage mutual strengths for impactful initiatives in healthcare education. If you believe there’s potential for synergy between our organisations, we invite you to reach out and express your interest in partnering with us. To discuss more and partner with IHNA please click the ‘Expression of Interest’ button below to connect with us and discuss potential collaboration further.</p>
      </Rich>
      <Cta links={[
        {
          href: '/expression-of-interest-for-employee/?q=skills_first',
          label: 'Expression of Interest for Employee',
          style: 'primary',
        },
        {
          href: '/partner-application/?q=skills_first',
          label: 'Expression of Interest for Employer',
          style: 'secondary',
        },
      ]} variant="inline" tone="muted" spacing="compact" />
    </>
  )
}
