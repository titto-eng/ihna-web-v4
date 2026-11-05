// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EventDetail, Gallery, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Student – Cultural Workshop Events',
  path: '/student-cultural-workshop-events/',
  description: 'Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists.',
})

const I = '/images/ihna/student-cultural-workshop-events'

type Shot = { src: string; width: number; height: number }
type Workshop = {
  id: string
  title: string
  category: string
  date: string
  time?: string
  venue: string
  ledBy: string
  leaderLabel?: string
  desc: string[]
  agenda: string
  images: Shot[]
}

// The events list of the old page (an inline data array, past events, newest year first as published).
const workshops: Workshop[] = [
  {
    id: 'perth-first-nations-cultural-awareness-2025',
    title: 'IHNA Perth First Nations Cultural Awareness Workshop',
    category: 'Workshop',
    date: '15 December 2025',
    venue: 'IHNA Perth Campus',
    ledBy: 'Kristi Lee Latimore',
    desc: [
      'IHNA Perth recently hosted a First Nations Cultural Awareness Workshop for Master of Nursing students, conducted on 15 December 2025. The workshop, held at IHNA’s Perth campus, was led by guest lecturer Kristi Lee Latimore and titled “Introduction to First Nations Cultural Awareness.”',
      'The session encouraged open dialogue, challenged stereotypes, and supported culturally safe practice in line with Australian Nursing and Midwifery standards. Student feedback highlighted the insightful content and the safe, respectful learning environment.',
    ],
    agenda: 'Introduction to First Nations Cultural Awareness, focusing on open dialogue, challenging stereotypes, and promoting culturally safe nursing practice.',
    images: [1, 2, 3, 4, 5, 6].map((n) => ({ src: `${I}/ihm-perth-first-nations-cultural-awareness-workshop${n}.webp`, width: 1600, height: 1200 }))
      .concat([7, 8].map((n) => ({ src: `${I}/ihm-perth-first-nations-cultural-awareness-workshop${n}.webp`, width: 1200, height: 1600 }))),
  },
  {
    id: 'sydney-naidoc-2026-bushcraft',
    title: 'IHNA Sydney NAIDOC Week 2026 Bushcraft Workshop',
    category: 'Workshop',
    date: 'NAIDOC Week 2026',
    venue: 'IHNA Sydney Campus',
    ledBy: 'Louwanna Cohen-Siemsen, Koori Kinnections Educator',
    desc: [
      'IHNA Sydney Campus celebrated NAIDOC Week 2026 with an engaging and interactive Bushcraft Workshop, bringing staff and students together to learn, connect and reflect.',
      'Led by Koori Kinnections Educator Louwanna Cohen-Siemsen, the session used hands-on activities and cultural storytelling to explore First Nations knowledge, culture and traditional practices, fostering greater understanding, respect and appreciation for the world’s oldest continuing living cultures.',
    ],
    agenda: 'An interactive Bushcraft Workshop featuring hands-on activities and cultural storytelling, focused on First Nations knowledge, culture and traditional practices.',
    images: [
      { src: `${I}/naidoc-2026/download-1.webp`, width: 1080, height: 1080 },
      { src: `${I}/naidoc-2026/download-2.webp`, width: 1080, height: 1080 },
      { src: `${I}/naidoc-2026/download-5.webp`, width: 1080, height: 1080 },
      { src: `${I}/naidoc-2026/download-6-1.webp`, width: 1080, height: 1080 },
      { src: `${I}/naidoc-2026/download.webp`, width: 1600, height: 900 },
      { src: `${I}/naidoc-2026/image-2026-07-10t172044-230-1.webp`, width: 1600, height: 800 },
      { src: `${I}/naidoc-2026/image-2026-07-10t223339-260-1.webp`, width: 1600, height: 900 },
    ],
  },
  {
    id: 'sydney-national-reconciliation-week-2026',
    title: 'National Reconciliation Week at IHNA Sydney Campus',
    category: 'Event',
    date: '27 May 2026',
    venue: 'IHNA Sydney Campus',
    ledBy: 'Mr Trent Kelly, Koori Kinnections',
    desc: [
      'IHNA Sydney Campus marked National Reconciliation Week with engaging cultural learning sessions for students and staff on 27 May.',
      'Facilitated by Mr Trent Kelly, a proud Yuin and Wailwan man from Koori Kinnections, the sessions included Aboriginal Cultural Awareness and Contemporary Art – Stone Painting. Participants explored Aboriginal culture, history and beliefs while reflecting on reconciliation and Australia’s shared histories, cultures, values and achievements.',
    ],
    agenda: 'Aboriginal Cultural Awareness and Contemporary Art – Stone Painting activities focused on Aboriginal culture, history, reconciliation and shared learning.',
    images: [
      { src: `${I}/nrw-sydney/syd-nrw-feature.webp`, width: 1600, height: 1200 },
      { src: `${I}/nrw-sydney/image-l2.webp`, width: 1600, height: 1363 },
      { src: `${I}/nrw-sydney/image-l3.webp`, width: 1200, height: 1600 },
      { src: `${I}/nrw-sydney/image-l4.webp`, width: 1098, height: 1600 },
      { src: `${I}/nrw-sydney/image-l7.webp`, width: 1600, height: 1200 },
    ],
  },
  {
    id: 'perth-naidoc-2026-reflecting-and-learning',
    title: 'Reflecting and Learning During NAIDOC Week – Perth Campus',
    category: 'Event',
    date: 'NAIDOC Week 2026',
    venue: 'Perth Town Hall & Perth Campus',
    ledBy: 'Educator Minu',
    desc: [
      'As part of NAIDOC Week 2026, students from our Perth Campus, guided by educator Minu, visited Perth Town Hall to explore the NAIDOC Week exhibition and learn more about the cultures, histories and achievements of Aboriginal and Torres Strait Islander peoples.',
      'Students also watched the documentary Connection to Country on campus, deepening their understanding of the enduring connection between First Nations peoples, Country, culture and community.',
    ],
    agenda: 'Visit to the NAIDOC Week exhibition at Perth Town Hall and an on-campus screening of Connection to Country, encouraging cultural learning, reflection and discussion.',
    images: [
      { src: `${I}/naidoc-2026-perth/media-12-1.webp`, width: 1600, height: 720 },
      { src: `${I}/naidoc-2026-perth/media-14-1.webp`, width: 1600, height: 1204 },
      { src: `${I}/naidoc-2026-perth/media-16-2.webp`, width: 1600, height: 720 },
    ],
  },
  {
    id: 'perth-naidoc-2025-celebration',
    title: 'NAIDOC Week 2025 Celebration at IHNA Perth Campus',
    category: 'Event',
    date: 'NAIDOC Week 2025',
    venue: 'IHNA Perth Campus',
    ledBy: 'Dr Nicole S H Chen and Perth Campus staff',
    leaderLabel: 'Acknowledgement',
    desc: [
      'IHNA Perth Campus celebrated NAIDOC Week 2025 with students and staff coming together to honour Aboriginal and Torres Strait Islander cultures, histories and achievements.',
      'The celebration included a Welcome to Country, a presentation on the theme Strength, Vision & Legacy, and a Boomerang Art Competition that encouraged creativity and cultural appreciation. More than 100 students participated, embracing the spirit of recognition, respect and unity.',
    ],
    agenda: 'Welcome to Country, NAIDOC Week theme presentation and Boomerang Art Competition celebrating culture, creativity and connection.',
    images: [
      { src: `${I}/naidoc-2025/13-2.webp`, width: 1280, height: 1600 },
      { src: `${I}/naidoc-2025/4-12.webp`, width: 1280, height: 1600 },
      { src: `${I}/naidoc-2025/8-6.webp`, width: 1280, height: 1600 },
      { src: `${I}/naidoc-2025/dsc04005.webp`, width: 1600, height: 1067 },
      { src: `${I}/naidoc-2025/dsc04013.webp`, width: 1600, height: 1067 },
      { src: `${I}/naidoc-2025/dsc04031.webp`, width: 1600, height: 1067 },
      { src: `${I}/naidoc-2025/img-2001.webp`, width: 1600, height: 1200 },
      { src: `${I}/naidoc-2025/img-2017.webp`, width: 1200, height: 1600 },
      { src: `${I}/naidoc-2025/img-2019.webp`, width: 1200, height: 1600 },
    ],
  },
]

