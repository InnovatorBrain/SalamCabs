import { SITE_NAME, SITE_URL, SITE_DEFAULT_OG_IMAGE } from '@/config/site'
import { CONTACT_PHONE_TEL, WHATSAPP_LINK } from '@/config/contact'

// Schema.org structured data so search engines can surface Salam Cab as a
// recognized local transport business (rich results, knowledge panel, etc.)
export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: SITE_NAME,
  image: SITE_DEFAULT_OG_IMAGE,
  url: SITE_URL,
  telephone: CONTACT_PHONE_TEL,
  priceRange: 'SAR',
  areaServed: [
    { '@type': 'City', name: 'Makkah' },
    { '@type': 'City', name: 'Madinah' },
    { '@type': 'City', name: 'Jeddah' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SA',
    addressRegion: 'Makkah Province',
  },
  sameAs: [WHATSAPP_LINK],
  description:
    'Salam Cab provides licensed private taxi and transfer services for Umrah and Hajj pilgrims across Makkah, Madinah, and Jeddah, including Jeddah airport transfers.',
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_DEFAULT_OG_IMAGE,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: CONTACT_PHONE_TEL,
    contactType: 'customer service',
    areaServed: 'SA',
    availableLanguage: ['en', 'ar'],
  },
}
