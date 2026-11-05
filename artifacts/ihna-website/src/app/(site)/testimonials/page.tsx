// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, QuoteWall } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Testimonials',
  path: '/testimonials/',
  description: 'I found this course to be very informative and interacting with other students as well as the educator was another great source of learning method. How…',
})

export default function TestimonialsRoute() {
  return (
    <>
      <Hero heading="Testimonials" variant="compact" audienceSwitch={false} />
      <QuoteWall
        eyebrow="In their words"
        heading="What our *students say*"
        items={[
        {
          name: 'Miwa Fulu',
          body: (
            <>
              <p>I found this course to be very informative and interacting with other students as well as the educator was another great source of learning method. How the instructor Tracy encouraged students to bring out the information or experience that they have was another way that I increased my knowledge in mental health. Learning about all the different theories was difficult but going through TA made me think how to utilize them in practice. In this regard, I found that Theory Assessment was one of the good methods of learning.</p>
              <p>I was a little apprehensive to learn deep and difficult subject such as Counselling “online” but because of the school has good support team including IT team and Meril taking support session every week, I received enough help and makes me enjoy the course more knowing that I always have their support.</p>
              <p>Overall, it has been a good course, and I learnt a lot in the first semester. Looking forward to learning more in the 2nd semester.</p>
            </>
          ),
        },
        {
          name: 'Jennifer',
          body: (
            <>
              <p>Starting this course in May 2022, I have learnt so much. I have learnt to be a strong, confident and positive person. This course has provided me with knowledge on a wide range of topics, and I would not have been able to do this without the support of my teachers Tracey, Payel, Meril and Sara. They have provided confidence and supported me when I was struggling with the computer. From a person who had no knowledge of the computer to now being able to type this message for others to read and being able to talk to my peers via Teams chat. I am still slow and learning each day but getting better. I want to thank IHNA and everyone for believing in me.</p>
            </>
          ),
        },
        {
          name: 'Sandra Best',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/65d4a423d9aa5-Sandra-DCL-photo1.jpg', alt: 'Sandra Best', width: 1324, height: 2944 },
          body: (
            <>
              <p>I've had a positive learning experience and have found the guidance and support from the team members, including Tracey, Payel, Meril, Sara the administrative staff, to be exceptional.</p>
              <p>Throughout the course, I have received valuable and comprehensive instruction that has greatly enriched my understanding of the subject matter. The content is well-structured and presented in a manner that's easy to understand, making it accessible for learners at all levels.</p>
              <p>Tracey and Payel are excellent instructors who demonstrate a deep knowledge of the material and effectively deliver the lessons. They're both very patient, approachable, and always ready to answer questions or provide clarification. Their teaching style creates a comfortable and engaging learning environment.</p>
              <p>Meril, and Sarah have also been instrumental in my learning journey. They have consistently gone above and beyond to provide additional resources, offer personalised support, and address any concerns or questions I have promptly. Their dedication and commitment to helping students succeed is great.</p>
              <p>The admin staff have been extremely helpful in ensuring that the course runs smoothly. Their efficient communication, organisation, and attention to detail have contributed to a seamless learning experience. Meril has been instrumental in this.</p>
              <p>Overall, I am highly satisfied with the DCL course and the support I have received from the entire team. Evidently, they are genuinely invested in their students' success and I would highly recommend this course to others looking to expand their knowledge in this field.</p>
            </>
          ),
        },
        {
          name: 'Nansi Habib',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/65d4a37eee8e7-Nansi-Habib-Pic.jpg', alt: 'Nansi Habib', width: 482, height: 601 },
          body: (
            <>
              <p>I recently arrived to Australia as a refugee born in Syria and had to live away from home in Lebanon for 12 years which prevented me from continuing my education and fulfil my passion which is becoming a counsellor and being able to help others with their mental health. when I enrolled in this course it was my very first step into a new country with new methods of teaching and learning.</p>
              <p>However after meeting my educator and having many inquiries with different subjects , the response of the staff was profound , they made me feel safe and respected no matter how ridiculous my questions were and helped me go further with each unit effortlessly.</p>
              <p>I had the privilege of meeting other students and connecting with people from diverse cultures and languages, I gained solid knowledge in the basics of counselling therapies which helped me decide my future path clearly.</p>
              <p>I want to thank everyone in IHNA for all the efforts they put in this place and encourage students to keep going with their passion because nothing is impossible.</p>
            </>
          ),
        },
        {
          name: 'Sinead Ramsbottom',
          body: (
            <>
              <p>I've recently completed the Diploma of Counselling with IHNA. Overall my student experience was good. The course tutors Tracey and Payel were extremely helpful and supportive throughout the duration of the course. Tracey was my first tutor when I began the course and her wealth of industry experience and warm and friendly nature radiated in every class, I really looked forward to my classes with Tracey and am grateful to her for her encouragement and guidance. Payel supported me as I navigated my studies and worked full-time - she was flexible and understanding of my time constraints. She supported me in completing all of my second-semester coursework on time. Thank you Payel for your patience and support. Meril was also very supportive throughout the year by forwarding relevant documentation for assignments when the tutors were on leave or unavailable and running weekly support sessions for additional student guidance on the course material. Sara also organised some interesting and informative guest speaker seminars in Semester 2, which I enjoyed. There was a lovely mix of students in the class from all walks of life and a wide range of ages - this enabled us to learn from one another's varied experiences and stories. The collaborative simulation role plays in Semester 1 offered an excellent opportunity to work alongside your classmates to gain some real-life experience in a counselling role.</p>
            </>
          ),
        },
        {
          name: 'Tanya Maree Shelby',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/64129c272072f-tanya_maree.jpg', alt: 'Tanya Maree Shelby', width: 1600, height: 1901 },
          body: (
            <>
              <p>CHC51015 – Diploma of Counselling Review at the Institute of Health and Nursing Australia.<br /><br /> This course has been a great source of learning for me. The content and format of learning that I had from this course was very intensive and I learned a lot. For one I had no idea that I would be reading and publishing Journals that I have written or worked on in collaboration with others. I have had to discuss different topics in the discussion area which proved to be very informative for me and was a great experience for me. Learning online and completing group work with other students from around Australia to learn from each other and share experiences and ideas and working together to complete roleplays for experience with counselling scenarios. <br /><br /> I found the course to be very comprehensive and informative, especially since there was a lot to learn about from the effects of the trauma and second is the fact that I learned to do research. There were different stage of doing a research like brainstorming the research question, writing a literature review and writing assessments. I hope that this learning process would be helpful in shaping my future as a counsellor in a school setting working with students to find their way through life’s hurdles and to help them become everything they dream of achieving and by being able to be a sounding board and help them when things are not going smoothly in their life and see them come out the other side and succeed.<br /><br /> I would like to thank the whole administration of IHNA for their efforts and the opportunity that I got to attend this course and complete it successfully. Sometimes I wished I got more feedback on my assignments and how well I answered the questions rather than just receiving a satisfactory and not be able to read the feedback as was closed and unable to view. The overall help and assistance and support given by the lead instructors and the AQC- academic quality coordinator and the IT support were very helpful and made it easier to resolve issues as they arose with a quick turnaround. I am especially thankful to Meril Manuel for all her help during and support during weekly Support sessions and also when I couldn’t get any other help with unlocking of an assessment, Meril was able to follow up for me and had the assessment opened in no time, so I am very grateful to her for all her help and support.</p>
            </>
          ),
        },
        {
          name: 'Tazin',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b62d20303-5d5be098a8c79-tazin.jpg', alt: 'Tazin', width: 150, height: 150 },
          body: (
            <>
              <p>It has been a privilege to be a part of IHNA and I would like to thank the faculty for their encouragement and support. Moreover I would like to thank the new Course Coordinator Michelle Tollentino for the changes she has made, whether it might be extra-curricular sports activities, community events or education implementation. She has made the institute better which has helped me and others in many ways. Quote I wanted to share Try to be a rainbow in someones cloud by Maya Angelou. Additionally I would like to say that we should be proud of what we are learning, because it will make a difference in other peoples life which is more important than the financial rewards that we will be earning. It will give us the satisfaction that we are able to make a difference in the society.</p>
            </>
          ),
        },
        {
          name: 'Sheryl Karren Ginez',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b61ea8066-5d5be31409ec9-sheryl-karren-1.jpg', alt: 'Sheryl Karren Ginez', width: 150, height: 150 },
          body: (
            <>
              <p>Studying at IHNA has been a great experience&gt; Our classroom is multicultural in classroom but we get along well, and we had fun while learning. It feels like a second home. My educators and admins at IHNA were supportive every step of the way, although they were strict when it comes to our assessments, I know it was for the betterment of my career. The campus is strategically located in the heart of Perth. It is near the transport station so it was always a breeze to come and learn. Now I am a Graduate of Diploma of Nursing and i will be taking my education further to higher degree to become a Registered Nurse. I highly recommend Institute of Health and Nursing Australia, for me this is the best place to study nursing, with caring staff, great location, modern simulation labs. I am so proud of being an IHNA nursing graduate!</p>
            </>
          ),
        },
        {
          name: 'Sharmie Xu',
          body: (
            <>
              <p>For many years I have wanted nothing more than to study and become a nurse, a dream I thought I would never achieve. I was fortunate enough to have found IHNA and have enjoyed my time here in the past 6 months. Upon starting my Diploma of Nursing my worst fear as a mature aged student was that I would struggle with the workload, juggling a family, and working. Let me start by saying the new management has gone above and beyond to make changes necessary to take the college in a new and positive direction. The academic and professional knowledge I have attained is just one of the reasons I would encourage individuals to study with IHNA. In fact, beyond the academic studies, the multicultural exposure is something I admire greatly. I have recently finished my first semester and attached a clinical placement at Bupa Aged Care. with the continuous guidance and support of my educators who have not only inspired me to excel academically but have embedded in me the confidence I was lacking. After 2 weeks of applying the skills I have mastered in class and in the laboratory, I am excited to say I was offered a position at the Bupa facility. Thank you to all staff at IHNA for the quality training and opportunities given.</p>
            </>
          ),
        },
        {
          name: 'Sazh Thapa',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b5ffa30cd-5d5bdfe008e05-sazh.jpg', alt: 'Sazh Thapa', width: 150, height: 150 },
          body: (
            <>
              <p>Life is a bundle of different experiences, both good and bad, from our birth to the end. People get asked different variations of the same question: What has been your best experience?” in life. People may have answered the same question with various answers. For instance, birthday parties, winning games, special occasions, and certain programs, while some others finds that their experience as being parents was the most rewarding one they have had. Personally though, I consider my time in college as my most valuable experience. Being an international student, I had many options to apply for my college or university. I am also a student who is always concerned about the quality of studies and programs. This reason made me search for different colleges and universities. Finally I ended up with IHNA [Institute of Health and Nursing Australia], one of Australias premier providers of quality education and training. The institutes key area of expertise and course delivery are Nursing, Health and Community services such as Aged care, Disability support and Early Childhood Education and Care, health management and English language studies and I opted for my favourite course Nursing. First, my experience in college has given me a chance to sharpen my skills, practice and enhance knowledge in my field of choice. There have been, and will continue to be, many opportunities to learn more ways of improving skills as a result of the time spent in school, which I am truly thankful for. The opportunities of face to face learning with the guidance of tutorials, training, real demonstrations, presentations and motivation on a one to one basis by the institute’s trainer is the best part of the college. This was my first experience studying at an overseas college, with a class that was multicultural and a language that was new. I enjoyed the experiences as I understand it builds up the mutual understanding and abilities to learn about one another when living and working together. With a fully equipped campus, IHNA provides modern facilities and amenities, sports and game facilities, opportunities to celebrate birthdays and different occasions, including state-of-the art nursing and computer laboratories, a student library, audio-visual equipped classrooms, full real-world based practicals with best of the best tutorials, carrying out demonstrations on real human lookalike dummies which I should not forget to mention. All the practicals in different hospitals and aged care centres were unforgettable, where I was able to translate all my theoretical knowledge into practice, with the help of senior staff, educators and RNs. Every time I was encouraged and given a very good feedback from my senior staff, which was satisfying and made me motivated to perform even better. Truly from my heart, I enjoyed each and every single second of my time during class without missing a single class in the entire period of 2 years. The love I got from IHNA teachers is precious for me. I must thank Michelle Tolentino [Course coordinator], Litesh Mehta [Lead educator], Jordana Tamayo [Clinical placement staff], Sarita Chavan Sharma - [Staff Admin] and other each and every teacher of IHNA who are very kind, helpful, supportive and stand right behind the students to help them to move forward and reach their goals and their destination, just as parents would do! These experiences are truly irreplaceable and I would not trade them for anything. If I could go back in time and speak to my much younger self when I was first asked the question, What has been your best experience? the baby-faced version of me would certainly have been surprised by what my answer is now.</p>
            </>
          ),
        },
        {
          name: 'Roshna Khadgi',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b5eb89a47-5d5be070d781f-roshana.jpg', alt: 'Roshna Khadgi', width: 150, height: 150 },
          body: (
            <>
              <p>I would like to take this opportunity to thank my educators and staff at IHNA for their continuous support while I was studying in IHNA since 2017. I appreciate the values I imbibed during the course period. IHNA provides a student-centric environment and helped me settle in quite efficiently. I look forward for the coming 2 years while I transition to Diploma of Nursing. Quote: You learn something every day if you pay attention.</p>
            </>
          ),
        },
        {
          name: 'Payal Joshi',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b5dae1bc3-5d5be2c5eb1b4-payal-joshi.jpg', alt: 'Payal Joshi', width: 150, height: 150 },
          body: (
            <>
              <p>I was looking for some courses online and came across the IHNA website. It was the first step to get into the health profession. I chose Cert. 3 in HEALTH SERVICES ASSISTANCE (acute care). It was really a great experience. Here everyone is very supportive and helped me in online assessments whenever needed. After my assessments, I had my placement in Mount Hospital where I wanted to be and now, I am working in ROYAL PERTH HOSPITAL as a Patient Care Assistant. I am very happy with IHNA, and I have enrolled into another course, that is, DIPLOMA of NURSING, part time. I am finding the online studies very user friendly. I have already recommended some of my friends to IHNA and I am happy to recommend more in the future. Thank you IHNA!</p>
            </>
          ),
        },
        {
          name: 'Nyakuma Johnson',
          body: (
            <>
              <p>I really enjoyed todays topic (Communicate and work in health or community services) and understand it more now. The trainer explained it well. Also, the campus is very easy to find; right in the heart of the city with nice and polite staff and trainers.</p>
            </>
          ),
        },
        {
          name: 'Nisha Gale',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b5a24b398-5d5be05689580-nisha.jpg', alt: 'Nisha Gale', width: 150, height: 150 },
          body: (
            <>
              <p>What can I say? For sure IHNA is one of the best colleges for career development and to build-up yourself into a good Nurse, and to develop your personality too. It’s a great opportunity for me to be in IHNA where learning is fun and satisfying with good guidance from educators and friends/ students from different countries. I would like to thank my family who encouraged me to pursue higher education and my teachers and friends at IHNA for their ongoing support. In addition, I would like to thank our course coordinator Michelle Tolentino and team of SRC and all for introducing new concepts on community events, sports activities and projects which have added more fun and excitement during learning. I am really happy and feel proud to be in IHNA and best wishes for everyone for the great future we are going to have through IHNA! And we are privileged to be a part of a career where helping is the motto. I personally like to help everyone in need. Save one life, you are a hero. Save hundred lives, you are a NURSE.Lastly, I would like to thank all the staff of IHNA for the best guidance for my career.</p>
            </>
          ),
        },
        {
          name: 'Melissa Sturrock',
          body: (
            <>
              <p>I was always finding ways to help within the community; like cooking soups and delivering to the local elders) or helping youth groups and so on. I lost my mother at a very young age and my nana showed me how to care for people around me. I came to a point in my life where I was a single mother of four and I wanted to show my children that you can achieve anything you want in your life.</p>
              <p>I did a lot of research online about nursing, and how I could achieve this. That’s when I first signed up to an online college to complete an assistant nurse course, however that college was on-campus and living in regional WA, They could not find me work placement, so right at the end of the course I walked away, as I would not get my certificate , if I could not do my work practice. It was then I decided not to give up, and I did more research on colleges and universities that were well recommended. I came across many . However I decided to go with IHNA Perth campus. I completed my Cert 3 in Aged Care and I’m currently studying Diploma of Nursing. (finally a collage that is dedicated to nursing!). The college was welcoming and non-judgemental.</p>
              <p>The college was easy to locate, and within walking distance of public transport. The facility has staff members who have worked in the field of nursing. So they really know what they are talking about. When it came to work practice. I was given a placement within ten minutes from my home. The IHNA team are very professional when it comes to teaching the classes, and take the time for one on one if you dont understand, They make sure that you are well prepared for work practice and the work force. There are labs within the facility and I would highly recommend this college.</p>
            </>
          ),
        },
        {
          name: 'Marissa Maryam Leong',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b6cfe1a3b-5d5be0b619108-Marissa.jpg', alt: 'Marissa Maryam Leong', width: 150, height: 150 },
          body: (
            <>
              <p>My name is Marissa and I am an international student currently pursuing my Diploma of Nursing at IHNA, Parramatta. Recently I had some obstacles related to my visa extension. Before starting with IHNA, I was granted a visa by the immigration to complete my accounting study which was supposed to get completed by April 2018. Within 3 months of my accounting studies, I have been introduced to the career growth within the nursing field. I approached IHNA Parramatta and was accepted with a smooth transition. My Nursing studies will be ending by Jan 2019 and my visa will be expiring in June 2018. Having said that, I need a new visa as per immigrations advice for course completion. Without further delay, I apply for the new visa through IMMI account and unfortunately I received a warning message after submission of my CoE. I panicked and was stressed, then immediately approached IHNA and the person responsible (Loretta) to seek for guidance in completing my visa extension. Loretta was so helpful in explaining the procedures, with the help of Admin (William, Sheryl) printed related supporting documents and also referred me directly to IHNA compliance officer (Paola) who was in charge of this situation. The IHNA compliance officer walked me through the whole process, contacted and liaised with immigration officer in resolving my COE related matters. Finally, we received an email from Immigration department to confirm my COE is in place to proceed for visa submission. I applied for the new visa again through IMMI account on the 1st week of Feb 2018 and was granted with a new visa which facilitates completion of my Diploma of Nursing. The whole experience in applying for new visa was so stressful, but however with the great help of IHNA, my transition was smooth and worthwhile.</p>
            </>
          ),
        },
        {
          name: 'Lilybeth G. Bowles',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b6b72642d-5d5be36f883b7-lilybeth-1.jpg', alt: 'Lilybeth G. Bowles', width: 150, height: 150 },
          body: (
            <>
              <p>My Name is Lilybeth G. Bowles When I first visited the campus, I took the Test exam which I found more straightforward than other campus exams. The staff that conducted the interview were helpful and explained the information about the services in IHNA as well as campus policies.</p>
              <p>I chose IHNA Perth campus because I found it convenient and close to everything. For example, public transport, shops, and a wide choices of food outlets. Orientation day was exciting and I met new people who have become friends.</p>
              <p>The Campus location was convenient and well organised with lots of rooms. Also, laboratory, Computer lab, and library facilities were available as well as kitchen and student rooms.</p>
              <p>I am currently working in an age care facility as an AIN/medication competency. This job motivated me to learn more about the competency required to administer medications &amp; gain physical health learning. Thats why I chose the EN program to develop my knowledge and be more confident to work in a Hospital. I found that IHNA Campus was best suited to my on the job learning.</p>
              <p>My experience during my studies in IHNA Campus during the first unit of our assessment was challenging for me. However, there is a lot of information via hand outs and power point presentations to learn and to understand what the assessment book is asking.</p>
              <p>Also the Educator was really supportive &amp; understanding and explained the content effectively. We also had laboratory practice from the simulation base assessment, this is very interesting because we were doing physical assessments which assisted further with my practical understanding.</p>
              <p>Student hub facilitates online study for the assessment. In addition to Q &amp; A and Worksheets, SBA was so helpful for us students because we could access a lot of information there to answer the assessment, e.g. Power point slides and E-learning resources.</p>
              <p>Practical work in the Nursing home is more interesting. Mental Health and Hospital Staff are supportive and helpful and IHNA staff educators visited regularly to see if we are enjoying our work. Working together in the class campus &amp; the Hospital for the last 2 years has been a really good experience.</p>
              <p>My plan is to continue work as an EN when I get my registration.</p>
              <p>I highly recommend IHNA Perth campus to others who want to start their Nursing career as my 2 years in IHNA campus was very successful and helped me gain significant knowledge. I have already recommended a few people who are now enjoying the experience.</p>
            </>
          ),
        },
        {
          name: 'Jismy Ouseph',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b6ab4cab9-5d5be2a496aad-jismy-ouseph-1.jpg', alt: 'Jismy Ouseph', width: 150, height: 150 },
          body: (
            <>
              <p>I have selected IHNA for my nursing education and it was a good decision. Now I can proudly say that IHNA helped me to achieve my dream. I had a quality time there: where I had talented and supportive staff and educators, functional lab, computer library and so on. I am really thankful to IHNA which gave me the confident and exposure to my nursing career. I am going to be a grad nurse at Joondalup Hospital from 12th Sep 2016 onwards and am planning to continue my nursing journey (Bachelors at ECU). IHNA is an ideal place for the student who wishes to achieve his/her nursing career confidently and competently.</p>
            </>
          ),
        },
        {
          name: 'Deriya Makina',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b69c0cd99-5d5be3572a782-deriya-1.jpg', alt: 'Deriya Makina', width: 150, height: 150 },
          body: (
            <>
              <p>Since I was a little girl, I always wanted to look after people around me. To fulfill my passion and since I was working in aged care at that time I decided to further develop my skills so I chose to study the Diploma of Nursing.</p>
              <p>First of all, I went on google to research about nursing, such as institutes that offer the course, the cost and flexibility to suit my life.</p>
              <p>I came across IHNA, and I straight away contacted the administration who helped me to understand more about the EN program.</p>
              <p>I got enrolled to the program and the experience was amazing. I met new people from different cultures, of which some of them I can now call my friends.</p>
              <p>During the course I got extraordinary support from educators especially with online and simulated based assessments. Educators were always available to assist students. For example, they offered one-on-one appointments for any extra support with theory or practical work. IHNA also provided an English support person/educator to help students improve their English Language. Online assessments were great in the sense that they helped me develop my knowledge in nursing through researching and improved my computer skills.</p>
              <p>IHNA is located in the heart of Perth city, and everyone can access the campus easily by public transport. Operating hours were flexible and suited my family needs to the extent that I was able to juggle both (studying and family). Also the fees are reasonable and they offer easy payment plans or vet fee help to those who are eligible.</p>
              <p>I am planning to apply for a graduate program and I have been also accepted at Murdoch University to study Bachelor of Nursing commencing semester 1 in 2017.</p>
              <p>Thanks a million IHNA for giving me a new career, I shall cherish all the beautiful memories with you for the rest of my life.</p>
            </>
          ),
        },
        {
          name: 'Christian Pascaran',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b68c1c149-5d5bdf740b449-Christian_Pascaran.jpg', alt: 'Christian Pascaran', width: 150, height: 150 },
          body: (
            <>
              <p>I have completed my Cert 3 in Acute Care through IHNA. The Staff/educators were very helpful to students when it came to addressing our problems. I would like to thank Mrs.Rhodora, Ms. Sheryl, Ms. Michelle and Ms. Sarita and others for accommodating all of my needs E.g. placement adjustment, financial situation and other requirements. The school equipment, labs and other infrastructure are more than adequate to help students to gain knowledge needed in further studies. I am actually already planning to enrol for Diploma of Nursing later this year as IHNA is a good place to practice simulations.</p>
            </>
          ),
        },
        {
          name: 'Baby Aurora Trijo',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b67f2f5c0-5d5be2f23898b-baby-aurora.jpg', alt: 'Baby Aurora Trijo', width: 150, height: 150 },
          body: (
            <>
              <p>I did my Certificate III in Aged Care at IHNA-Perth Campus. I was pleased and so satisfied with my studying experience in IHNA that I decided to continue and pursue a Diploma in Enrolled Nursing.</p>
              <p>The campus is very accessible. Its situated in the CBD and just a short walk from the Perth Underground station so getting here is so easy. IHNA is one of the most reputable schools in the field of health care and nursing education. Perth Campus is a really conducive place for learning. All educators are always available to assist with the practical and written assessments. Literacy educators are experts in their particular field of teaching, approachable and very supportive.</p>
              <p>The Institute has Simulation Based Assessment which aims to help students to perform practical tasks better. The clinical practicum provides skills to develop knowledge to improve the learning experience. The amazing and high technology laboratory and online assessment system is remarkable and very easy to access.</p>
              <p>IHNA experience was definitely one that I will never regret. It was quite possibly one of the best decisions I made towards building my career and I am grateful that I had the opportunity to study at IHNA. I would highly recommend IHNA - Perth Campus to everyone!</p>
              <p>The dedication, support and motivation of each staff member is great and enables students like myself to achieve their dream.</p>
              <p>IHNA has inspired me and given me the drive to pursue further education.</p>
            </>
          ),
        },
        {
          name: 'Ashley Hartnett',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b6722f2df-5d5be005d61e0-AshleyHartnett.jpg', alt: 'Ashley Hartnett', width: 150, height: 150 },
          body: (
            <>
              <p>When my daughter was in the NICU diagnosed with severe jaundice, a surge nurse went out of her way and cared for us during this difficult time. The care, professionalism and dedication from this nurse has inspired me to become a nurse myself. This led me to the start of my journey in nursing, beginning with Enrolled Nursing at IHNA Paramatta. During the beginning of my first semester, i was prepared and excited, although my training felt at times unorganized and communication was not clear. This led me to become stressed and anxious. Toward the end of the semester one and into semester two, life at IHNA started to improve. I had a qualified and experienced teacher, Ritchelle Enqriquez who went out of her way to help me learn and understand what I was doing and why. She really went that extra mile to teach me how to write academic writing and taught me on a step by step basis, and she showed me to be confident in everything I do. Through semester two and three IHNA started to feel more like a family with Michelle Tolentino and Ross Pancho joining the team as our educators. The study became more structured and organized. Michelle really put the extra effort in as educator with exams to assess our level of knowledge and extra support through my third placement. I felt I could continue and become a qualified nurse and this is when I started considering becoming a nurse educator one day. Michelle Tolentino then was named our course co-ordinator in semester four, which I believe was one of the best things IHNA did. This brought with it Easter parties, Anzac day celebrations, sports days and encouraged all of the classes to start talking and building relationships outside of their specific classes which improved the culture of the school. The communication was opened with all educators and staff. This encouraged team work and created a friendly and effective environment. During semester four we became a family and a new teacher joined our class Jordana Tamayo; a one-of-a-kind-teacher who puts in the extra effort to build content for students who will understand and are able to enjoy learning. This approach boosts student confidence in a dedicated and professional manner. In the last two years at IHNA Parramatta I have made friends who have become family. With this step by step guidance by the experienced and knowledgeable educators and friendly assistance of all staff at IHNA, I feel this school has offered me the best opportunity to develop my skills as a nurse. The facilities are continually improving and the support I have acquired is unlike any other school. I can positively say that all I understand about nursing is because of the support and teaching this school has provided me over the years. Thank you to all the staff at IHNA Parramatta.</p>
            </>
          ),
        },
        {
          name: 'Adam Gardoll',
          photo: { src: '/images/ihna/uploads/mwt-testimonials/6048b665e10a8-5d5bdfba4fa5d-Adam-Gardoll.jpg', alt: 'Adam Gardoll', width: 150, height: 150 },
          body: (
            <>
              <p>I am currently in semester 3 for Endorsed Enrolled Nursing. Since I started I have noticed IHNA have come a long way. They do take on board feedback and are always looking to improve in all aspects. They are also holding events like sports fest which I thoroughly enjoyed, and wished it was something they would have more regularly. The staff in my opinion are all supportive and friendly and I am enjoying my studies here. I would also like to say that the lab at IHNA Parramatta has improved greatly since I started and is a good place to practice simulation</p>
            </>
          ),
        },
        ]}
      />
    </>
  )
}
