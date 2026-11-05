// Converted once from the old WordPress page and edited by hand; this file is the page.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, Checklist, ContactCards, Cta, HighlightStrip, IframeEmbed, Link, LinkTiles, Rich, SplitProse, Tabs, Testimonials, VideoEmbed } from '@/components/page'
import { CampusPage } from '@/components/templates/pages'
import { CampusGalleries } from '@/components/templates/Galleries'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Perth Campus',
  path: '/ihna-perth-campus/',
  description: 'Study at IHNA Perth, 12 St Georges Terrace: Western Australia funded courses, simulation labs, campus events and life in Perth.',
})

export default function PerthCampusRoute() {
  return (
    <CampusPage title="IHNA Perth Campus" path="/ihna-perth-campus/" hero={{ heading: 'What Perth offers that other cities don’t!', variant: 'compact', audienceSwitch: false, eyebrow: 'Study In Perth' }}>
      <HighlightStrip items={['17+ Years', 'Nationally Accredited Qualifications', '30,000+ Students Studied', 'This training is delivered with Western Australian Funding']} />
      <IframeEmbed url='https://my.matterport.com/show/?m=25KPHyRXW6P' title='Perth campus virtual tour' />
      <SplitProse tone="muted" eyebrow="Western Australia" heading="WESTERN AUSTRALIA FUNDED COURSES*">
        <ul><li><Link href="/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/">HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)</Link></li><li><Link href="/courses/certificate-iii-in-sterilisation-services/">HLT37015 – Certificate III in Sterilisation Services</Link></li><li><Link href="/courses/certificate-iii-pathology-collection/">HLT37215 – Certificate III in Pathology Collection (superseded)</Link></li><li><Link href="/courses/diploma-of-nursing/">HLT54121 – Diploma of Nursing</Link></li><li><Link href="/courses/certificate-iii-in-individual-support-ageing-and-disability/">CHC33021 – Certificate III in Individual Support (Ageing and Disability)</Link></li></ul>
        <p>This training is delivered with Western Australian Funding.</p>
        <p>The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as resource fees and other fees.</p>
        <p>Refer to the “DTWD Funded Training” eligibility guidelines to check your funding eligibility. <Link href="/about-funding/#prog2">Click here</Link></p>
        <p>*Western Australia funded seats are subject to availability and approval</p>
      </SplitProse>
      <Checklist
        eyebrow="IHNA Perth"
        heading="Why choose *IHNA* ?"
        items={[
          <>Australian Award-winning Education Provider</>,
          <>17+ Years</>,
          <>Nationally Accredited Qualifications</>,
          <>30,000+ students studied</>,
          <>Online and face-to-face class delivery with regular support</>,
          <>Well equipped campus with large computer labs and Libraries</>,
          <>Large campus with the capacity to cater to over 600 students at a time</>,
          <>Interactive and user-friendly learning platforms</>,
          <>Location in the heart of the city with easy access to public transport and amenities</>,
          <>Flexible payment options</>,
          <>Large Simulation Labs with 17 beds</>,
          <>This training is delivered with Western Australian Funding</>,
          <>Dedicated student support staff for each student</>,
          <>Situated at the heart of City with accessibility to Public Transport and Amenities</>,
        ]}
      />
      <SplitProse tone="muted" eyebrow="Study in Perth" heading="Perth the city of light">
        <p>Perth is known the world across for its laidback and easygoing lifestyle, and life unfolds here at a pleasing pace</p>
      </SplitProse>
      <Checklist
        heading="Our *facilities*"
        items={[
          <>Highly educated and experienced trainers and assessors</>,
          <>Student support available around-the-clock</>,
          <>Flexible practice opportunities in the lab to make students job-ready</>,
          <>Regular LLN Support</>,
          <>Cutting-edge computer labs accessible to students during regular business hours</>,
          <>Meeting spaces and study rooms located in the city’s centre, close to amenities and transportation.</>,
          <>Spacious, well-equipped 17-bed simulation nursing lab</>,
        ]}
      />
      <Rich tone="muted">
        <h2>Explore options and pathways to a rewarding career!</h2>
        <ul><li><Link href="/courses/certificate-iii-in-individual-support-ageing-and-disability/">CHC33021 – Certificate III in Individual Support (Ageing &amp; Disability)</Link></li><li><Link href="/courses/diploma-of-nursing/">HLT54121-Diploma of Nursing</Link></li><li><Link href="/courses/certificate-iii-in-sterilisation-services/">HLT37015 – Certificate III in Sterilisation Services</Link></li><li><Link href="/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/">HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)</Link></li><li><Link href="/courses/diploma-community-services-case-management/">CHC52025 – Diploma of Community Services (Case Management)</Link></li><li><Link href="/courses/certificate-iii-pathology-collection/">HLT37215 – Certificate III in Pathology Collection</Link></li></ul>
      </Rich>
      <SplitProse eyebrow="Events" heading="Discover Our Exclusive *Events*">
        <p>Step into a world of knowledge, networking, and new opportunities with our exclusive events. At IHNA Perth Campus, We bring together industry experts, students, and professionals to share insights, celebrate achievements, and build meaningful connections.</p>
        <p>Explore our latest events below, and click through to experience the full gallery of moments that define our vibrant community.</p>
        <p><Link href="/all-events/?campus=65cdcea09990767ff90f9e14">View all events</Link></p>
      </SplitProse>
      <CampusGalleries campus="perth" heading="Discover our exclusive events" />
      <Rich>
        <h2>Tour of the Perth Campus</h2>
        <p>Perth is known the world across for its laidback and easygoing lifestyle, and life unfolds here at a pleasing pace</p>
      </Rich>
      <VideoEmbed url='https://www.youtube.com/watch?v=iVsv3gvDl58' title='Tour of the IHNA Perth campus' />
      <ContactCards
        eyebrow="Visit us"
        heading="Perth Campus *Address*"
        cards={[{ title: 'Perth Campus', lines: ['Level 2 and 4, 12 St Georges Terrace', 'Perth, WA 6000, Australia'], phone: '+61 8 6212 8200', email: 'enquiry@ihna.edu.au' }]}
      />
      <LinkTiles
        heading="Our University and Industry *partners*"
        intro="IHNA has partnered with leading Australian universities and industry leaders to provide graduates with seamless degree pathways and exceptional career opportunities."
        items={[
          { title: 'University partners', href: '/university-partners/' },
          { title: 'Industry partnerships', href: '/industry/' },
        ]}
      />
      <Cta heading="For Uniform and Scrubs" links={[{ href: 'https://www.wanneroouniforms.com.au/ihna/', label: 'Shop page', style: 'primary' }]} variant="banner" tone="sunrise" />
      <Testimonials
        tone="muted"
        variant="carousel"
        heading="Student *testimonials*"
        inline={[
          { name: 'Selina', quote: 'I am deeply grateful to IHNA for the exceptional support and guidance I received throughout my Cert 3 in Sterilisation Services course and work placement. The institute’s commitment to high-quality education and practical training has been instrumental in preparing me for my future career. I sincerely appreciate the dedication of all the staff who made this journey smooth and enriching. A special thank you goes to my lecturer, Alex Varghese whose hard work, patience, and expertise have made a significant difference in my learning experience. His unwavering support and encouragement have been invaluable in helping me achieve my goals and gain the confidence needed for my professional path. I wholeheartedly recommend IHNA to anyone seeking a comprehensive and supportive learning environment. I feel truly grateful for the positive feedback I received throughout my time studying at IHNA.' },
          { name: 'Yolanda Santos', quote: 'I’ve had a truly wonderful experience with IHNA-Perth Campus. Our educator, Ruchi Oza, has been absolutely amazing—her teaching techniques in practical and theory made the learning process easy and enjoyable. She is knowledgeable, supportive, and always willing to explain everything clearly. I really appreciated the encouragement she gave us throughout the course. I highly recommend her to anyone learning pathology.' },
          { name: 'Olivia Liliyana', quote: 'I feel very fortunate to have had Tanja Nizich as my Enrolled Nursing lecturer during my studies. She is everything a teacher should be, knowledgeable, dedicated, and compassionate. She always made sure we truly understood what we were learning, and she held us accountable in the best way with her high standards and structured teaching. Although she was strict when needed, it came from a place of genuine care and commitment to our success. Her guidance helped me immensely during my practical placements, where I was able to put her teaching into practice with confidence. Now that I am stepping into the real-world hospital environment, I can see just how much her teaching has prepared me for this next chapter. I’m very grateful for her support and encouragement. Our teacher Tanja truly inspires her students and brings out the best in us.' },
          { name: 'Sakina Ali Zada', quote: 'I have now completed my cert 3 in pathology collection and I’m happy that I had Ruchi as my educator. She is truly amazing at teaching pathology and has made such a big difference in my learning journey. From the very beginning, she has been patient, supportive, and encouraging. Ruchi explains everything so clearly and makes even the most difficult topics easy to understand. What I appreciate most is the way she builds confidence in her students. Before, I used to doubt myself and feel nervous, but with her guidance and motivation I now feel so much more capable. She always takes the time to answer questions, no matter how small, and ensures that everyone feels comfortable and included.' },
          { name: 's smith', quote: 'Ruchi is an exceptionally wonderful educator - deeply invested in every student’s success. She takes the time to understand each person’s strengths and challenges, and her guidance is always clear, encouraging, and practical. You can tell she truly cares about seeing her students grow and achieve. Truly could not have got through Pathology cert without her strength, self sacrifice and caring. Kalpana brings such a calm and steady presence to the classroom. She brings a quiet strength to her teaching; her patience, consistency, and calm presence make such a difference when things feel overwhelming. Her gentle guidance helps students build confidence step by step. Due to unforeseen circumstances our class had the pleasure of being lead by an educator from a different campus for some weeks. Poonam from Sydney revitalised our group during a very difficult time. Her calm strength were exactly what we all needed it that time. Ruchi, Kalapana and Poonam lead with kindness, dedication, and integrity - always putting their students\' needs ahead of their own. IHNA is very lucky to have them and would not be be able to succeed without these educators.' },
        ]}
      />
      <Rich>
        <h2>Guide to your Perth lifestyle</h2>
        <p>The definitive guide for newcomers to Perth!</p>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'About Perth',
            content: (
              <>
                <Rich depth={1}>
                  <p>Not only is Western Australia the biggest state in Australia, it also offers a variety of things to do and enjoy! From the north, you can witness the outstanding natural phenomenon Staircase to the Moon, an optical illusion seen at full moon along the shores of Roebuck Bay. Travel down enjoying the scenic landscapes and outback adventures to the lunar-like pinnacles of the famous Aussie landscape, and the majestic rugged coastline of Albany. Intrepid adventurers can visit the Capes and enjoy Australia’s most spectacular natural attractions, starting from the expansive national parks and also grab the chance to visit a UNESCO world heritage site, the spectacular Great Barrier Reef....</p>
                  <p>Experience the tingle of raw sensation as you climb 40 metres above the ground in the Valley of the Giants, a 400-year-old wilderness. Dive or snorkel while you swim alongside the whale sharks, go fishing, and enjoy the sparkling turquoise waters and sandy beaches of Australia’s shores. During spring, you can witness 12,000 species of wildflowers dazzle the grounds, making this the biggest collection of wildflowers in the world.</p>
                  <p>Find the cutest species of animals here in WA at Rottnest Island and take a ‘selfie’ with the world-famous quokka. Swim with dolphins and kayak the Shoalwater islands to see little cute penguins and Australian sea lions roam the area in their natural habitat. Travel WA and learn all about its extraordinary heritage as the home of Aboriginals for more than 50000 years − while you sip exclusive wines at the world -renowned Margaret River.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Special about Perth',
            content: (
              <>
                <Rich depth={1}>
                  <ul><li>Kings Park in Perth, with 400.6 ha of gardens, is one of the largest inner city parks in the world; larger than New York's Central Park at 315 ha and London's Hyde Park at 121ha.</li><li>With over 3000 hours of sunshine in a year, Perth is the sunniest capital city in the world. You can even enjoy the sunshine in winter!</li><li>Western Australia has the longest coastline of any state or territory in Australia, which means you have miles upon miles of golden, sunkissed beaches. ...</li></ul>
                  <p>Perth is blessed with rich heritage and traditions, as it was home to the Whadjuk Nyoongar people for over 45,000 years!</p>
                  <p>It’s the only place in the world where Quokkas live in the wild.</p>
                  <p>Perth is nicknamed the City of Light. In 1962, American astronaut, John Glenn, orbited the earth in the Friendship 7 spacecraft and could see the city sparkling from up in space, earning it this sobriquet!</p>
                  <p>Perth has the second highest population growth rate of all Australian capitals.</p>
                  <p>Perth is one of the top cities in the world for livability, ranking 32nd on the EIU(Economist Intelligence Unit) index for 2022.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Weather',
            content: (
              <>
                <Rich depth={1}>
                  <p>With its hot, dry summers and mild winters, the climate in Perth is never too hot nor too cold. Perth averages over 3000 hours of sunshine in a year—making it the world’s sunniest capital city—and has beach-worthy weather for most of the year.</p>
                  <h4>Summer (December – February)</h4>
                  <p>Average temperatures during the hot, dry summer range from 17.5 - 30°C (63.5 - 86°F). There is very little rainfall, but a sea breeze called the ‘Fremantle Doctor' offers relief from heat in the afternoons. ...</p>
                  <h4>Autumn (March – May)</h4>
                  <p>Autumn in Perth comes with warm, sunny days and cooler nights, with the very occasional shower and moderate humidity. Average temperatures range between 13.7 - 26°C (56.6 - 78.8°F), and evenings are rarely colder than 10°C (50°F).</p>
                  <h4>Winter (June – August)</h4>
                  <p>Temperatures in Perth’s relatively mild winters range from 8 - 19°C (46.4 - 66.2°F). Be prepared for the occasional storm, with heavy downpours of rain and thunder.</p>
                  <h4>Spring (September – November)</h4>
                  <p>Warm and sunny spring days have average temperatures ranging from 11.7 - 23°C (53 - 73.4°F). Spring time in Perth is a riot of colours; the wildflowers in Perth’s nature reserves and national parks are a sight to behold!</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Living costs',
            content: (
              <>
                <Rich depth={1}>
                  <p>The city of Perth is among the more affordable major cities in Australia. Living costs are typically lower than those in Sydney, Melbourne, Brisbane and Adelaide. Day-to-day living costs in Perth for international students are lower than other major cities in Australia (and worldwide), and it is considered to be one of the most affordable study destinations.</p>
                  <p>As a ready reckoner, here are some indicators of the cost of living in Perth. The figures below are taken from <a href="https://www.expatistan.com/cost-of-living/perth-australia">https://www.expatistan.com/cost-of-living/perth-australia</a> and are current as per July 2022. ...</p>
                  <ul><li>Family of four estimated monthly costs: AU$6,129 .</li><li>Single person estimated monthly costs: AU$2,952</li><li>Cost of living in Perth is cheaper than in 44% of cities in Australia (4 out of 9)</li><li>Cost of living in Perth is cheaper than in 50% of cities in Oceania (6 out of 12)</li><li>Cost of living in Perth is more expensive than in 81% of cities in the World (51 out of 270)</li><li>Monthly rent for a 45 m2 (480 sqft) furnished studio in expensive area AU$1,843</li><li>Monthly rent for a 45 m2 (480 sqft) furnished studio in normal area AU$1,258</li><li>Utilities 1 month (heating, electricity, gas ...) for 1 person in 45 m2 (480 sqft) studio AU$147</li><li>Internet 8 mbps (1 month) AU$59</li><li>1 liter (1/4 gallon) of gas AU$1.78</li><li>1 liter (1 qt.) of whole fat milk AU$1.53</li><li>12 eggs, large AU$6</li><li>1 kg (2 lb.) of tomatoes AU$5.24</li><li>Monthly ticket public transport AU$168</li><li>Basic dinner out for two in neighborhood pub AU$66</li><li>Combo meal in fast food restaurant (big mac meal or similar) AU$12</li><li>2 tickets to the movies AU$37</li></ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'Transportation',
            content: (
              <>
                <Rich depth={1}>
                  <p>Perth has a very reliable and well-connected transport system, with a diverse range of transport options on offer.</p>
                  <p>Buses are your best option for travel around the Perth metro area. During business hours, you can expect to find services into and out of the city every 15 minutes. ...</p>
                  <p>You can also take advantage of the excellent, central Free Transit Zone (FTZ) serviced by Central Area Transit (CAT) buses. These buses run in loops around the city, East Perth, West Perth and Leederville, and also undertake routes in Fremantle and Joondalup. Check which route works best for your journey, by looking at free CAT timetables that are available on buses and elsewhere. You’ll find a CAT bus about every five to 15 minutes on weekends, and more frequently on weekdays. Every stop has clearly marked digital displays that tell you when the next bus is due.</p>
                  <p>Perth provides zero-fare bus and train trips around the Free Transit Zone, including four high-frequency CAT bus routes.</p>
                  <p>Six train lines head out from the city: four from Perth train station, and two from Perth Underground, which is connected to the main station. Lines from Fremantle, Midland, Armadale and Thornlie meet up at Perth, while the Mandurah and Joondalup trains stop at Perth Underground. Train timings are very frequent: from approximately 5am to midnight on weekdays, which extends till 2am on weekends.</p>
                  <p>Ferries offer gorgeous views of the river and the city. You can catch a Transperth ferry across the Swan River and over to South Perth from the Elizabeth Quay Ferry Terminal, and get back the same way.</p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Education for international students',
            content: (
              <>
                <Rich depth={1}>
                  <p>Perth’s Universities, Vocational Colleges and English schools are home to over 35,000 international students from over 100 countries.</p>
                  <p>The top 5 Universities in Perth include:</p>
                  <ul><li>University of Notre Dame</li><li>Curtin University</li><li>The University of Western Australia</li><li>Murdoch University</li><li>Edith Cowan University</li></ul>
                            <p>Costs of Study Programs here are affordable compared to elsewhere in the world, while the quality of education is on par with the best global Universities, making this a very popular destination for overseas students. These are some indicative tuition figures for different programs in Perth:</p>
                  <ul><li>Undergraduate Bachelors’ Degree: $15,000 to $33,000</li><li>Postgraduate Masters’ Degree: $20,000 to $37,000</li><li>Doctoral Degree: $14,000 to $37,000</li></ul>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <Rich>
        <h3>Stay connected with us</h3>
        <h2>Any questions? We got you.</h2>
        <p>Discover a range of funding options designed to support innovative projects, research, and educational pursuits. Our programs include scholarships, grants, and fellowships, each tailored to help you achieve your goals.</p>
      </Rich>
      <Accordion
        items={[
          {
            title: 'What is IHNA?',
            text: 'IHNA (Institute of Health and Nursing Australia) is a training provider offering health and nursing-related courses in Australia.',
            content: (
              <>
                <Rich depth={1}>
                  <p><strong>IHNA (Institute of Health and Nursing Australia)</strong> is a training provider offering health and nursing-related courses in Australia.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Are courses approved by regulatory bodies?',
            text: 'Yes, all courses are recognized by appropriate education and healthcare regulatory authorities in Australia.',
            content: (
              <>
                <Rich depth={1}>
                  <p>Yes, all courses are recognized by appropriate education and healthcare regulatory authorities in Australia.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'How can I enroll in a course?',
            text: 'You can enroll online via our website or by visiting our nearest campus. Our support team is here to guide you every step of the way.',
            content: (
              <>
                <Rich depth={1}>
                  <p>You can enroll online via our website or by visiting our nearest campus. Our support team is here to guide you every step of the way.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Do you offer online classes?',
            text: 'Yes, we offer both in-person and online modes depending on the course and your location preferences.',
            content: (
              <>
                <Rich depth={1}>
                  <p>Yes, we offer both in-person and online modes depending on the course and your location preferences.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'What support is provided after enrollment?',
            text: 'We offer ongoing academic support, career counseling, and placement assistance to help you succeed during and after your course.',
            content: (
              <>
                <Rich depth={1}>
                  <p>We offer ongoing academic support, career counseling, and placement assistance to help you succeed during and after your course.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
    </CampusPage>
  )
}
