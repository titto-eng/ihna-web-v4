// Enquiry forms (40-enquiries §7, DEC-2/63). Hand-edited constants; keep it plain data.
// IHNA's 30 form keys (29 from the brief + `rpl-enquiry`) (inventory/v2/ihna/enquiries.csv, 14 handler families; brief-forms-campaigns §5). Each holds its fields, its
// destinations (`when` = only when the condition holds at insert), its thank-you (the exact old paths: GTM counts conversions on them)
// and its autoresponder. `recipientGroup` names a group in ./enquiry-routing.ts. Course/campus CRM keys are in ./course-crm.ts and the
// campaign table in ./campaign-codes.ts (41). Field types: text, email, tel, select, radio, textarea, checkbox, hidden, country, course,
// campus. The browser only ever sees key, name, consentText, fields, captcha, honeypot.
// File uploads: the old CV / attachment fields are a link field here (no upload pipeline; open question in 40 §10).
import type { FormDef, FormFieldDef } from '@/lib/enquiries/types'
import { campaignCodes } from './campaign-codes'
import { campusOptions, crmCoursePickerOptions, IHNA_ONLINE_COURSE_CODES, SHORT_COURSE_KH_IDS } from './course-crm'

const CONSENT = 'We use your details to respond to your enquiry and to tell you about IHNA courses. You can opt out at any time.'
const SIGN_OFF = '\n\nKind regards,\nThe IHNA Admissions Team\nInstitute of Health and Nursing Australia | 1800 22 52 83'

/** Optional link instead of a file upload (https only). */
const LINK_PATTERN = '^https://[^\\s]{4,500}$'

// Shared field shapes (plain data).
const firstName: FormFieldDef = { name: 'firstName', type: 'text', label: 'First name', required: true, maxLength: 80 }
const lastName: FormFieldDef = { name: 'lastName', type: 'text', label: 'Last name', maxLength: 80 }
const lastNameRequired: FormFieldDef = { ...lastName, required: true }
const fullName: FormFieldDef = { name: 'name', type: 'text', label: 'Full name', required: true, maxLength: 160 }
const email: FormFieldDef = { name: 'email', type: 'email', label: 'Email', required: true }
const phone: FormFieldDef = { name: 'phone', type: 'tel', label: 'Phone', required: true }
const phoneOptional: FormFieldDef = { name: 'phone', type: 'tel', label: 'Phone' }
const phoneCode: FormFieldDef = { name: 'phoneCode', type: 'text', label: 'Country calling code', maxLength: 6, pattern: '^\\+?[0-9]{1,4}$' }
const message: FormFieldDef = { name: 'message', type: 'textarea', label: 'Message', maxLength: 2000 }
const country: FormFieldDef = { name: 'country', type: 'country', label: 'Country' }
const course: FormFieldDef = { name: 'course', type: 'course', label: 'Course of interest' }
const studentType: FormFieldDef = { name: 'studentType', type: 'hidden', label: 'Student type', pattern: '^(domestic|international)?$' }
const packageId: FormFieldDef = { name: 'packageId', type: 'hidden', label: 'Package', pattern: '^[0-9]{0,6}$' }
const campusAll: FormFieldDef = { name: 'campus', type: 'select', label: 'Campus', options: campusOptions('melbourne-heidelberg', 'melbourne-cbd', 'sydney-parramatta', 'perth-sgt', 'brisbane') }
const courseKhId: FormFieldDef = { name: 'courseKhId', type: 'select', label: 'Course', required: true, options: crmCoursePickerOptions() }
const states: FormFieldDef['options'] = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].map((value) => ({ value }))
const yesNo: FormFieldDef['options'] = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
const promoCode: FormFieldDef = { name: 'promoCode', type: 'text', label: 'Promo code', maxLength: 64 }

const WHERE_HEAR = [
  'Google Search', 'Email', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Other Social Media', 'Word of Mouth',
  'Referral from a Friend / Family', 'External Career / Health Expo', 'IHNA Health & Nursing Expo', 'IHNA Open Day', 'Shopping Centre Pop-Up',
  'School / Careers Event', 'Community Event', 'Webinar / Information Session', 'Education Agent / Partner Referral', 'Online Advertisement',
  'Website Recommendation', 'Bus Advertisement', 'Other',
].map((value) => ({ value }))

/** Landing intent: "brochure" sends the visitor to the thank-you page with the course brochure (60 §4). */
const intent: FormFieldDef = {
  name: 'intent', type: 'radio', label: 'Would you like the course brochure?',
  options: [{ value: 'enquiry', label: 'No, just contact me' }, { value: 'brochure', label: 'Yes, send me the brochure' }],
}

