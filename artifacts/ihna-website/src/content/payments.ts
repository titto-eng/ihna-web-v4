// Site settings of the payment pipeline (45-payments §9). Site-specific: ihm-web keeps its own copy with its own values.
// Plain data, read by src/lib/payments/** and the payment templates so the shared pipeline needs no site checks.
import { site } from './site'

export const paymentSite = {
  /** The pay form (DEC-11). The chooser, the result page and every "pay" link use it. */
  payPath: site.payPath,
  /**
   * PayWay `provider` hidden field sent with our own payments: 2 = IHM, 3 = HCLA, absent = IHNA (portal callbacks pick the portal by it).
   * The old IHNA theme sent none (functions.php:1633-1650). `PAYWAY_PROVIDER` in the environment overrides it.
   */
  paywayProvider: null as number | null,
  /** PayWay `type` values whose paid callback is the portal's autoEnrolIhnaOnline (template-payway-response.php:299). */
  autoEnrolTypes: ['autoenrol', 'ihnaonline'] as readonly string[],
  /** PayWay `type=skilldemy` payments notify the Skilldemy portal and send the browser back to Skilldemy (template-payway-response.php:324, :1182). */
  skilldemy: true,
  /** External options on the chooser (footer.php:3488-3494). */
  converaUrl: 'https://students.convera.com/ihna#!/',
  flywireUrl: 'https://ihna.flywire.com',
  /** "Payment for" suggestions on the invoice form (template-pay-online.php:237-247). */
  paymentFor: ['IRON Program', 'Certificate Program', 'Diploma Program', 'Other Courses', 'Other Services'] as readonly string[],
  /** Mail subject tag for finance notices. */
  mailTag: `[${site.shortName} payments]`,
} as const
