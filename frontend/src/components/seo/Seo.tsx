import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { SITE_NAME, SITE_URL, SITE_DEFAULT_OG_IMAGE } from '@/config/site'

interface SeoProps {
  title: string
  description: string
  keywords?: string
  path?: string
  image?: string
  noindex?: boolean
  /** One or more JSON-LD structured data objects to inject as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export const Seo = ({
  title,
  description,
  keywords,
  path = '/',
  image = SITE_DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const { i18n } = useTranslation()
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <html lang={i18n.language} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={i18n.language === 'ar' ? 'ar_SA' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
