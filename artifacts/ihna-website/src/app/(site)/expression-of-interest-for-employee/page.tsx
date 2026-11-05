// Employer expression of interest (employee-expression-of-interest-sc.php). The form is `employer-eoi` (src/content/forms.ts, 40-enquiries);
// the old `?q=` names the funding program in the heading (smart_skill, dtwd, skills_first). Countries come from the form's own list.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, Rich, img } from '@/components/page'
import { site } from '@/content/site'

const FUNDING: Record<string, string> = {
  smart_skill: 'Smart and Skilled Funding',
  dtwd: 'DTWD Funded Training',
  skills_first: 'Skills First Program',
}

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Expression of Interest for Employee',
  path: '/expression-of-interest-for-employee/',
  description: 'Employers: register your interest in funded training for your staff at the Institute of Health and Nursing Australia.',
})

export default async function EmployeeEoiRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = (await searchParams).q
  const funding = typeof q === 'string' ? FUNDING[q] : undefined
  return (
    <>
      <Hero heading="Expression of Interest for Employee" eyebrow={funding ?? null} variant="split" look="orbit" audienceSwitch={false} image={img({ src: '/images/ihna/pages/expression-of-interest-for-employee.webp', alt: 'Employers in a meeting', width: 540, height: 675 })} />
      <Rich>
        <p>
          Tell us about your organisation and the training your staff need, and our team will contact you about the funding options available.
          You can also call us on <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a> or email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </Rich>
      <EnquiryForm formKey="employer-eoi" heading="Expression of interest" variant="card" />
    </>
  )
}
