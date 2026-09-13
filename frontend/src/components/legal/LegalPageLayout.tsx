import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { FadeIn } from '@/components/ui/Accordion'
import { Seo } from '@/components/seo/Seo'

interface LegalSection {
  title: string
  body: string
}

interface LegalPageLayoutProps {
  legalKey: 'privacy' | 'terms' | 'refund'
  path: '/privacy' | '/terms' | '/refund-policy'
}

export const LegalPageLayout = ({ legalKey, path }: LegalPageLayoutProps) => {
  const { t } = useTranslation()
  const sections = t(`legal.${legalKey}.sections`, { returnObjects: true }) as LegalSection[]

  return (
    <PageLayout>
      <Seo
        title={t(`seo.${legalKey}.title`)}
        description={t(`seo.${legalKey}.description`)}
        keywords={t(`seo.${legalKey}.keywords`)}
        path={path}
      />

      <section className="section-padding pb-0">
        <div className="container">
          <FadeIn>
            <Link to="/" className="text-highlight fw-semibold icon-link text-decoration-none mb-4 d-inline-flex">
              <ArrowLeft size={16} /> {t('legal.backHome')}
            </Link>
            <h1 className="display-5 fw-bold mb-2">
              {t(`legal.${legalKey}.heroTitle`)}{' '}
              <span className="text-highlight">{t(`legal.${legalKey}.heroHighlight`)}</span>
            </h1>
            <p className="text-muted small mb-5">{t('legal.lastUpdated')}</p>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <FadeIn>
                <p className="lead text-muted mb-5">{t(`legal.${legalKey}.intro`)}</p>
              </FadeIn>
              {sections.map((section, i) => (
                <FadeIn key={section.title} delay={i * 0.05}>
                  <div className="mb-4">
                    <h2 className="h4 fw-bold mb-2">{section.title}</h2>
                    <p className="text-muted">{section.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
