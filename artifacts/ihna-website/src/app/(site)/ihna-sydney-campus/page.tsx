// Converted once from the old WordPress page and edited by hand; this file is the page.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, ContactCards, Cta, HighlightStrip, IframeEmbed, LinkTiles, MapEmbed, Rich, SplitProse, Tabs, Testimonials, VideoEmbed } from '@/components/page'
import { CampusPage } from '@/components/templates/pages'
import { CampusGalleries } from '@/components/templates/Galleries'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Sydney Campus',
  path: '/ihna-sydney-campus/',
  description: 'Study at IHNA Sydney, 33 Argyle Street Parramatta: simulation nursing lab, student support, campus tour and life in Sydney.',
})

export default function SydneyCampusRoute() {
  return (
    <CampusPage title="IHNA Sydney Campus" path="/ihna-sydney-campus/" hero={{ heading: 'What Sets Sydney Apart?', variant: 'compact', audienceSwitch: false, eyebrow: 'Study In Sydney' }}>
      <HighlightStrip items={['17+ Years', 'Nationally Accredited Qualifications', '30,000+ Students Studied', 'State and Government Funding']} />
      <IframeEmbed url='https://my.matterport.com/show/?m=7bk7YZbVVC2' title='Sydney campus virtual tour' />
      <Checklist
        tone="muted"
        eyebrow="IHNA Sydney"
        heading="Why choose *IHNA* ?"
        items={[
          <>Australian Award-winning Education Provider</>,
          <>17+ Years</>,
          <>Nationally Accredited Qualifications</>,
          <>30,000+ students studied</>,
          <>Online and face-to-face class delivery with regular support</>,
          <>Well-equipped campus with state-of-the-art facilities</>,
          <>Computer labs and large library with ample resources</>,
          <>Interactive and user-friendly learning platforms</>,
          <>Location in the heart of the city with easy access to public transport and amenities</>,
          <>Flexible payment options</>,
          <>Large simulation labs</>,
          <>State and Government Funding</>,
          <>Dedicated student support staff for each student</>,
          <>Situated at the heart of City with accessibility to Public Transport and Amenities</>,
        ]}
      />
      <SplitProse eyebrow="Study in Sydney" heading="Sydney – The Emerald City">
        <p>Sydney captivates with its vibrant energy and diverse landscapes, nestled between lush greenery and dazzling waterfronts. Known as the Emerald City, Sydney is a jewel in Australia’s crown.</p>
      </SplitProse>
      <Checklist
        tone="muted"
        heading="Our *facilities*"
        items={[
          <><strong>Experienced Trainers:</strong> Highly educated and experienced trainers and assessors.</>,
          <><strong>Student Support:</strong> Around-the-clock support and flexible practice opportunities.</>,
          <><strong>Modern Labs:</strong> Innovative computer labs and spacious simulation labs</>,
          <><strong>Convenient Location:</strong> Meeting spaces and study rooms are located close to amenities and transportation.</>,
          <>Regular LLN Support</>,
          <>Cutting-edge computer labs accessible to students during regular business hours</>,
          <>Meeting spaces and study rooms located in the city’s centre, close to amenities and transportation.</>,
          <>Spacious, well-equipped 17-bed simulation nursing lab</>,
        ]}
      />
      <Rich spacing="compact">
        <h2>Sydney Campus Tour</h2>
      </Rich>
      <VideoEmbed url='https://www.youtube.com/watch?v=h2H1vxanEPs' title='IHNA Parramatta Campus Tour: Discover Innovative Learning Spaces!' />
      <ContactCards
        eyebrow="Visit us"
        heading="Find our *campus*"
        cards={[
          { title: 'Sydney Campus', lines: ['Level 7', '33 Argyle Street', 'Parramatta, NSW 2150, Australia'], phone: '+61 2 8228 6459', email: 'enquiry@ihna.edu.au' },
        ]}
        map={<MapEmbed depth={1} spacing="none" embedUrl='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30441332.66062371!2d107.87731456452879!3d-21.351166128976708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a2dff49247a9%3A0x234c0f292645a5b3!2sInstitute%20of%20Health%20and%20Nursing%20Australia%20(Sydney%20Campus)!5e0!3m2!1sen!2sin!4v1722847740158!5m2!1sen!2sin' />}
      />
      <LinkTiles
        heading="Our University and Industry *partners*"
        intro="IHNA has partnered with leading Australian universities and industry leaders to provide graduates with seamless degree pathways and exceptional career opportunities."
        items={[
          { title: 'University partners', href: '/university-partners/' },
          { title: 'Industry partnerships', href: '/industry/' },
        ]}
      />
      <Cta heading="For Uniform and Scrubs" links={[{ href: 'https://shop.fullypromoted.com.au/ihna', label: 'Shop page', style: 'primary' }]} variant="banner" tone="sunrise" />
      <Rich tone="muted" spacing="compact">
        <h2>Hear from Our Students</h2>
        <p>Join us in celebrating the success stories of IHNA alumni who have stepped into brilliant futures!</p>
      </Rich>
      <Testimonials
        tone="muted"
        variant="carousel"
        spacing="compact"
        inline={[
          { name: 'Ashley Hartnett', quote: 'When my daughter was in the NICU diagnosed with severe jaundice, a surge nurse went out of her way and cared for us during this difficult time. The care, professionalism and dedication from this nurse has inspired me to become a nurse myself. This led me to the start of my journey in nursing, beginning with Enrolled Nursing at IHNA.' },
          { name: 'Baby Aurora Trijo', quote: 'I did my Certificate III in Aged Care at IHNA-Perth Campus. I was pleased and so satisfied with my studying experience in IHNA that I decided to continue and pursue a Diploma in Enrolled Nursing. The campus is very accessible. Its situated in the CBD and just a short walk from the Perth Underground station so getting here is so easy.' },
          { name: 'Christian Pascaran', quote: 'I have completed my Certificate III in Acute Care through IHNA. The Staff/educators were very helpful to students when it came to addressing our problems. I would like to thank Mrs.Rhodora, Ms. Sheryl, Ms. Michelle and Ms. Sarita and others for accommodating all of my needs E.g. placement adjustment, financial situation and other requirements.' },
          { name: 'Deriya Makina', quote: 'Since I was a little girl, I always wanted to look after people around me. To fulfill my passion and since I was working in aged care at that time I decided to further develop my skills so I chose to study the Diploma of Nursing. First of all, I went on google to research about nursing, such as institutes that offer the course, the cost and flexibility to suit my life.' },
        ]}
      />
      <Rich>
        <h2>Guide to your Sydney lifestyle</h2>
        <p>The definitive guide for newcomers to Sydney!</p>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'About Sydney',
            content: (
              <>
                <Rich depth={1}>
                  <p>Sydney is a globally renowned destination known for its iconic landmarks, vibrant culture, and diverse population. With its stunning landscapes, sun-soaked beaches,…</p>
                  <p>and bustling urban life, Sydney offers a unique blend of natural beauty and modern sophistication.</p>
                  <h4>Iconic Landmarks</h4>
                  <ul><li><strong>Sydney Opera House:</strong> An architectural marvel and UNESCO World Heritage Site.</li><li><strong>Sydney Harbour Bridge:</strong> A symbol of engineering brilliance and a favourite spot for adventure seekers.</li></ul>
                  <h4>Cultural and Historical Highlights</h4>
                  <ul><li><strong>The Rocks:</strong> The historic birthplace of modern Sydney with charming sandstone buildings and cobblestone streets.</li><li><strong>Indigenous Heritage:</strong> Explore the rich Aboriginal culture through art galleries and guided walks.</li></ul>
                  <h4>Arts and Culture</h4>
                  <ul><li><strong>Art Gallery of New South Wales:</strong> A sanctuary for art lovers with a vast collection of international and Australian art.</li><li><strong>Vivid Sydney:</strong> A world-renowned festival that transforms the city’s landmarks with mesmerising light installations.</li></ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'Living in Sydney',
            content: (
              <>
                <Rich depth={1}>
                  <p>Cost of Living Sydney is one of Australia’s most expensive cities, covering lodging, travel, meals, and entertainment. Despite higher costs, Sydney offers a high standard of living, excellent facilities, and diverse cultural and recreational opportunities. For more detailed information, visit <a href="https://www.expatistan.com/cost-of-living/sydney">Expatistan – Cost of Living in Sydney.</a></p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Transportation',
            content: (
              <>
                <Rich depth={1}>
                  <p>Sydney’s extensive transportation network includes rail, ferries, buses, and light rail services. The Opal card system makes commuting easy and convenient.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Education for international students',
            content: (
              <>
                <Rich depth={1}>
                  <p>Sydney hosts a thriving academic landscape with prestigious universities and vocational colleges.</p>
                  <p>Top institutions include:</p>
                  <ul><li>The University of Sydney</li><li>University of Technology Sydney (UTS)</li><li>Macquarie University</li><li>Western Sydney University</li><li>University of New South Wales (UNSW Sydney)</li></ul>
                  <p>Tuition fees vary, ensuring accessibility to quality education for international students.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <CampusGalleries campus="sydney" heading="Image gallery" />
    </CampusPage>
  )
}
