// Converted once from the old WordPress page and edited by hand; this file is the page.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, ContactCards, Cta, HighlightStrip, IframeEmbed, LinkTiles, MapEmbed, Rich, SplitProse, Tabs, Testimonials } from '@/components/page'
import { CampusPage } from '@/components/templates/pages'
import { CampusGalleries } from '@/components/templates/Galleries'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Melbourne Campus',
  path: '/ihna-melbourne-campus/',
  description: 'Study at IHNA Melbourne: CBD campus at 399 Lonsdale Street and Heidelberg campus, simulation labs, student support and life in Melbourne.',
})

export default function MelbourneCampusRoute() {
  return (
    <CampusPage title="IHNA Melbourne Campus" path="/ihna-melbourne-campus/" hero={{ heading: 'Welcome to IHNA Melbourne Campus – Study in a Location Like No Other!', variant: 'compact', audienceSwitch: false, eyebrow: 'Study In Melbourne' }}>
      <HighlightStrip items={['17+ Years', 'Nationally Accredited Qualifications', '30,000+ Students Studied', 'State and Government Funding']} />
      <Checklist
        tone="muted"
        eyebrow="IHNA Melbourne"
        heading="Why choose *IHNA* ?"
        items={[
          <>Australian Award-winning Education Provider</>,
          <>17+ Years</>,
          <>Nationally Accredited Qualifications</>,
          <>Over 30,000 graduates</>,
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
      <SplitProse eyebrow="Study in Melbourne" heading="Melbourne – The Urban Mosaic">
        <p>Melbourne is a city with a touch of class, known for its diversity in style, fashion, food, architecture, theatres, galleries, and gardens. Home to almost four million residents from over 140 nations, international students will find a welcoming and multicultural environment.</p>
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
        <h2>Melbourne Campus Tour</h2>
      </Rich>
      <IframeEmbed url='https://my.matterport.com/show/?m=A6QHNfimqXp' title='Melbourne campus virtual tour' />
      <IframeEmbed url='https://my.matterport.com/show/?m=F54TVJi417R' title='Melbourne campus virtual tour' />
      <ContactCards
        eyebrow="Visit us"
        heading="Find our *campus*"
        cards={[
          { title: 'Melbourne (CBD) Campus', lines: ['Level 4 and 10', '399 Lonsdale Street', 'Melbourne, VIC – 3000, Australia'], phone: '+61 3 9455 4444', email: 'enquiry@ihna.edu.au' },
          { title: 'Melbourne (Heidelberg) Campus', lines: ['597-599 Upper Heidelberg Rd', 'Heidelberg Heights', 'Victoria – 3081, Australia'], phone: '+61 3 9450 5100', email: 'enquiry@ihna.edu.au' },
        ]}
        map={<MapEmbed depth={1} spacing="none" embedUrl='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29773596.53361677!2d103.31892864401777!3d-24.36487043997537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4b48c6b4f3%3A0x4879c03871010df5!2sInstitute%20of%20Health%20and%20Nursing%20Australia%20(Melbourne%20CBD%20Campus)!5e0!3m2!1sen!2sin!4v1722847241039!5m2!1sen!2sin' />}
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
        <h2>Guide to your Melbourne lifestyle</h2>
        <p>The definitive guide for newcomers to Melbourne!</p>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'About Melbourne',
            content: (
              <>
                <Rich depth={1}>
                  <p>Melbourne is a city with a touch of class, known for its diversity in style, fashion, food, architecture, theatres, galleries, and gardens.Home to almost four million residents from over 140 nations, …</p>
                  <p>international students will find a welcoming and multicultural environment.</p>
                  <h4>Iconic Landmarks</h4>
                  <ul><li><strong>Federation Square:</strong> A bustling cultural precinct hosting events, art exhibitions, and live performances.</li><li><strong>Queen Victoria Market:</strong> A historic market offering fresh produce, gourmet delights, and multicultural street food.</li><li><strong>Royal Botanic Gardens:</strong> A serene oasis featuring beautifully landscaped gardens and diverse flora.</li><li><strong>Melbourne Zoo:</strong> Home to a diverse collection of wildlife with immersive exhibits and educational experiences.</li><li><strong>Hosier Lane:</strong> Iconic laneway adorned with vibrant and ever-changing street art.</li><li><strong>St. Kilda Beach and Luna Park:</strong> Beachside vibes with sandy shores, a lively esplanade, and a historic amusement park.</li><li><strong>National Gallery of Victoria (NGV):</strong> Highlighting a vast collection of local and international artworks.</li><li><strong>Eureka Skydeck:</strong> Breathtaking views from the Southern Hemisphere’s highest viewing platform.</li><li><strong>Yarra River Cruise:</strong> Picturesque cityscape views from a unique perspective.</li><li><strong>Fitzroy Gardens:</strong> Meticulously landscaped gardens with historic structures and tranquil walking paths.</li></ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'Living in Melbourne',
            content: (
              <>
                <Rich depth={1}>
                  <p>Melbourne is an attractive and affordable study destination compared to other major Australian cities. Despite the higher costs, Melbourne offers a high standard of living, excellent facilities, and diverse cultural and recreational opportunities.<br /> For more detailed information, visit <a href="https://expatistan.com/cost-of-living/melbourne">Expatistan – Cost of Living in Melbourne</a></p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Transportation',
            content: (
              <>
                <Rich depth={1}>
                  <p>Melbourne boasts a comprehensive and efficient transportation system:</p>
                  <ul><li><strong>Public Transport:</strong> Managed by Public Transport Victoria (PTV) includes trains, trams, and buses.</li><li><strong>Trains:</strong> Connect major hubs and suburbs.</li><li><strong>Trams:</strong> Iconic network within the CBD and suburbs.</li><li><strong>Buses:</strong> Servicing areas beyond the reach of other public transport options.</li><li><strong>Myki Card:</strong> Contactless smart card for fare payment.)</li><li><strong>Cycling:</strong> Extensive bike lanes and paths with bike-sharing schemes.</li><li><strong>Taxis and Ridesharing:</strong> Services like Uber for additional transportation options.</li></ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'Education for international students',
            content: (
              <>
                <Rich depth={1}>
                  <p>Melbourne is a pinnacle for global education, welcoming over 50,000 international students annually.</p>
                  <h4>Top universities include:</h4>
                  <ul><li>The University of Melbourne</li><li>Monash University</li><li>RMIT Universityy</li><li>La Trobe University</li><li>Swinburne University of Technology</li></ul>
                  <h4>Costs of Study Programs:</h4>
                  <ul><li><strong>Undergraduate Degree:</strong> AUD 20,000 to 45,000.</li><li><strong>Master’s Degree:</strong> AUD 22,000 to 50,000.</li><li><strong>Doctorate:</strong> AUD 18,000 to 42,000.</li></ul>
                  <p>Melbourne’s educational institutions offer an optimal balance between affordability and world-class education, making it a highly sought-after destination for international students.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <CampusGalleries campus="melbourne" heading="Image gallery" />
    </CampusPage>
  )
}
