// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero } from '@/components/page'

export const metadata: Metadata = pageMetadata({ title: 'Staff Login', path: '/staff-login/', description: 'Staff Login', noindex: true })

export default function StaffLoginRoute() {
  return (
    <>
      <Hero heading="Staff Login" variant="compact" audienceSwitch={false} />
      <CardGrid cards={[
        {
          title: 'Staff Support Hub',
          body: 'HCI staff portal is aimed to achieve enhanced reporting, staff support, staff grievances, staff mentoring programs.',
          href: 'https://hcistaff.powerappsportals.com/',
        },
        { title: 'Staff Hub', href: 'https://hcig.sharepoint.com/sites/ThePerspective' },
        { title: 'Canvas LMS', href: 'https://ihm.instructure.com/' },
        { title: 'KH Login', href: 'https://portal.ihna.edu.au/users/login' },
        { title: 'Clinical Placement', href: 'https://ihna.clinsoft.com.au/login' },
      ]} columns="3" variant="grid" />
    </>
  )
}