export default function StudentCulturalWorkshopEventsRoute() {
  return (
    <>
      <Hero
        heading="Cultural Workshops & Events"
        eyebrow="Students"
        variant="split" look="mosaic"
        audienceSwitch={false}
        subheading="Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists."
        image={img({ src: `${I}/nrw-sydney/syd-nrw-feature.webp`, alt: 'Painted stones from the Contemporary Art – Stone Painting session at IHNA Sydney', width: 1600, height: 1200 })}
      />
      {workshops.flatMap((w, i) => [
        <EventDetail
          key={`${w.id}-text`}
          anchorId={w.id}
          tone={i % 2 ? 'muted' : 'default'}
          chips={[w.category, w.date, 'Past event']}
          title={w.title}
          facts={[
            { label: 'Date', value: w.date },
            ...(w.time ? [{ label: 'Time', value: w.time }] : []),
            { label: 'Location', value: w.venue },
            { label: w.leaderLabel ?? 'Led By', value: w.ledBy },
          ]}
        >
          {w.desc.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
          <h3>Session Agenda</h3>
          <p>{w.agenda}</p>
        </EventDetail>,
        <Gallery
          key={`${w.id}-photos`}
          variant="carousel"
          tone={i % 2 ? 'muted' : 'default'}
          spacing="compact"
          images={w.images.map((s, n) => img({ ...s, alt: `${w.title}, photo ${n + 1}` }))}
        />,
      ])}
    </>
  )
}
