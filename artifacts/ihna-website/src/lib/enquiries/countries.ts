// ISO 3166 alpha-2 codes. Names come from Intl.DisplayNames so server and browser agree. The stored value is the English name
// (the portal CRM's `country` takes a name, 05 §3.1).
const CODES = ('AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW').split(' ')

let cache: string[] | null = null

/** Country names, sorted, Australia first (the main market). */
export function countryNames(): string[] {
  if (cache) return cache
  const dn = new Intl.DisplayNames(['en'], { type: 'region' })
  const names = CODES.map((c) => dn.of(c)).filter((n): n is string => Boolean(n))
  const sorted = [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en'))
  cache = ['Australia', ...sorted.filter((n) => n !== 'Australia')]
  return cache
}
