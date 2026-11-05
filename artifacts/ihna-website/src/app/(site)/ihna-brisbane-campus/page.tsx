// Converted once from the old WordPress page and edited by hand; this file is the page.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, ContactCards, Cta, HighlightStrip, IframeEmbed, LinkTiles, MapEmbed, Rich, SplitProse, Tabs, Testimonials, VideoEmbed } from '@/components/page'
import { CampusPage } from '@/components/templates/pages'
import { CampusGalleries } from '@/components/templates/Galleries'

export const metadata: Metadata = pageMetadata({
  title: 'Brisbane',
  path: '/ihna-brisbane-campus/',
  description: 'Study at IHNA Brisbane, 59 Adelaide Street: IHNA’s latest campus with a 20-bed simulation lab, student support and life in Brisbane.',
})

export default function BrisbaneCampusRoute() {
  return (
    <CampusPage title="Brisbane" path="/ihna-brisbane-campus/" hero={{ heading: 'Welcome to IHNA Brisbane Campus – Where World-Class Learning Meets Vibrant City Life!', variant: 'compact', audienceSwitch: false, eyebrow: 'Study In Brisbane' }}>
      <HighlightStrip items={['IHNA’s Latest Campus', 'Nationally Recognised Qualifications', '20 Bed State of the Art Simulation Lab']} />
      <IframeEmbed url='https://my.matterport.com/show/?m=x8jWW6DBC4f&ss=1&sr=-2.94,.1' title='Brisbane campus virtual tour' />
      <Checklist
        tone="muted"
        eyebrow="IHNA Brisbane"
        heading="Why choose *IHNA* ?"
        items={[
          <>Australian Award-winning Education Provider</>,
          <>Nationally Accredited Qualifications</>,
          <>Online and face-to-face class delivery with regular support</>,
          <>Well-equipped campus with state-of-the-art facilities</>,
          <>Computer labs and large library with ample resources</>,
          <>Interactive and user-friendly learning platforms</>,
          <>Location in the heart of the city with easy access to public transport and amenities</>,
          <>Flexible payment options</>,
          <>Large simulation labs</>,
          <>Dedicated student support staff for each student</>,
          <>Situated at the heart of City with accessibility to Public Transport and Amenities</>,
        ]}
      />
      <SplitProse eyebrow="Study in Brisbane" heading="Brisbane, the River City">
        <p>With a scenic location in Queensland on the east of Australia, Brisbane is right on the banks of the iconic Brisbane River.</p>
      </SplitProse>
      <Checklist
        tone="muted"
        heading="Our *facilities*"
        items={[
          <>Highly educated and experienced trainers and assessors</>,
          <>Student support available around-the-clock</>,
          <>Flexible practice opportunities in the lab to make students job-ready</>,
          <>Regular LLN Support</>,
          <>Cutting-edge computer labs accessible to students during regular business hours</>,
          <>Meeting spaces and study rooms located in the city’s centre, close to amenities and transportation.</>,
          <>Spacious, well-equipped 20-bed simulation nursing lab</>,
        ]}
      />
      <Rich spacing="compact">
        <h2>Brisbane Campus Tour</h2>
      </Rich>
      <VideoEmbed url='https://www.youtube.com/watch?v=8c37xl41KdU' title='IHNA Brisbane Campus Tour: See Our World-Class Facilities' />
      <ContactCards
        eyebrow="Visit us"
        heading="Find our *campus*"
        cards={[
          { title: 'Brisbane Campus', lines: ['Level 3', '59 Adelaide Street', 'Brisbane QLD 4000'], phone: '+61 7 3123 4000', email: 'enquiry@ihna.edu.au' },
        ]}
        map={<MapEmbed depth={1} spacing="none" embedUrl='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d221.24924577589962!2d153.0243895230121!3d-27.46963505413913!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b915b10f38cea27%3A0xeeb9a807a875e43c!2sInstitute%20of%20Health%20and%20Nursing%20Australia%20(%20Brisbane%20Campus)!5e0!3m2!1sen!2sin!4v1701770603522!5m2!1sen!2sin' />}
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
        spacing="compact"
        variant="carousel"
        inline={[
          { name: 'Tk Aumentado', quote: 'I have an absolutely fantastic experience studying the Diploma of Nursing at IHNA. The trainers and staff are incredibly supportive, knowledgeable, and genuinely invested in seeing their students succeed. They bring a wealth of real-world clinical experience to the classroom, which makes the learning so much more practical and engaging. The simulation labs (SBTs) are a real highlight. They are well-equipped and provide a safe, realistic environment to practice essential nursing skills before going out on placement. This hands-on training was invaluable and gave me the confidence I needed to excel in a real healthcare setting. The administrative staff were always helpful and made the entire process, from enrolment to placement, run smoothly. I felt well-prepared for my career as an enrolled nurse thanks to the comprehensive education I’m receiving here. I would highly recommend IHNA to anyone looking to start their journey in the healthcare industry.' },
          { name: 'Erika Zenriah Quillip', quote: 'I’m currently doing Semester 1 of my Diploma of Nursing and I’ve been loving it so far! I’m learning so much from my educator, Payal. She’s so nice and knowledgeable, I could tell that she cares a lot about her students and wants the best for all of us. She makes the lessons interactive and engaging while still keeping it educational. The other staff are also very welcoming and are always happy to answer any questions that we may have. The online learning platform is easy to access and navigate and has all the information that we need. I like the assessments because we get multiple tries, around two to get it right. They also mark us very quickly, although I wish some of the assessor comments could be more detailed. Overall, I’m really liking the course so far and I’m looking forward to the future semesters. Thank you IHNA Brisbane for all your support and service!' },
          { name: 'Renee Hunt', quote: 'The facility is amazing, the staff even better, they make you feel welcome and at home, the staff are kind and accommodate to needs, they are very understanding. It more of personalized teaching, as teachers care and are also nurses them selves, they take their time to slow down and help where needed and have different modes of learning it perfect for still being able to work while studying.' },
          { name: 'Tracy Ordener', quote: 'IHNA Brisbane is a supportive institution that prioritises student success. They actively seek improvement, welcome constructive feedback, and take action to address areas that need development.' },
        ]}
      />
      <Rich>
        <h2>Guide to your Brisbane lifestyle</h2>
        <p>The definitive guide for newcomers to Brisbane!</p>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'About Brisbane',
            content: (
              <>
                <Rich depth={1}>
                  <p>Welcome to Brisbane, the often overlooked but no less charismatic urban jewel in Australia’s crown. Brisbane is where modern sophistication meets laid-back charm. Notably, the city is home to the bustling South Bank region, which includes the Brisbane Cultural Centre with its world-renowned arts institutions like Queensland Performing Arts Centre, and Gallery of Modern Art.Streets lined with stylish cafes, award-winning restaurants, and craft beer bars, provide succulent culinary delights for everyone’s taste buds.…</p>
                  <p>With its splendid skyline and endless azure horizons, Brisbane indeed paints an irresistible urban spectacle. Brisbane’s unique selling proposition lies in its incredible balance between cosmopolitan flair and natural beauty. Brisbane’s green parks and nature reserves are not just about beautification, but they imbue a sense of tranquillity in the bustling city life.</p>
                  <p>From its vibrant cultural quarters, iconic cityscape, majestic green spaces, to close encounters with Aussie wildlife, Brisbane is a treasure trove just waiting to be unearthed. Take away the warm camaraderie from the city’s inhabitants, and Brisbane starts to feel less like a one-time destination and more like a home away from home.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'What’s special?',
            content: (
              <>
                <Rich depth={1}>
                  <ul><li>Nestled along the edges of the snaking Brisbane River. You’ve got those stunning riverscapes that could spark a flutter in your heart. There are plenty of options for waterfront dining.</li><li>Brisbane has a good old mix of cultures in a city. It’s like a big, bustling international family reunion right here in Brisbane. Best part? This cultural smorgasbord shines through in droves at restaurants, festivals, and all sorts of events happening around the city.</li><li>Remember to swing by the Queensland Cultural Centre – it’s the cool hangout for all things art. Whether it’s galleries, theatres, museums – they’ve got the lot. And the street art is a riot of colour splashed across the city walls that you just can’t miss. …</li></ul>
                  <p>Scattered across the city are peaceful parks and gardens that’ll whisk you away for a quiet retreat. Think South Bank Parklands, Brisbane Botanic Gardens, or the Roma Street Parkland. Get set for some refreshing, green unwind-time right in the heart of the concrete jungle.</p>
                  <p>If you are in for adventure, Brisbane’s got your back! The cool waters of the Brisbane River beckon. Kayaking, paddleboarding, river cruises – it’s the splashy version of a theme park.</p>
                  <p>Fancy a trip to Australia’s natural treasures? With Brisbane as your base, the famous beaches, the awesome Great Barrier Reef, and enchanting rainforests are all a hop, skip, and jump away.</p>
                  <p>But let’s not forget the lively rhythm of life that Brisbane dances to. It thrums with events, festivals, musical gigs, and all kinds of sporting activities all year long. It’s the true-blue Aussie lifestyle, waiting for you to jump in and vibe along.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Weather',
            content: (
              <>
                <Rich depth={1}>
                  <p>Stationed in the heart of Queensland, Australia, Brisbane luxuriates in a subtropical climate, characterised by stark seasonal shifts.</p>
                  <h4>Summer (December through February)</h4>
                  <p>Brisbane takes the summertime seriously. Hot and sticky: Expect the thermometer to waltz between 21°C (70°F) and 29°C (70.5°F) during this sultry season …</p>
                  <h4>Afternoon Delights: Thunderstorms have a tendency to rumble through on most afternoons and evenings, adding a little drama.</h4>
                  <p>Feeling the heat: Be prepared! Heatwaves can saunter into the city, cranking the temperature up past 35°C (95°F) in a blink.</p>
                  <h4>Autumn (March through May)</h4>
                  <p>Autumn in Brisbane feels like a sunny afternoon picnic.</p>
                  <p>Just right: Generally, the mercury lingers comfortably between 16°C (61°F) and 26°C (79°F).</p>
                  <p>The Cool Down: As the season progresses, the humidity dips its toe and rain becomes less of a frequent visitor.</p>
                  <h4>Winter (June through August)</h4>
                  <p>Brisbane’s winter is as mild-mannered as they come.</p>
                  <p>Cool and Crisp: The thermometer typically hovers from 10°C (50°F) to 21°C (70°F), meaning your bulky jumpers will be left collecting dust!</p>
                  <p>Bright Winter Days: Rain rarely marks its presence, and the city wraps itself up in sunlit days.</p>
                  <h4>Spring (September through November)</h4>
                  <p>Springtime in Brisbane feels as if it draws insight from Autumn. The temperature rises from a mild 15°C (59°F) to a comfortable 26°C (79°F). As the spring progresses, there are intermittent light showers that become a more common occurrence, which offers you a refreshing experience.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Transportation',
            content: (
              <>
                <Rich depth={1}>
                  <p>Brisbane, one of the jewels of Queensland, boasts of a sophisticated, multi-faceted transport system. This intricate labyrinth of commuting options smoothly takes its residents and tourists alike from one point to another across the city.</p>
                  <p>In the heart of Queensland lies TransLink, the torchbearer of the public transport scheme, flowing like a well-oiled machine. Their offering is quite vast, comprising buses, trains, and even delightful ferry rides. These services work in perfect synchronisation, providing a seamless and dependable travel experience to all. …</p>
                  <p>When it comes to buses, Brisbane City Council doesn’t lag behind, handling one of the largest bus fleets in Australia. They assert their uniqueness via the Brisbane Busway network, an intriguing concept involving roads exclusively for buses. This initiative ingeniously reduces congestion and allows public buses to glide through smoothly, speeding up commutes.</p>
                  <p>Getting around Brisbane is not only about buses. The Queensland Rail City network does its part beautifully, linking the city centre to suburbs that spread across the wider Brisbane area. Moving people around the city, this rail network plays a significant role in making the city’s transportation efficient and convenient.</p>
                  <p>By no means are the city’s transport options just limited to the land. The city’s CityCat and CityFerry services are an absolute treat, offering a scenic means to get around Brisbane. From these services, passengers get to enjoy stunning riverside views as they travel through the city along the Brisbane River.</p>
                  <p>Despite this expansive public transport system, Brisbane still heavily leans on personal vehicles for regular commuting. Commercial services like traditional taxis and rideshare companies like Uber also offer personalised commuting options.</p>
                  <p>Brisbane boasts a range of technological advancements that not only enhance passengers’ commuting experience but also supports its progress towards becoming a smart city.</p>
                  <p>The Go Card, a contactless smart card by TransLink, allows seamless travel across the public transport network. It provides riders with significant cost savings, quicker boarding times, and a streamlined experience.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Education for international students',
            content: (
              <>
                <Rich depth={1}>
                  <p>Brisbane offers world-class education to international students. The city’s universities, apprenticeship colleges, and English-language learning centres welcome above 40,000 foreign students each year from a myriad of cultures and continents.</p>
                  <p>The top 4 Universities in Brisbane include:</p>
                  <ul><li>The University of Queensland (UQ): A global pioneer in path-breaking research and distinguished scholarly reputation.</li><li>Queensland University of Technology (QUT): Famous for offering practical learning, relevant to industry practices.</li><li>Griffith University: An all-encompassing university famed for its research-oriented curriculum and pioneering spirit.</li><li>University of Southern Queensland (USQ): Providing a broad spectrum of disciplines and a strong resolve on digital education.</li></ul>
                  <p>…</p>
                  <p>Costs of Study Programs here are affordable compared to elsewhere in the world, while the quality of education is on par with the best global Universities, making this a very popular destination for overseas students. These are some indicative tuition figures for different programs in Perth:</p>
                  <ul><li>Bachelor’s Degree: $24,000 to $38,000.</li><li>Master’s Degree: $25,000 to $40,000.</li><li>Doctorate: $26,000 to $42,000.</li></ul>
                  <p>Compared to global benchmarks, Brisbane’s educational centres are a perfect balance between affordability and uncompromised quality.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <CampusGalleries campus="brisbane" heading="Image gallery" />
    </CampusPage>
  )
}
