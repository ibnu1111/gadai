// Single source of truth for the business NAP (Name, Address, Phone) and hours.
// Local SEO depends on these being identical everywhere they appear: the visible
// footer, the homepage LocalBusiness JSON-LD, every service page's Service
// JSON-LD, and — externally — the Google Business Profile listing. Keep this file
// and the GBP listing in sync whenever either one changes.

export const BUSINESS = {
  name: 'Gadai Jogja',
  url: 'https://gadaijogja.com',
  telephone: '+6282299748978',
  phoneDisplay: '0822-9974-8978',
  whatsappNumber: '6282299748978',
  email: 'cs@gadaijogja.com',
  streetAddress: 'Jl. Kamboja, Jl. Mawar, Blotan No. 4, RT 01, Krajan, Wedomartani, Kec. Ngemplak',
  addressLocality: 'Sleman',
  addressRegion: 'Daerah Istimewa Yogyakarta',
  postalCode: '55584',
  opens: '06:00',
  closes: '20:00',
  areaServed: ['Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunung Kidul'],
}

export const ADDRESS_LINES = [
  BUSINESS.streetAddress,
  `${BUSINESS.addressLocality}, ${BUSINESS.addressRegion} ${BUSINESS.postalCode}`,
]

export const OPENING_HOURS_DISPLAY = `Setiap hari, ${BUSINESS.opens} - ${BUSINESS.closes} WIB`

export const addressSchema = {
  '@type': 'PostalAddress',
  streetAddress: BUSINESS.streetAddress,
  addressLocality: BUSINESS.addressLocality,
  addressRegion: BUSINESS.addressRegion,
  postalCode: BUSINESS.postalCode,
  addressCountry: 'ID',
}

export const openingHoursSchema = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: BUSINESS.opens,
  closes: BUSINESS.closes,
}

/** The business node reused as `provider` on each service page's Service schema. */
export const providerSchema = {
  '@type': 'FinancialService',
  name: BUSINESS.name,
  url: BUSINESS.url,
  telephone: BUSINESS.telephone,
  image: `${BUSINESS.url}/og-image.jpg`,
  priceRange: '$$',
  address: addressSchema,
  openingHoursSpecification: openingHoursSchema,
}

export function whatsappLink(text: string) {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`
}
