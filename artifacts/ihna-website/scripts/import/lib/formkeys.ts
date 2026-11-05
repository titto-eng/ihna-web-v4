import { SITE } from './config'

// Old `admin-post.php?action=` → canonical formKey (40-enquiries §7, DEC-2). The extractor emits `enquiryForm` only for these.
// Sources: inventory/v2/<site>/enquiries.csv `handler_file`/`form_name`. Anything else (library search, external iframes) is not a site form.
const IHM_FORM_KEY_BY_ACTION: Record<string, string> = {
  quick_enquiry: 'quick-enquiry',
  brochure_download: 'course-brochure',
  course_brochure_download: 'course-brochure',
  lp_enquiry: 'lp-portal',
  whatsapp_enquiry: 'whatsapp',
  quick_enquiry_ihm_blog: 'blog-enquiry',
  quick_enquiry_ihm_popup: 'mon-popup',
  quick_enquiry_nclex_popup: 'nclex-magnet',
  quick_enquiry_admission_popup: 'admission-popup',
  quick_enquiry_ihm_ship: 'english-scholarship',
  sae_enquiry_ihm: 'sae-enquiry',
  sae_dwnld_brc_enquiry_ihm: 'sae-brochure',
  agent_registration: 'agent-registration',
  ihm_alumni_share_story: 'alumni-story',
  ihm_alumni_signup: 'alumni-signup',
  events_enquiry: 'event-registration',
  '/action_page.php': 'newsletter',
}

/** IHNA handlers (`mwt-ihna/functions.php` `admin_post_nopriv_*`), keys from the IHNA forms brief §5. They win over the IHM names. */
const IHNA_FORM_KEY_BY_ACTION: Record<string, string> = {
  quick_enquiry: 'quick-enquiry',
  brchHndbk_enquiry: 'course-brochure',
  lp_enquiry: 'lp-enquiry',
  online_learning_enquiry: 'online-learning',
  blog_enquiry: 'blog-enquiry',
  scholarship_submit: 'scholarship',
  alumni_story_submit: 'alumni-story',
  alumni_registration: 'alumni-signup',
  agent_registration: 'agent-registration',
  referral_application: 'referral-application',
  global_partner_application: 'global-partner',
  employee_eoi_application: 'employer-eoi',
  skilldemy_application: 'skilldemy-enquiry',
  corporate_registration: 'corporate-registration',
  expression_of_interest: 'jobs-eoi',
  lib_enquiry: 'library-enquiry',
  feed_enquiry: 'quick-feedback',
}

export const FORM_KEY_BY_ACTION: Record<string, string> = SITE === 'ihna' ? { ...IHM_FORM_KEY_BY_ACTION, ...IHNA_FORM_KEY_BY_ACTION } : IHM_FORM_KEY_BY_ACTION

/** `action` is the form's action attribute: a full admin-post URL (`…?action=quick_enquiry`), a bare path, or empty. */
export function formKeyForAction(action: string | undefined | null): string | null {
  if (!action) return null
  const a = action.trim()
  const q = a.match(/[?&]action=([\w-]+)/)
  if (q) return FORM_KEY_BY_ACTION[q[1]] ?? null
  try {
    const path = new URL(a, 'https://ihm.edu.au').pathname
    return FORM_KEY_BY_ACTION[path] ?? null
  } catch {
    return null
  }
}
