// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero, img, MediaSplit } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Life at IHNA',
  path: '/life-at-ihna/',
  description: 'At IHNA, you’ll gain an empowering education designed to set you up for success, expand your horizons, and equip you with the essential skills and…',
})

export default function LifeAtIhnaRoute() {
  return (
    <>
      <Hero
        heading="Life at *IHNA*"
        eyebrow="Student experience"
        variant="compact"
        audienceSwitch={false}
        subheading="At IHNA, you’ll gain an empowering education designed to set you up for success, expand your horizons, and equip you with the essential skills and knowledge to excel in your healthcare career."
      />
      <CardGrid
        heading="Experience life at *IHNA*"
        intro="As an IHNA student, you will have access to exciting and engaging activities, valuable hands-on training, cutting-edge facilities, and tailored support that will enhance your learning experience and create lasting memories throughout your time at IHNA."
        cards={[
        {
          title: 'Student life',
          body: 'Joining IHNA means becoming part of a vibrant community, filled with student-led events, cultural celebrations, and opportunities to connect with peers from diverse backgrounds.',
          image: img({ src: '/images/ihna/theme/lifeexperience1.webp', alt: '', width: 416, height: 299 }),
        },
        {
          title: 'Study Experience',
          body: 'IHNA specializes in practical, industry-focused training designed to equip you with the skills and experience that healthcare employers value the most.',
          image: img({ src: '/images/ihna/theme/lifeexperience2.webp', alt: '', width: 416, height: 299 }),
        },
        {
          title: 'Industry Connections',
          body: 'Our placements and practical training enable you to apply your knowledge in real healthcare settings. IHNA’s partnerships provide access to global experiences and industry connections, preparing you for a successful career in healthcare.',
          image: img({ src: '/images/ihna/theme/lifeexperience3.webp', alt: '', width: 416, height: 299 }),
        },
        {
          title: 'Student Supports',
          body: 'Our support and wellbeing services are here to help you excel at IHNA, staying healthy and focused on your goals',
          image: img({ src: '/images/ihna/theme/lifeexperience4.webp', alt: '', width: 416, height: 299 }),
        },
      ]} columns="4" variant="grid" />
      <MediaSplit
        tone="muted"
        eyebrow="IHNA Spotlight"
        heading="Discover what’s *new* at IHNA"
        image={img({ src: '/images/ihna/theme/ihnaspotlight.webp', alt: 'IHNA Spotlight webinar series', width: 778, height: 518 })}
      >
        <p>Welcome to IHNA Spotlight, where you’ll discover why IHNA is the top choice for healthcare education. In our exclusive webinar series, explore industry-focused courses, hear inspiring student success stories, and get the latest updates from our vibrant campuses. Whether starting your journey or looking to upskill, IHNA Spotlight provides the insights you need for your future.</p>
        <p>Join us and uncover the potential that IHNA offers! Stay tuned to see how we can help you achieve your career aspirations.</p>
      </MediaSplit>
      <CardGrid cards={[
        {
          title: 'The High Demand for Aged Care in Australia',
          image: img({ src: '/images/ihna/theme/the_high_demand_for_aged_care_in_australia.jpg', alt: '', width: 1600, height: 1066 }),
        },
        {
          title: 'Affordable Community Services Courses for Aspiring Social Workers',
          image: img({ src: '/images/ihna/theme/affordable_community_services_courses_for_aspiring_social_workers-2.jpg', alt: '', width: 1600, height: 1067 }),
        },
        {
          title: 'Essential Healthcare Courses for a Rewarding Career',
          image: img({ src: '/images/ihna/theme/blogs.jpg', alt: '', width: 1600, height: 1067 }),
        }
      ]} columns="3" variant="grid" />
    </>
  )
}
