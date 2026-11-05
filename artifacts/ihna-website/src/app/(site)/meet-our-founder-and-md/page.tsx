// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, ImageText, img, Link, Rich, SplitProse, Stats, Tabs } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Meet our Founder and MD',
  path: '/meet-our-founder-and-md/',
  description: 'Dr. Bijo Kunnumpurath is the Founder, Managing Director and CEO of the Health Careers International group.',
})

const talkToBijo = 'https://forms.monday.com/forms/279ecc39c73dea1c8810f8c99d483de1?r=use1'

export default function MeetOurFounderAndMdRoute() {
  return (
    <>
      <Hero
        eyebrow="Founder & Managing Director - HCI Australia"
        heading="Dr. Bijo Kunnumpurath"
        subheading="Believe in the value of lifelong learning."
        variant="split" look="spotlight"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/theme/bijo-kunnampurath-md.png', alt: 'Bijo Kunnumpurath - Founder & Managing Director - HCI Australia', width: 546, height: 715 })}
        ctas={[{ label: 'Talk to Bijo', href: talkToBijo, style: 'primary' }]}
      />
      <SplitProse eyebrow="Founder, MD & CEO" heading="About Dr. *Bijo*">
        <p>Dr. Bijo is the Founder, Managing Director and CEO of the Health Careers International group. His demonstrated passion towards education, entrepreneurship, and technology has shaped the vision of the HCI group.</p>
        <p>Equipped with a Master’s in Business Administration and qualified in Mechanical Engineering, Dr. Bijo has had extensive project management and business management experience in a career that has spanned over three decades. By leveraging this experience, he has enabled new and innovative programs that have made a significant impact in career-focused healthcare training.</p>
        <p>Dr. Bijo has worked world-wide and has distinguished himself as a well-respected and prominent community figure in Australia, Malaysia, and India. As the Managing Director of HCI, he oversees and manages the operational activities, systems, and policy implementation of the organisation.</p>
        <p>He’s also a member of GAICD (Graduate of the Australian Institute of Company Directors) and has pursued a PhD in Corporate Governance in the Educational Sector at Swinburne University.</p>
        <p><a href="https://www.linkedin.com/in/bijokunnumpurath/" rel="noopener noreferrer">LinkedIn: /bijokunnumpurath/</a></p>
      </SplitProse>
      <ImageText
        media={img({ src: '/images/ihna/theme/bijo-awards.png', alt: 'Dr. Bijo Kunnumpurath receiving awards and at education events', width: 775, height: 621 })}
        imageSide="right"
        ctas={[{ label: 'Talk to Bijo', href: talkToBijo, style: 'primary' }]}
      >
        <h2>Dr. Bijo Kunnumpurath has dedicated himself to improve lives through health and wellness education, training, and technology.</h2>
      </ImageText>
      <ImageText
        media={img({ src: '/images/ihna/theme/indian-express-news.png', alt: 'Indian Express news feature on Bijo Kunnumpurath', width: 781, height: 493 })}
        imageSide="left"
        heading="NRI helps Nurses settle in Australia"
      >
        <p>~ A feature from the Indian Express</p>
      </ImageText>
      <ImageText
        media={img({ src: '/images/ihna/theme/bijo-certificate.png', alt: 'Principal Fellowship certificate from the Higher Education Academy', width: 593, height: 800 })}
        imageSide="right"
        ctas={[{ label: 'Talk to Bijo', href: talkToBijo, style: 'primary' }]}
      >
        <p>In acknowledgment of Dr. Bijo Kunnumpurath’s distinctive contribution and achievement of considerable influence and advancement of learning and teaching in higher education through the promotion of professional standards, <strong>the Higher Education Academy of the United Kingdom awarded him a Principal Fellowship.</strong></p>
      </ImageText>
      <Stats
        heading="Enhancing lives through education and training is what I strive for."
        tone="muted"
        items={[
          { value: '02', label: 'Companies' },
          { value: '04+', label: 'Locations' },
          { value: '400+', label: 'Employees' },
        ]}
      />
      <Rich>
        <h2>Our Organisations</h2>
        <h3>HCI Australia</h3>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'Institute of Health And Nursing Australia (IHNA)',
            content: (
              <Rich depth={1}>
                <h4>Enhancing lives through healthcare training</h4>
                <p>IHNA, is a healthcare training provider born out of the desire to enhance lives through training. As an Australian Registered Training Organization (RTO), IHNA is dedicated to giving the best learning experience for a successful and satisfying career in nursing, healthcare, education and community services. We’ve been committed to providing the best learning experience to over 22,000 students seeking a fulfilling career in nursing, health or community services since 2007. Our dedication towards caring originates from our work in healthcare, but it also extends to student welfare, administrative and instructional assistance. IHNA also goes above and beyond to ensure that your experience is pleasant from beginning to end. Our assistance extends to providing research opportunities for you to push the healthcare industry’s frontiers. Further study is accessible through our partner organisations as postgraduate courses. With campuses across Australia in Melbourne, Sydney, Perth and Brisbane, IHNA has enrolled over 22,000 students from over 50 countries and has over 200+ industry partners and over 17+ university pathways. We’re excited to share our extensive and current industry knowledge with students like you so that you may benefit from it and use it to your career development. Furthermore, we’re healthcare specialists and trainers committed to career-focused learning and real-world outcomes so that more individuals working in healthcare may lead to better lives.</p>
                <p>IHNA is one of the best education providers in Australia, our efforts have been recognized through many awards and recognition:</p>
                <ul>
                  <li>Finalist of the Victorian International Education Award 2023</li>
                  <li>Winner of the Victorian International Education Award 2022</li>
                  <li>Commendation premier’s award international education provider of the year 2022</li>
                  <li>Winner of the Victorian International Education Award 2021</li>
                  <li>Commendation premier’s award international education provider of the year 2021</li>
                  <li>Finalist of the Victorian Training Awards 2020</li>
                  <li>Finalist of the Victorian International Education Award 2018</li>
                  <li>Winner of the Mcmillan Woods Global Award 2018 in “Nursing &amp; Healthcare Training Excellence”</li>
                  <li>Winner of the Victorian International Education Award 2016</li>
                  <li>Finalist of the Victorian Training Awards 2016</li>
                </ul>
                <p>Our expertise are, through our different schools:</p>
                <ul>
                  <li>School of community services</li>
                  <li>School of management</li>
                  <li>School of nursing</li>
                  <li>School of education</li>
                  <li>School of allied health</li>
                </ul>
                <p>
                  <Link href="/">Visit Website</Link> · <a href="https://twitter.com/myihna" rel="noopener noreferrer">X</a> · <a href="https://www.facebook.com/myIHNA" rel="noopener noreferrer">Facebook</a> · <a href="https://www.instagram.com/ihna_australia/" rel="noopener noreferrer">Instagram</a> · <a href="https://www.linkedin.com/company/institute-of-health-nursing-australia" rel="noopener noreferrer">LinkedIn</a>
                </p>
              </Rich>
            ),
          },
          {
            label: 'Institute of Health & Management (IHM)',
            content: (
              <Rich depth={1}>
                <h4>Enhancing lives through healthcare education</h4>
                <p>In February 2012, the Institute of Health &amp; Management (IHM) was established. Since then, IHM has been recognised as a higher education institution. The Tertiary Education Quality and Standards Agency of the Australian Government grants this status.</p>
                <p>The Institute of Health &amp; Management (IHM) was formed in 2015 and focuses on the development and delivery of health-related higher education courses. Experienced nurses, professors, and clinicians contribute to these postgraduate courses. In 2021, IHM will become the first private higher education school in Australia to offer a Master of Nursing programme!</p>
                <p>IHM’s aim is to become an Australian University College by 2030, and in order to achieve this, we are continuously working to incorporate the finest technology-based resources into our curriculum in order to provide our students with an unrivalled training experience. IHM places a strong emphasis on innovative and technological breakthroughs in learning and teaching. The rising use of new technologies like as virtual reality simulations, online platforms, and applications enhances classroom-based learning on campus and allows for the delivery of online courses of study to fulfil the demands of working nurses.</p>
                <p>
                  <a href="https://www.ihm.edu.au/" rel="noopener noreferrer">Visit Website</a> · <a href="https://twitter.com/australiaihm" rel="noopener noreferrer">X</a> · <a href="https://www.facebook.com/ihmau" rel="noopener noreferrer">Facebook</a> · <a href="https://www.instagram.com/ihmaustralia/" rel="noopener noreferrer">Instagram</a> · <a href="https://www.linkedin.com/showcase/ihm-australia/" rel="noopener noreferrer">LinkedIn</a>
                </p>
              </Rich>
            ),
          },
        ]}
      />
      <Cta variant="centered" links={[{ label: 'Talk to Bijo', href: talkToBijo, style: 'primary' }]} />
    </>
  )
}
