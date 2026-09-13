import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Shield, Clock, Gem, Handshake, CheckCircle2, Target, Eye, Star } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Accordion, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Accordion'
import { Seo } from '@/components/seo/Seo'

const HERO_IMG =
  'https://images.unsplash.com/photo-1566013442229-facd4fe4b5c0?w=1920&q=80'
const ABOUT_IMG = '/images/about-taxi.jpg'
const SUV_IMG =
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80'

const DRIVER_IMGS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
]

export default function AboutPage() {
  const { t } = useTranslation()

  const whoFeatures = ['fleet', 'drivers', 'support', 'booking'] as const
  const drivers = ['d1', 'd2', 'd3', 'd4'] as const
  const pillars = ['safety', 'reliability', 'transparency', 'hospitality'] as const
  const pillarIcons = [Shield, Clock, Gem, Handshake]
  const benefits = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'] as const

  const stats = [
    { value: t('about.stats.journeys'), label: t('about.stats.journeysLabel') },
    { value: t('about.stats.satisfaction'), label: t('about.stats.satisfactionLabel') },
    { value: t('about.stats.rating'), label: t('about.stats.ratingLabel') },
    { value: t('about.stats.years'), label: t('about.stats.yearsLabel') },
    { value: t('about.stats.fleet'), label: t('about.stats.fleetLabel') },
  ]

  const faqItems = [
    { id: 'q1', question: t('home.faqs.q1'), answer: t('home.faqs.a1') },
    { id: 'q2', question: t('home.faqs.q2'), answer: t('home.faqs.a2') },
    { id: 'q3', question: t('home.faqs.q3'), answer: t('home.faqs.a3') },
  ]

  const testimonials = ['t1', 't2', 't3'] as const

  return (
    <PageLayout>
      <Seo
        title={t('seo.about.title')}
        description={t('seo.about.description')}
        keywords={t('seo.about.keywords')}
        path="/about"
      />
      <section
        className="hero-section-sm hero-overlay"
        style={{ backgroundImage: `url(${HERO_IMG})`, marginTop: 0 }}
      >
        <div className="container">
          <FadeIn>
            <h1 className="display-5 fw-bold">
              {t('about.heroTitle')}{' '}
              <span className="text-highlight">{t('about.heroHighlight')}</span>{' '}
              {t('about.heroSince')}
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <FadeIn>
            <p className="section-label">{t('about.whoLabel')}</p>
            <h2 className="section-title mb-5">{t('about.whoTitle')}</h2>
          </FadeIn>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <FadeIn>
                <div className="about-image-wrap">
                  <img
                    src={ABOUT_IMG}
                    alt={t('about.whoImageAlt')}
                    className="rounded-4 w-100"
                    loading="lazy"
                    style={{ maxHeight: 480, objectFit: 'cover' }}
                  />
                  <div className="badge-exp">{t('about.expBadge')}</div>
                </div>
              </FadeIn>
            </div>
            <div className="col-lg-6">
              <FadeIn delay={0.1}>
                <p className="text-muted">{t('about.whoText1')}</p>
                <p className="text-muted mb-4">{t('about.whoText2')}</p>
                <ul className="check-list">
                  {whoFeatures.map((f) => (
                    <li key={f}>
                      <span className="check-icon">
                        <CheckCircle2 size={18} />
                      </span>
                      {t(`about.whoFeatures.${f}`)}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <FadeIn>
                <div className="mission-card">
                  <div className="service-icon mb-3">
                    <Target size={24} strokeWidth={1.75} />
                  </div>
                  <h4 className="text-white">{t('about.mission')}</h4>
                  <p className="opacity-75 mb-0">{t('about.missionText')}</p>
                </div>
              </FadeIn>
            </div>
            <div className="col-md-6">
              <FadeIn delay={0.1}>
                <div className="mission-card">
                  <div className="service-icon mb-3">
                    <Eye size={24} strokeWidth={1.75} />
                  </div>
                  <h4 className="text-white">{t('about.vision')}</h4>
                  <p className="opacity-75 mb-0">{t('about.visionText')}</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container text-center">
          <FadeIn>
            <p className="section-label">{t('about.teamLabel')}</p>
            <h2 className="section-title">{t('about.teamTitle')}</h2>
            <p className="text-muted mb-5">{t('about.teamSubtitle')}</p>
          </FadeIn>
          <div className="row g-4">
            {drivers.map((d, i) => (
              <div key={d} className="col-6 col-md-3">
                <FadeIn delay={i * 0.08}>
                  <div className="driver-card">
                    <img src={DRIVER_IMGS[i]} alt="" loading="lazy" />
                    <div className="fw-semibold">{t(`about.drivers.${d}.name`)}</div>
                    <div className="text-muted small">{t(`about.drivers.${d}.exp`)}</div>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark-section">
        <div className="container">
          <FadeIn>
            <h2 className="section-title text-white text-center mb-5">
              {t('about.pillarsTitle')}
            </h2>
          </FadeIn>
          <StaggerContainer className="row g-4">
            {pillars.map((p, i) => {
              const PillarIcon = pillarIcons[i]
              return (
                <StaggerItem key={p} className="col-md-6 col-lg-3">
                  <div className="pillar-card">
                    <div className="pillar-icon mb-3">
                      <PillarIcon size={28} strokeWidth={1.75} />
                    </div>
                    <h5 className="text-white">{t(`about.pillars.${p}.title`)}</h5>
                    <p className="small opacity-75 mb-0">{t(`about.pillars.${p}.desc`)}</p>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <FadeIn>
            <h2 className="section-title mb-5">{t('about.benefitsTitle')}</h2>
          </FadeIn>
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="row g-3">
                {benefits.map((b, i) => (
                  <div key={b} className="col-md-6">
                    <FadeIn delay={i * 0.05}>
                      <div className="d-flex gap-2 align-items-start">
                        <span className="check-icon text-highlight">
                          <CheckCircle2 size={18} />
                        </span>
                        <span>{t(`about.benefits.${b}`)}</span>
                      </div>
                    </FadeIn>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <FadeIn delay={0.2}>
                <div className="yellow-frame">
                  <img src={SUV_IMG} alt="" className="w-100" loading="lazy" />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark-section py-4">
        <div className="container">
          <div className="row g-3">
            {stats.map((stat, i) => (
              <div key={i} className="col-6 col-md">
                <div className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-light-section">
        <div className="container">
          <FadeIn>
            <h2 className="section-title text-center mb-5">{t('about.testimonialsTitle')}</h2>
          </FadeIn>
          <div className="row g-4">
            {testimonials.map((key, i) => (
              <div key={key} className="col-md-4">
                <FadeIn delay={i * 0.1}>
                  <div className="testimonial-card">
                    <div className="text-highlight mb-2 d-flex gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star key={starIdx} size={16} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="small mb-3">{t(`home.testimonials.${key}.text`)}</p>
                    <div className="fw-semibold">{t(`home.testimonials.${key}.name`)}</div>
                    <div className="text-muted small">{t(`home.testimonials.${key}.location`)}</div>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <FadeIn>
            <h2 className="section-title text-center mb-5">{t('about.faqTitle')}</h2>
          </FadeIn>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <Accordion items={faqItems} defaultOpen="q1" />
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/booking" className="pill-btn-primary text-decoration-none">
              {t('nav.bookNow')}
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
