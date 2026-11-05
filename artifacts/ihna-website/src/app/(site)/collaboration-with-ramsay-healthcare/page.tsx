// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ImageText, img, LogoBadge, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Collaboration with Ramsay Health Care',
  path: '/collaboration-with-ramsay-healthcare/',
  description: 'Ramsay Health Care’s purpose and values, encapsulated in “The Ramsay Way,” focus on strong relationships, continuous improvement, and sustainable growth…',
})

export default function CollaborationWithRamsayHealthcareRoute() {
  return (
    <>
      <Hero heading="Collaboration with Ramsay Health Care" variant="compact" audienceSwitch={false} />
      <LogoBadge label="Valued partner" logo={{ src: '/images/ihna/theme/ramsay.webp', alt: 'Ramsay Health Care', width: 251, height: 220 }} />
      <ImageText media={img({ src: '/images/ihna/theme/ramsay-1.webp', alt: '', width: 1600, height: 1068 })} imageSide="right">
        <h2>How does this partnership align with our strategic goals?</h2>
        <p>This collaboration supports our mission to produce highly skilled healthcare professionals ready to meet the demands of the global healthcare industry, as HCI is now Ramsay’s a valued partner. By integrating Ramsay Health Care’s expertise, we aim to elevate the quality of our healthcare education and improve patient outcomes. Our graduates are equipped with the knowledge and skills needed to excel in their careers and positively impact the healthcare industry. The partnership aligns with our strategic goals of enhancing academic programs, fostering industry collaborations, and improving global rankings. As we continue to grow and evolve, our alliance with Ramsay Health Care ensures that we remain at the forefront of healthcare education and practice, providing our students with the best possible education and training.</p>
      </ImageText>
      <ImageText media={img({ src: '/images/ihna/theme/stock-partnership.webp', alt: '', width: 1600, height: 1066 })} imageSide="left">
        <h2>What does being Ramsay’s a valued partner mean for us?</h2>
        <p>As Ramsay Health Care’s valued partner, we enjoy a privileged position that strengthens our collaboration and enhances the opportunities available to our students and faculty. This status reflects our shared commitment to excellence in healthcare education and underscores the value of our partnership. Being the valued partner means we can access exclusive resources, support, and opportunities unavailable to other institutions. This enhances our ability to provide high-quality education and training to our students and supports our mission to produce highly skilled healthcare professionals who are ready to meet the demands of the global healthcare industry.</p>
      </ImageText>
      <SplitProse eyebrow="The Ramsay Way" heading="Alignment with Ramsay’s Purpose and Values" tone="muted">
        <p>Ramsay Health Care’s purpose and values, encapsulated in “The Ramsay Way,” focus on strong relationships, continuous improvement, and sustainable growth. This aligns seamlessly with HCI’s mission of ‘Education for Employment,’ which emphasises providing students with the skills and knowledge they need to be successful in the workforce. Both organizations prioritise caring for people, maintaining high standards of patient care, and achieving long-term success over short-term gains. This shared commitment ensures that our collaboration is built on a solid foundation of mutual respect and a dedication to advancing healthcare education and practice.</p>
      </SplitProse>
    </>
  )
}