// Short-course rule (functions.php ~900-1013): KH portal, self-enrol steps by email, the short-course thank-you page.
/** The courses the live RPL form offers (KH ids; 410 HLT47321 and 364 HLT57921 are not in the CRM table). */
const RPL_KH_IDS = [72, 357, 358, 385, 386, 408, 349, 391, 407, 395, 384, 350, 409, 77, 387, 396, 406, 363]
const SHORT: { courseKhIdIn: number[] } = { courseKhIdIn: SHORT_COURSE_KH_IDS }
const SELF_ENROL = {
  when: SHORT,
  subject: 'How to enrol in {{courseTitle}} at IHNA',
  body: 'Hi {{firstName}},\n\nThank you for your interest in {{courseTitle}}. This is a self-enrolment course, so you can enrol online whenever you are ready:\n\n1. Open the course page on ihna.edu.au.\n2. Select "Apply Now" and complete the application form.\n3. Pay the course fee online.\n4. Once your payment is confirmed, you can start the course.\n\nIf you have any questions, reply to this email or call us.' + SIGN_OFF,
}

const LANDING_SUBJECT = 'Enquiry from Landing page'

export const forms: FormDef[] = [
  // --- Family 1: WP admin-post quick_enquiry ------------------------------------------------------------------------------------
  {
    key: 'quick-enquiry',
    name: 'Quick enquiry',
    family: 'WP admin-post: quick_enquiry (functions.php:307-1161)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Quick Enquiry',
    campaignFallback: 'default',
    fields: [
      firstName, lastNameRequired, email, phone,
      { ...campusAll, required: true },
      { ...course, required: true },
      country,
      { name: 'whereHear', type: 'select', label: 'Where did you hear about us?', required: true, options: WHERE_HEAR },
      { name: 'whereHearOther', type: 'text', label: 'If other, please specify', maxLength: 200 },
      message, promoCode, studentType, packageId,
      { name: 'pathwayEnquiry', type: 'hidden', label: 'Pathway', maxLength: 80 },
    ],
    destinations: [
      { adapter: 'hubspot' },
      { adapter: 'email', config: { recipientGroup: 'enquiries' } },
      { adapter: 'email', config: { recipientGroup: 'admissions' } },
      { adapter: 'ihnaOnline', when: { courseCodeIn: IHNA_ONLINE_COURSE_CODES } },
      { adapter: 'portalCrm', when: SHORT },
      { adapter: 'email', config: { recipientGroup: 'health-careers-pathways' }, when: { courseKhIdIn: [75], field: { name: 'pathwayEnquiry', present: true } } },
      { adapter: 'email', config: { recipientGroup: 'anaesthetic-technology' }, when: { courseKhIdIn: [400] } },
    ],
    thankYou: { type: 'path', path: '/quick-enquiry-thanks/', rules: [{ when: SHORT, path: '/short-course-enquiry-thanks/' }] },
    autoresponder: { enabled: false, variants: [SELF_ENROL] },
  },
  {
    key: 'course-brochure',
    name: 'Course brochure / handbook download',
    family: 'WP admin-post: brchHndbk_enquiry (footer.php:453, single-courses.php:274)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Course Brochure Download',
    campaignFallback: 'default',
    fields: [
      firstName, email, phone, country,
      { name: 'state', type: 'select', label: 'State', options: states },
      { name: 'docReq', type: 'hidden', label: 'Document', pattern: '^(brochure|handbook)?$' },
      course,
    ],
    destinations: [
      { adapter: 'hubspot', config: { hubspotCampaignSourceFixed: 'Website Brochure Download' } },
      { adapter: 'email', config: { recipientGroup: 'marketing' } },
    ],
    thankYou: { type: 'brochure', path: '/thanks/' },
  },

  // --- Family 2: WP admin-post "other enquiries" ---------------------------------------------------------------------------------
  {
    key: 'lp-enquiry',
    name: 'Common course enquiry',
    family: 'WP admin-post: lp_enquiry (template-common-enquiry-lp.php, functions.php:3522-3776)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Course Enquiry',
    campaignFallback: 'default',
    fields: [firstName, lastName, email, phone, country, campusAll, { ...course, required: true }, message, promoCode],
    destinations: [{ adapter: 'portalCrm' }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/quick-enquiry-thanks/' },
  },
  {
    key: 'online-learning',
    name: 'Online learning enquiry',
    family: 'WP admin-post: online_learning (template-ihna-online-learning.php, functions.php:3033-3293)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Online Learning Enquiry',
    campaignFallback: 'default',
    fields: [firstName, email, phone, country, course],
    destinations: [
      { adapter: 'portalCrm', config: { campusFixed: 'online' } },
      { adapter: 'email', config: { recipientGroup: 'e-learning' } },
    ],
    thankYou: { type: 'path', path: '/quick-enquiry-thanks/' },
  },
  {
    key: 'blog-enquiry',
    name: 'Blog enquiry',
    family: 'WP admin-post: blog_enquiry (blog-enquiry-form.php, functions.php:4810-5205)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Blog Enquiry',
    campaignFallback: 'blog',
    fields: [fullName, phone, email, course, message],
    destinations: [
      { adapter: 'dynamics', config: { dynamicsSubject: 'Enquiry from IHNA Blog' }, when: { not: SHORT } },
      { adapter: 'portalCrm', when: SHORT },
      { adapter: 'hubspot' },
      { adapter: 'email', config: { recipientGroup: 'marketing' } },
    ],
    thankYou: { type: 'path', path: '/blog/thanks/', rules: [{ when: SHORT, path: '/short-course-enquiry-thanks/' }] },
    autoresponder: { enabled: false, variants: [SELF_ENROL] },
  },
  {
    key: 'scholarship',
    name: 'Scholarship application',
    family: 'WP admin-post: scholarship (template-scholarship.php:1150, functions.php:5250-5585)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'Scholarship Application',
    campaignFallback: 'default',
    fields: [
      fullName, email, { ...phone, label: 'Mobile' },
      { name: 'studentType', type: 'radio', label: 'I am a', required: true, options: [{ value: 'domestic', label: 'Domestic student' }, { value: 'international', label: 'International student' }] },
      { ...course, label: 'Preferred course', required: true },
      { name: 'intakeMonth', type: 'select', label: 'Preferred intake month', required: true, hubspotProperty: 'preferred_intake', options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((value) => ({ value })) },
      { name: 'intakeYear', type: 'text', label: 'Preferred intake year', required: true, maxLength: 4, pattern: '^20[0-9]{2}$' },
      { name: 'scholarshipReasons', type: 'textarea', label: 'Why should you receive this scholarship?', required: true, maxLength: 3000 },
      { name: 'consent', type: 'checkbox', label: 'I agree to IHNA contacting me about my application', required: true },
    ],
    destinations: [
      { adapter: 'hubspot', config: { hubspotNote: { fields: ['intakeMonth', 'intakeYear', 'scholarshipReasons'] } } },
      { adapter: 'email', config: { recipientGroup: 'scholarship' } },
    ],
    thankYou: { type: 'path', path: '/scholarship-thanks/' },
  },
  {
    key: 'alumni-story',
    name: 'Alumni: share your story',
    family: 'WP admin-post: alumni_story (template-ihna-alumni.php:2639)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA Alumni : Share your story',
    fields: [
      fullName, phoneOptional, email, course,
      { name: 'otherCourse', type: 'text', label: 'Course (if not listed)', maxLength: 200 },
      campusAll,
      { name: 'whatAreYouDoing', type: 'text', label: 'What are you doing now?', maxLength: 300 },
      { name: 'story', type: 'textarea', label: 'Your story', required: true, maxLength: 4000 },
      { name: 'publishConsent', type: 'checkbox', label: 'IHNA may publish my story', required: true },
    ],
    destinations: [
      { adapter: 'hubspot', config: { hubspotCampaignSourceFixed: 'IHNA Alumni', hubspotNote: { fields: ['whatAreYouDoing', 'story'] } } },
      { adapter: 'email', config: { recipientGroup: 'alumni' } },
    ],
    thankYou: { type: 'inline', path: null },
  },

  // --- Family 3: alumni sign-up (DEC-47 request form; the old OTP flow is not ported) ----------------------------------------------
  {
    key: 'alumni-signup',
    name: 'Alumni registration',
    family: 'WP AJAX alumni OTP (functions.php:3296-3519), replaced by a request form',
    active: true,
    consentText: null,
    emailSubject: 'IHNA Alumni : Registration request',
    fields: [
      fullName, email, phoneOptional,
      { name: 'graduationYear', type: 'text', label: 'Graduation year', maxLength: 4, pattern: '^[0-9]{4}$' },
      course,
      { name: 'studentId', type: 'text', label: 'Student ID (if you know it)', maxLength: 40 },
      { name: 'country', type: 'country', label: 'Country of residence' },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'alumni' } }],
    thankYou: { type: 'inline', path: null },
  },

  // --- Family 4: stakeholder / partner -----------------------------------------------------------------------------------------
  {
    key: 'agent-registration',
    name: 'Agent registration',
    family: 'WP admin-post: agent_registration (template-agent-registration.php)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Agent Registration',
    fields: [
      { name: 'orgName', type: 'text', label: 'Organisation name', required: true, maxLength: 200 },
      { name: 'address', type: 'text', label: 'Address', required: true, maxLength: 300 },
      { name: 'country', type: 'country', label: 'Country', required: true },
      email, phone,
      { name: 'abn', type: 'text', label: 'ABN / registration number', maxLength: 40 },
      { name: 'website', type: 'text', label: 'Website', maxLength: 200 },
      { name: 'contact1Name', type: 'text', label: 'Contact 1: name', required: true, maxLength: 120 },
      { name: 'contact1Position', type: 'text', label: 'Contact 1: position', maxLength: 120 },
      { name: 'contact1Email', type: 'email', label: 'Contact 1: email', required: true },
      { name: 'contact1Mobile', type: 'tel', label: 'Contact 1: mobile' },
      { name: 'contact1Office', type: 'tel', label: 'Contact 1: office phone' },
      { name: 'contact2Name', type: 'text', label: 'Contact 2: name', maxLength: 120 },
      { name: 'contact2Position', type: 'text', label: 'Contact 2: position', maxLength: 120 },
      { name: 'contact2Email', type: 'email', label: 'Contact 2: email' },
      { name: 'contact2Mobile', type: 'tel', label: 'Contact 2: mobile' },
      { name: 'contact2Office', type: 'tel', label: 'Contact 2: office phone' },
      { name: 'contact3Name', type: 'text', label: 'Contact 3: name', maxLength: 120 },
      { name: 'contact3Position', type: 'text', label: 'Contact 3: position', maxLength: 120 },
      { name: 'contact3Email', type: 'email', label: 'Contact 3: email' },
      { name: 'contact3Mobile', type: 'tel', label: 'Contact 3: mobile' },
      { name: 'contact3Office', type: 'tel', label: 'Contact 3: office phone' },
      { name: 'ihnaRep', type: 'text', label: 'Your IHNA representative (if any)', maxLength: 120 },
    ],
    destinations: [{ adapter: 'portalStakeholder' }, { adapter: 'email', config: { recipientGroup: 'agents' } }],
    thankYou: { type: 'inline', path: null },
    autoresponder: {
      enabled: true,
      subject: 'Your IHNA agent registration',
      body: 'Hi {{firstName}},\n\nThank you for registering as an education agent with the Institute of Health and Nursing Australia. Our partnerships team will review your details and contact you about the next steps, usually within five business days.' + SIGN_OFF,
    },
  },
  {
    key: 'referral-application',
    name: 'Referral network application',
    family: 'WP admin-post: referral_application (/join-referral-network/, functions.php:2662)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Referral Network Application',
    fields: [
      { name: 'orgName', type: 'text', label: 'Organisation name', required: true, maxLength: 200 },
      { name: 'regNumber', type: 'text', label: 'Registration number', maxLength: 60 },
      { name: 'address', type: 'text', label: 'Address', required: true, maxLength: 300 },
      { name: 'address2', type: 'text', label: 'Address line 2', maxLength: 300 },
      { name: 'town', type: 'text', label: 'Town / city', maxLength: 120 },
      { name: 'postCode', type: 'text', label: 'Postcode', maxLength: 12 },
      { name: 'region', type: 'text', label: 'Region', maxLength: 120 },
      { name: 'state', type: 'text', label: 'State', maxLength: 120 },
      country,
      { name: 'abn', type: 'text', label: 'ABN', maxLength: 40 },
      { name: 'contactName', type: 'text', label: 'Contact name', required: true, maxLength: 160 },
      { name: 'position', type: 'text', label: 'Position', maxLength: 120 },
      { ...phone, name: 'contactNumber', label: 'Contact number' },
      email,
      { name: 'businessType', type: 'text', label: 'Type of business', maxLength: 160 },
      { name: 'businessDescription', type: 'textarea', label: 'About your business', maxLength: 2000 },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'referral' } }],
    thankYou: { type: 'path', path: '/referral-application-thanks/' },
    autoresponder: {
      enabled: true,
      subject: 'Your IHNA referral network application',
      body: 'Hi,\n\nThank you for applying to join the IHNA referral network. We have received your application and our partnerships team will be in touch about the next steps.' + SIGN_OFF,
    },
  },
  {
    key: 'global-partner',
    name: 'Global partner application',
    family: 'WP admin-post: global_partner_enquiry ([GlobalPartnerEnquiryForm], /partner-application/)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Global Partner Application',
    fields: [
      { name: 'orgName', type: 'text', label: 'Organisation name', required: true, maxLength: 200 },
      { name: 'contactName', type: 'text', label: 'Contact name', required: true, maxLength: 160 },
      { name: 'position', type: 'text', label: 'Position', maxLength: 120 },
      email, phone,
      { ...country, required: true },
      { name: 'website', type: 'text', label: 'Website', maxLength: 200 },
      message,
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'partnerships' } }],
    thankYou: { type: 'path', path: '/partner-application-thanks/' },
    autoresponder: {
      enabled: true,
      subject: 'Your IHNA partner application',
      body: 'Hi,\n\nThank you for your interest in partnering with the Institute of Health and Nursing Australia. We have received your application and our partnerships team will contact you soon.' + SIGN_OFF,
    },
  },
  {
    key: 'employer-eoi',
    name: 'Employer expression of interest',
    family: 'WP admin-post: employee_expression_of_interest (/expression-of-interest-for-employee/)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Employer Expression of Interest',
    fields: [
      { name: 'orgName', type: 'text', label: 'Employer / organisation', required: true, maxLength: 200 },
      { name: 'contactName', type: 'text', label: 'Contact name', required: true, maxLength: 160 },
      { name: 'position', type: 'text', label: 'Position', maxLength: 120 },
      email, phone, country,
      { name: 'staffCount', type: 'text', label: 'Number of staff to train', maxLength: 20 },
      { name: 'trainingInterest', type: 'textarea', label: 'Training you are interested in', maxLength: 2000 },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'partnerships' } }],
    thankYou: { type: 'path', path: '/partner-application-thanks/' },
    autoresponder: {
      enabled: true,
      subject: 'Your expression of interest with IHNA',
      body: 'Hi,\n\nThank you for your interest in training your team with the Institute of Health and Nursing Australia. We have received your details and will contact you to discuss your training needs.' + SIGN_OFF,
    },
  },
  {
    key: 'skilldemy-enquiry',
    name: 'Skilldemy enquiry',
    family: 'WP admin-post: skilldemy_enquiry ([SkilldemyEnquiryForm], /skilldemy/)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Skilldemy Enquiry',
    campaignFallback: 'default',
    fields: [fullName, email, phone, { name: 'courseInterest', type: 'text', label: 'Course of interest', maxLength: 200 }, message],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'skilldemy' } }],
    thankYou: { type: 'path', path: '/quick-enquiry-thanks/' },
  },
  {
    key: 'business-enquiry',
    name: 'Business enquiry',
    family: 'WP admin-post: business_enquiry (template-stakeholder-business-enquiry.php; no live page uses it)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Business Enquiry',
    fields: [
      fullName, email, phone,
      { name: 'company', type: 'text', label: 'Company', maxLength: 200 },
      { name: 'subject', type: 'text', label: 'Subject', maxLength: 200 },
      { ...message, required: true },
      { name: 'address', type: 'text', label: 'Address', maxLength: 300 },
      { name: 'town', type: 'text', label: 'Town / city', maxLength: 120 },
      { name: 'state', type: 'text', label: 'State', maxLength: 120 },
      { name: 'postCode', type: 'text', label: 'Postcode', maxLength: 12 },
      country,
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'partnerships' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },

  // --- Family 5: corporate / HR / service --------------------------------------------------------------------------------------
  {
    key: 'corporate-registration',
    name: 'Corporate registration',
    family: 'WP admin-post: corporate_registration (/corporate-registration/)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Corporate Registration',
    fields: [
      { name: 'orgName', type: 'text', label: 'Organisation', required: true, maxLength: 200 },
      { name: 'contactName', type: 'text', label: 'Contact name', required: true, maxLength: 160 },
      { name: 'position', type: 'text', label: 'Position', maxLength: 120 },
      email, phone,
      { name: 'address', type: 'text', label: 'Address', maxLength: 300 },
      { name: 'state', type: 'select', label: 'State', options: states },
      { name: 'staffCount', type: 'text', label: 'Number of staff', maxLength: 20 },
      { name: 'trainingNeeds', type: 'textarea', label: 'Training needs', maxLength: 2000 },
    ],
    destinations: [
      { adapter: 'email', config: { recipientGroup: 'student-support' } },
      { adapter: 'email', config: { recipientGroup: 'marketing' } },
      { adapter: 'email', config: { recipientGroup: 'e-learning' } },
    ],
    thankYou: { type: 'inline', path: null },
    autoresponder: {
      enabled: true,
      subject: 'Your IHNA corporate registration',
      body: 'Hi,\n\nThank you for registering your organisation with the Institute of Health and Nursing Australia. Our team will contact you to set up training for your staff.' + SIGN_OFF,
    },
  },
  {
    key: 'jobs-eoi',
    name: 'Jobs expression of interest',
    family: 'WP admin-post: expression_of_interest (/expression-of-interest/)',
    active: true,
    consentText: 'We use your details to consider you for roles at IHNA. Your details are kept by our HR team only.',
    emailSubject: 'IHNA : Job Expression of Interest',
    fields: [
      fullName, email, { ...phone, label: 'Mobile' },
      { name: 'street', type: 'text', label: 'Street address', maxLength: 300 },
      { name: 'suburb', type: 'text', label: 'Suburb', maxLength: 120 },
      { name: 'state', type: 'select', label: 'State', options: states },
      { name: 'postCode', type: 'text', label: 'Postcode', maxLength: 12 },
      { name: 'roles', type: 'textarea', label: 'Roles you are interested in', maxLength: 1000 },
      // no file uploads (40 §10): the applicant shares a link to the CV instead
      { name: 'cvUrl', type: 'text', label: 'Link to your CV (we cannot accept file uploads here: share a Google Drive, OneDrive or Dropbox link, or email your CV after we contact you)', maxLength: 500, pattern: LINK_PATTERN },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'hr' } }],
    thankYou: { type: 'path', path: '/expression-of-interest-thanks/' },
  },
  {
    key: 'library-enquiry',
    name: 'Library enquiry',
    family: 'WP GET: library_enquiry (template-library.php:299)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Library Enquiry',
    fields: [fullName, email, phoneOptional, { ...message, required: true }],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'library' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'quick-feedback',
    name: 'Quick feedback',
    family: 'WP admin-post: quick_feedback ([QuickFeedBackForm])',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Quick Feedback',
    fields: [
      firstName, email, phoneOptional,
      { name: 'rating', type: 'select', label: 'Rating', options: ['5', '4', '3', '2', '1'].map((value) => ({ value, label: `${value} / 5` })) },
      { ...message, label: 'Your feedback', required: true },
      // no file uploads (40 §10)
      { name: 'attachmentUrl', type: 'text', label: 'Link to a screenshot or file (optional; we cannot accept uploads here)', maxLength: 500, pattern: LINK_PATTERN },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'feedback' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },

  // --- Family 7: events (plugin mwt_events) ------------------------------------------------------------------------------------
  {
    key: 'event-registration',
    name: 'Event registration',
    family: 'Plugin mwt_events admin-post: events_enquiry (init.php:208-472)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Event Registration',
    campaignFallback: 'default',
    fields: [fullName, email, phone, course, { ...message, label: 'Comments' }, { name: 'eventId', type: 'hidden', label: 'Event', maxLength: 40 }],
    destinations: [
      { adapter: 'dynamics', config: { dynamicsSubject: 'Enquiry from Event Booking : IHNA' } },
      { adapter: 'email', config: { recipientGroup: 'events' } },
    ],
    thankYou: { type: 'path', path: '/thanks-events/' },
    autoresponder: {
      enabled: true,
      subject: 'You are registered for an IHNA event',
      body: 'Hi {{firstName}},\n\nThank you for registering for an IHNA event. We will email you the event details and joining instructions before the day. You can add the event to your calendar from the event page on ihna.edu.au.' + SIGN_OFF,
    },
  },

  // --- WhatsApp chat gate (header) -----------------------------------------------------------------------------------------------
  {
    key: 'whatsapp',
    name: 'WhatsApp chat',
    family: 'Header chat gate: whatsapp_enquiry (header-bootstrap.php:106; no handler on the old site)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : WhatsApp Enquiry',
    campaignFallback: 'default',
    fields: [fullName, email, phone, campusAll, course],
    destinations: [{ adapter: 'hubspot' }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'whatsapp', path: '/thanks/' },
  },

  // --- RPL / credit transfer page (/rpl-and-credit-transfer/, a server-only PHP page on live; its handler is not in the repo) -----
  // Fields and course list from the live form (2026-10-21); destinations as the other course enquiry pages; attribution from the
  // campaign table code `rpl` (KH source 227, HubSpot "RPL Landing Page").
  {
    key: 'rpl-enquiry',
    name: 'RPL / credit transfer enquiry',
    family: 'Standalone: rpl-and-credit-transfer (posts to /rpl-and-credit-transfer/thanks)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : RPL / Credit Transfer Enquiry',
    campaignFallback: 'rpl',
    fields: [
      { name: 'rplOrCredit', type: 'radio', label: 'RPL / Credit transfer?', required: true, options: [{ value: 'rpl', label: 'RPL' }, { value: 'credit-transfer', label: 'Credit transfer' }] },
      {
        ...courseKhId,
        label: 'Which qualification would you like to opt for the RPL / credit transfer assessment?',
        options: crmCoursePickerOptions().filter((o) => RPL_KH_IDS.includes(Number(o.value))),
      },
      { name: 'experienceYears', type: 'select', label: 'How many years of relevant work experience do you have?', required: true, options: ['1 - 2 years', '3 - 4 years', '5 - 9 years', '10 and above years', 'N/A'].map((value) => ({ value })) },
      { name: 'experienceWhere', type: 'select', label: 'Where is your work experience?', required: true, options: ['Australia', 'Overseas', 'Both'].map((value) => ({ value })) },
      { ...campusAll, label: 'Which campus do you prefer?', required: true },
      fullName, email, phone,
    ],
    destinations: [{ adapter: 'hubspot' }, { adapter: 'portalCrm' }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/rpl-and-credit-transfer/thanks/' },
  },

  // --- Family 8: walk-in (QR form at campus receptions) --------------------------------------------------------------------------
  {
    key: 'walkin-enquiry',
    name: 'Walk-in enquiry',
    family: 'Standalone: walkin-enquiry/index.php (self-post)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Walk-in Enquiry',
    campaignFallback: 'lp_default',
    fields: [
      fullName, email, phone, courseKhId,
      { name: 'campus', type: 'select', label: 'Campus', required: true, options: [{ value: 'melbourne-heidelberg', label: 'Melbourne' }, { value: 'sydney-parramatta', label: 'Sydney' }, { value: 'perth-sgt', label: 'Perth' }, { value: 'brisbane', label: 'Brisbane' }] },
      message,
      // /walkin-registration/ (the newer copy of the walk-in page) asks this instead of a message
      { name: 'preferredContact', type: 'select', label: 'Preferred contact method', options: ['Phone Call', 'Email', 'Either is Fine'].map((value) => ({ value })) },
    ],
    destinations: [
      { adapter: 'email', config: { recipientGroup: 'enquiries' } },
      { adapter: 'hubspot', when: { not: SHORT } },
      { adapter: 'portalCrm', when: SHORT },
    ],
    thankYou: { type: 'inline', path: null },
    autoresponder: { enabled: false, variants: [SELF_ENROL] },
  },

  // --- Family 9-12: landing pages --------------------------------------------------------------------------------------------
  {
    key: 'lp-hubspot-note',
    name: 'Landing page enquiry (HubSpot + note)',
    family: 'study-at-ihna landing: Domestic LP - HubSpot contact + note',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [
      firstName, lastName, email, phone, campusAll,
      // Diploma of Nursing pages (each page shows its own subset, src/content/landing.ts `formFields`)
      { name: 'residentialStatus', type: 'select', label: 'Residential status', options: ['Australian citizen', 'Permanent resident', 'New Zealand citizen', 'Visa holder', 'Other'].map((value) => ({ value })) },
      { name: 'birthCountry', type: 'country', label: 'Country of birth' },
      { name: 'nmbaEnglishRequirement', type: 'select', label: 'Do you meet the NMBA English language requirement?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }] },
      { name: 'schoolingCompletedInAu', type: 'select', label: 'Did you complete your schooling in Australia?', options: yesNo },
      { name: 'educationCompleted', type: 'select', label: 'Highest education completed', options: ['Year 10', 'Year 11', 'Year 12', 'Certificate or diploma', 'Bachelor degree or higher'].map((value) => ({ value })) },
      { name: 'bestTimeContact', type: 'select', label: 'Best time to contact you', options: ['Morning', 'Afternoon', 'Evening'].map((value) => ({ value })) },
      { name: 'postalCode', type: 'text', label: 'Postcode', maxLength: 10, pattern: '^[0-9]{4}$' },
      // IHNA Expo page
      { name: 'primaryAreaOfInterest', type: 'select', label: 'Primary area of interest', options: ['Nursing', 'Aged care and disability', 'Health services and acute care', 'Pathology', 'Sterilisation', 'Early childhood', 'Community services', 'Other'].map((value) => ({ value })) },
      { name: 'advisorQuestions', type: 'textarea', label: 'Questions for our advisors', maxLength: 2000 },
      intent,
    ],
    destinations: [
      { adapter: 'hubspot', config: { hubspotNote: { fields: ['residentialStatus', 'birthCountry', 'nmbaEnglishRequirement', 'schoolingCompletedInAu', 'educationCompleted', 'bestTimeContact', 'postalCode', 'primaryAreaOfInterest', 'advisorQuestions'] } } },
      { adapter: 'email', config: { recipientGroup: 'enquiries' } },
    ],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'lp-hubspot',
    name: 'Landing page enquiry (HubSpot)',
    family: 'study-at-ihna landing: Domestic LP - HubSpot only',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [firstName, lastName, email, phone, campusAll, intent],
    destinations: [{ adapter: 'hubspot' }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'lp-dynamics',
    name: 'Landing page enquiry (Dynamics)',
    family: 'Landing - Dynamics + email (flinders-pathways, diploma-nursing-int.php, healthcare-courses-adelaide)',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [
      firstName, lastName, email, phone,
      { ...courseKhId, required: false, options: [...crmCoursePickerOptions(), { value: '67', label: 'CHC33015 - Certificate III in Individual Support (Ageing, Disability)' }] },
      campusAll, country, message,
      // international nursing eligibility (diploma-nursing-int.php)
      { name: 'sixYearsEducation', type: 'checkbox', label: 'I have completed at least 6 years of education in English' },
      { name: 'twoYearsGrades', type: 'checkbox', label: 'Two of those years were in grades 7 to 12' },
      { name: 'ieltsScore7', type: 'checkbox', label: 'I have an IELTS score of 7 (or equivalent)' },
    ],
    destinations: [
      { adapter: 'dynamics', config: { dynamicsSubject: 'Enquiry from Landing page' } },
      { adapter: 'portalCrm', when: { landingIn: ['/healthcare-courses-adelaide/'] } },
      { adapter: 'email', config: { recipientGroup: 'enquiries' } },
    ],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'lp-kh-int',
    name: 'International landing enquiry (KH portal)',
    family: 'KH-portal-only: international (-int) pages',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [
      firstName, email, phoneCode, phone, { ...country, required: true },
      { name: 'campus', type: 'select', label: 'Campus', options: campusOptions('melbourne-heidelberg', 'sydney-parramatta') },
    ],
    destinations: [{ adapter: 'portalCrm', config: { studentType: 'international' } }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'lp-ihna-online',
    name: 'Landing page enquiry (IHNA Online)',
    family: 'study-at-ihna landing: IHNA Online lead webhook pages',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [firstName, lastName, email, phone, { name: 'campus', type: 'select', label: 'Campus', options: campusOptions('melbourne-cbd', 'perth-sgt', 'sydney-parramatta', 'brisbane') }, intent],
    destinations: [{ adapter: 'ihnaOnline' }, { adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'lp-course-enquiry',
    name: 'Course enquiry page',
    family: 'Generic multi-course enquiry pages (course-enquiry-ihna, domestic/course-enquiry, tollfree, Ballarat; self-post)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Course Enquiry',
    campaignFallback: 'lp_default',
    fields: [
      fullName, email, phoneCode, phone, courseKhId,
      { name: 'campus', type: 'select', label: 'Campus', options: campusOptions('melbourne-heidelberg', 'melbourne-cbd', 'sydney-parramatta', 'perth-sgt', 'brisbane', 'cochin') },
      country, message,
      { name: 'callbackDatetime', type: 'text', label: 'Best time to call you back', maxLength: 80 },
      // staff data-entry page (domestic/course-enquiry): the lead's source, one of the campaign table codes (41)
      { name: 'campaignCode', type: 'select', label: 'Lead source', options: campaignCodes.map((c) => ({ value: c.code, label: c.hsCampaignSource || c.leadSrc || c.code })) },
    ],
    destinations: [
      { adapter: 'hubspot' },
      { adapter: 'portalCrm' },
      { adapter: 'email', config: { recipientGroup: 'enquiries' } },
      { adapter: 'email', config: { recipientGroup: 'regional' }, when: { landingIn: ['/healthcare-courses-ballarat/contact.php', '/healthcare-courses-ballarat/contact1.php', '/healthcare-courses-ballarat/courses1.php', '/healthcare-courses-ballarat/courses2.php'] } },
    ],
    thankYou: { type: 'inline', path: null },
  },
  {
    key: 'lp-mail-only',
    name: 'Landing page enquiry (email only)',
    family: 'Mail-only campaign pages',
    active: true,
    consentText: CONSENT,
    emailSubject: LANDING_SUBJECT,
    campaignFallback: 'lp_default',
    fields: [fullName, email, phone, message],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'enquiries' } }],
    thankYou: { type: 'path', path: '/thanks/' },
  },
  {
    key: 'event-lp',
    name: 'Event landing registration',
    family: 'Standalone lp/ihna-enterpreneurship-program (thanks.php)',
    active: true,
    consentText: CONSENT,
    emailSubject: 'IHNA : Event Registration (landing page)',
    campaignFallback: 'lp_default',
    fields: [
      fullName, email, phoneCode, phone,
      { name: 'job', type: 'text', label: 'Current role', maxLength: 160 },
      message,
      { name: 'event', type: 'select', label: 'Session', options: ['1', '2', '3', '4'].map((value) => ({ value, label: `Session ${value}` })) },
    ],
    destinations: [{ adapter: 'email', config: { recipientGroup: 'events' } }],
    thankYou: { type: 'path', path: '/thanks/' },
    autoresponder: {
      enabled: true,
      subject: 'Your IHNA event registration',
      body: 'Hi {{firstName}},\n\nThank you for registering. We will email you the session details and a calendar invitation before the event.' + SIGN_OFF,
    },
  },
]

/** Notification subjects by form key for forms without their own `emailSubject` (shared email adapter). IHNA: every form has one. */
export const emailSubjects: Record<string, string> = {}

export const formByKey = (key: string): FormDef | null => forms.find((f) => f.key === key) ?? null
