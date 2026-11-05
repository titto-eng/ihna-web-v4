# 41 · Campaigns (attribution codes)

## 1. Purpose
A campaign is a code carried by the visitor (`?campaign=`, a campaign-suffix URL, the attribution cookie, a promo-code field) or fixed by the page. A well-formed code is stored as received on the enquiry (`campaignCode`) and shown to staff. The code also decides attribution in the destinations: the KH portal `enquirySourceId`, the HubSpot `campaign_source`, the Dynamics campaign bind and `new_campaign`, and the staff email's lead source. These come from the campaign table `src/content/campaign-codes.ts` (DEC-101); a code never changes recipients. UTM and click ids are stored alongside.

## 2. Data model
- **Code format:** `^[A-Za-z0-9_-]{2,64}$` (`CODE_PATTERN` in `src/lib/enquiries/request.ts`), case-sensitive. Anything else is ignored: never stored, never reflected.
- **Campaign table** (`src/content/campaign-codes.ts`, `CampaignCode[]`, read with `campaignByCode`): 57 codes from the old `campaign_codes.php`, edited by hand. Each row: `code`, `line` (source line), `leadSrc` (Dynamics `new_campaign`, email "Lead source"), `leadDesc` (email "Lead description"), `enquirySourceId` (KH; null on the 22 partial codes), `dynamicsCampaignId` (Dynamics campaign record GUID, an identifier; null on the partial codes), `hsCampaignSource` (an empty string counts as unset). 35 codes are full. The fallback rows are `lp_default` (KH 597, "IHNA Landing Pages"), `default` (KH 2, "IHNA Website"), `blog` (KH 483) and `rpl` (KH 227). The old file defines `gadbrislocaliq` twice; the later one (line 327) is the row.
- **On `enquiries`** (40 §2): `campaignCode` (indexed, the raw code), the `utm` group (`utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `referrer`, `landingPath`) and `hutk`. The attribution itself is derived at delivery from the stored code, the form and the landing row and shows in each delivery's recorded request.
- **Landing row from `pageUrl`:** the landing row is found from the stored `pageUrl`, which the browser sends, and applies only when its `formKey` is the posted form (40 §2). A visitor who posts a landing form with the URL of another landing page of the same form gets that page's fallback, fixed code, hard-coded HubSpot source and `landingIn` destinations (at most an extra internal mail or KH lead, never a recipient outside the form's groups). No recipient address or credential depends on it.
- **Form and page settings** (code): per form `campaignFallback` (`default` on the WordPress-family course forms, `lp_default` on landing and walk-in forms, `blog`, `rpl`) and, per destination, `fixedSourceId`, `defaultSourceId`, `hubspotCampaignSourceDefault`, `hubspotCampaignSourceFixed` (`src/content/forms.ts`; IHNA sets only `hubspotCampaignSourceFixed`, on `course-brochure` and `alumni-story`); per landing row `campaignFallback` (`lp_default`), `fixedCampaign` (`tollfree` on `/study-at-ihna/tollfree/`) and `hubspotCampaignSource` (the source an old page hard-coded: "IHNA Online Google Ad" on 4 domestic pages, "IHNA Expo June 2026 FB DM" on `IHNA-Expo/`) (`src/content/landing.ts`); site default `defaultSourceId: 2` (`src/content/enquiry-routing.ts`) and HubSpot default "IHNA Website" (`src/content/hubspot-map.ts`).

## 3. Admin capabilities
No campaign records in the CMS. Marketing finds enquiries by code with the `enquiries` list search or a `campaignCode` filter (40 §3). A new code is a row added to `src/content/campaign-codes.ts` and a deploy (DEC-101); an unknown well-formed code still works in an ad link and is stored raw (attributed to the page's or form's fallback row, DEC-43). The staff data-entry page `/study-at-ihna/domestic/course-enquiry/` has a "Lead source" select (`campaignCode` field of `lp-course-enquiry`) whose options are the table's codes; `/study-at-ihna/tollfree/` always stores `tollfree`.

## 4. Front-end behaviour
**Cookies** (`site.attributionCookies` in `src/content/site.ts`): `ihna_attr` (last touch) and `ihna_attr_first` (first touch). Only `CampaignCookie` (`src/components/templates/landing/CampaignCookie.tsx`, rendered by the campaign-suffix routes `/lp/<slug>/<code>/` and `/study-at-ihna/diploma-nursing-int/<code>/`) writes `ihna_attr`: JSON with `campaign` set to the code, combined with any existing value, `Path=/`, 90 days, `SameSite=Lax`, `Secure` on https. Nothing writes `ihna_attr_first`; both are read if present.

**Client.** `EnquiryFormClient` sends `campaign`, `utm_*` and the click ids from the current URL first, then `ihna_attr`, then `ihna_attr_first`, plus `hutk` from the `hubspotutk` cookie, `referrer` and `landingPath`.

**Server** (`src/lib/enquiries/campaign.ts`):
- Code (`resolveCampaign`, at insert), first well-formed value: the landing row's `fixedCampaign`, the form's `promoCode` field, a `campaignCode` select field, body `campaign`, `ihna_attr.campaign`, `ihna_attr_first.campaign`.
- Attribution (`campaignAttribution(code, form, landing)`, at delivery): `row` = the code's table row, `fallback` = the row of the landing row's `campaignFallback`, else the form's. Null when neither exists (e.g. `alumni-story`, which has no fallback).
- KH `enquirySourceId` (`resolveSourceId`), first match: the destination's `fixedSourceId`, the code row's source, the destination's `defaultSourceId`, the fallback row's source, the site default (2) (DEC-41).
- HubSpot `campaign_source` (`hubspotCampaignSource`): the destination's `hubspotCampaignSourceFixed`, the landing row's `hubspotCampaignSource`, the code row's source, the destination's default, the fallback row's source, "IHNA Website". `hsSourceFallback` is true when a default decided.
- Dynamics: `campaignid@odata.bind` = the code row's GUID, else the fallback row's, else the `default` row's (`dynamicsCampaignId`); `new_campaign` = the code row's `leadSrc`, else the fallback's.
- Staff email: "Lead source" / "Lead description" from the same rows (`leadSource`, `leadDescription`).
- UTM and click ids: body values over the `ihna_attr` cookie values.

## 5. URLs
No routes of its own. Campaign-suffix URLs are served by 60: `/lp/<slug>/<code>/` and `/study-at-ihna/diploma-nursing-int/<code>/` (canonical to the base page, noindex; a malformed segment 404s). Landing canonicals carry no query string. The landing thank-you keeps `?campaign=<code>`; `quick-enquiry` sends it as `campaign_id` on `/quick-enquiry-thanks/`.

## 6. Integrations
- **KH portal CRM:** `enquirySourceId` as above, `campaignId=1`; the code itself is not sent.
- **HubSpot:** `campaign_source` as above.
- **Dynamics:** campaign bind and `new_campaign` as above.
- **IHNA Online:** `utm_source` (else the HubSpot source), `utm_campaign` (else the code), `campaign_name` (the code).
- **Staff email:** "Campaign code", "Lead source", "Lead description" plus the UTM, gclid and fbclid rows.

## 7. Import / seed
None at run time. `src/content/campaign-codes.ts` holds the 57 rows of `../ihna-web-2.0/campaign_codes.php` (every campaign id a GUID, no credential) and is edited by hand; `line` points at the source line for review.

## 8. Acceptance checks
Automated (`npm run test:int`):
1. `tests/enquiries/campaign-codes.test.ts`: 57 unique codes with `lp_default` and `default`; 35 full and 22 partial; GUID format; no credential-looking value; case-sensitive codes; the later `gadbrislocaliq`; attribution for KH source, HubSpot source, Dynamics GUID and lead source with a full, a partial, an unknown and no code; a fixed source beats the code, the landing row's fixed code beats the visitor's; a site without a table gets no attribution.
2. `tests/enquiries/enquire.test.ts` ("campaign resolution", "source id"; ihm-web fixture forms with an empty table): body code beats the cookie; an unknown well-formed code is stored raw; a malformed one is ignored; codes are case-sensitive; `promoCode` is stored as the code; a fixed source beats the default.
3. `tests/enquiries/ihna-adapters.test.ts`: HubSpot uses the code's source; Dynamics binds the code's GUID and sends `new_campaign`.
4. `tests/enquiries/thankyou-ratelimit.test.ts` and `tests/enquiries/ihna-forms.test.ts`: the landing thank-you keeps `?campaign=` (and adds `intent=brochure` for a brochure request).

Manual against the dev server (`http://localhost:3001`, `DRY_RUN=1`):
5. A submission from `/study-at-ihna/domestic/diploma-nursing-melbourne/?campaign=gaperth` stores `campaignCode=gaperth` and records HubSpot `campaign_source` "Google Ad Perth"; an unknown code (`zzunknown`) is stored raw and records "IHNA Landing Pages"; a submission from `/study-at-ihna/tollfree/` stores `tollfree`, HubSpot "Reception Toll Free Number" and KH source 597. Read the rows with `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -c "select public_id, form_key, campaign_code, status from enquiries order by created_at desc limit 5"` and their deliveries' `dryRunRequest` in `/admin/collections/enquiries`.
6. `/study-at-ihna/diploma-nursing-int/gamelb/` sets `ihna_attr` to `{"campaign":"gamelb"}`; a form submitted afterwards on any page stores `campaignCode=gamelb` unless its URL carries another code or the page fixes one.

## 9. Differences from ihm-web
- IHNA has a campaign table (DEC-101): 57 codes give each destination its source values. ihm-web has no `src/content/campaign-codes.ts`; it stores the raw code only, and its KH source and HubSpot source come from the form definition and the site default 24.
- IHNA forms and landing rows carry `campaignFallback`, `fixedCampaign` and `hubspotCampaignSource`; ihm-web's do not.
- The cookie names come from `site.attributionCookies` (`ihna_attr`, `ihna_attr_first`); ihm-web's code names `ihm_attr` / `ihm_attr_first` directly.
- Dynamics campaign binds exist only on IHNA (Dynamics is off on ihm-web, DEC-12).

## 10. Open questions
1. Several landing pages hard-code a HubSpot source that wins over the visitor's code (as the old pages do). Should the code win instead?
2. Should UTMs and click ids persist across pages (a cookie writer for the UTM keys of `ihna_attr`, and anything writing `ihna_attr_first`)? They reach the enquiry only when the form is on the page whose URL carries them.
3. Cookie consent: is the 90-day `ihna_attr` cookie acceptable without a consent banner (90-security)?
4. 22 codes have no KH source and no Dynamics GUID and fall back to the landing or default row: should the CRM owner create campaigns for them?
