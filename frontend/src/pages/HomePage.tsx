import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Plane,
  Landmark,
  Moon,
  Building2,
  Users,
  Briefcase,
  Star,
  CheckCircle2,
  ArrowRight,
  Snowflake,
  Wifi,
  Navigation,
  UserRound,
  Check,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Accordion, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Accordion'
import { CountUp } from '@/components/ui/CountUp'
import { Seo } from '@/components/seo/Seo'
import { localBusinessJsonLd, organizationJsonLd } from '@/config/structuredData'
import {
  fetchRateCard,
  localizedLabel,
  startingPriceForVehicle,
  type RateCard,
} from '@/api/rateCard.api'

const HERO_IMG =
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80'
// Served locally from /public so it loads from our own origin/CDN instead of a
// third-party host — same clip used in the Vista Group Umrah transport hero.
const HERO_VIDEO = '/videos/hero-umrah.mp4'
const ABOUT_IMG = '/images/about-taxi.jpg'
const CAR_IMG =
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'
const VALUE_SUV_IMG = '/images/why-choose-suv.png'

const DESTINATIONS = [
  { key: 'makkah', img: '/images/destinations/makkah.jpg' },
  { key: 'madinah', img: '/images/destinations/madinah.jpg' },
  { key: 'jeddah', img: '/images/destinations/jeddah.jpg' },
  { key: 'ula', img: '/images/destinations/ula.jpg' },
]

const SERVICE_KEYS = ['airport', 'makkah', 'umrah', 'hotel', 'family', 'corporate'] as const
const SERVICE_ICONS = [Plane, Landmark, Moon, Building2, Users, Briefcase]

const FLEET_FEATURE_KEYS = ['ac', 'wifi', 'gps', 'driver'] as const
const FLEET_FEATURE_ICONS = [Snowflake, Wifi, Navigation, UserRound]

const emptyRateCard: RateCard = {
  vehicles: [],
  oneWayRoutes: [],
  roundTripPackages: [],
  surcharges: [],
}

const VALUE_KEYS = [
  'licensedDrivers',
  'support247',
  'fixedPricing',
  'modernFleet',
  'makkahSpecialists',
  'familiesGroups',
] as const

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language?.startsWith('ar')
  const [showVideo, setShowVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [activeFleet, setActiveFleet] = useState(0)

  const [rateCard, setRateCard] = useState<RateCard>(emptyRateCard)
  const [fleetLoading, setFleetLoading] = useState(true)
  const [fleetError, setFleetError] = useState('')

  useEffect(() => {
    let ignore = false
    const loadFleet = async () => {
      setFleetLoading(true)
      setFleetError('')
      try {
        const data = await fetchRateCard()
        if (!ignore) setRateCard(data)
      } catch {
        if (!ignore) setFleetError(t('home.fleet.loadError'))
      } finally {
        if (!ignore) setFleetLoading(false)
      }
    }
    loadFleet()
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fleetVehicles = rateCard.vehicles.filter((vehicle) => vehicle.isActive)
  const activeVehicle = fleetVehicles.length
    ? fleetVehicles[Math.min(activeFleet, fleetVehicles.length - 1)]
    : null

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
    const isSlowConnection =
      connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType ?? '')

    if (prefersReducedMotion || isSlowConnection) return

    // Defer video mounting until after the initial paint so it never blocks
    // first contentful paint / LCP, which is served instantly by the poster image.
    const timer = window.setTimeout(() => setShowVideo(true), 150)
    return () => window.clearTimeout(timer)
  }, [])

  const stats = [
    { value: t('home.stats.customers'), label: t('home.stats.customersLabel') },
    { value: t('home.stats.reliability'), label: t('home.stats.reliabilityLabel') },
    { value: t('home.stats.rated'), label: t('home.stats.ratedLabel') },
    { value: t('home.stats.years'), label: t('home.stats.yearsLabel') },
    { value: t('home.stats.cars'), label: t('home.stats.carsLabel') },
  ]

  const features = [
    t('home.features.fast'),
    t('home.features.drivers'),
    t('home.features.support'),
    t('home.features.booking'),
    t('home.features.fleet'),
    t('home.features.prices'),
  ]

  const faqItems = [
    { id: 'q1', question: t('home.faqs.q1'), answer: t('home.faqs.a1') },
    { id: 'q2', question: t('home.faqs.q2'), answer: t('home.faqs.a2') },
    { id: 'q3', question: t('home.faqs.q3'), answer: t('home.faqs.a3') },
    { id: 'q4', question: t('home.faqs.q4'), answer: t('home.faqs.a4') },
  ]

  const testimonials = ['t1', 't2', 't3'] as const

  return (
    <PageLayout navbarVariant="dark">
      <Seo
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.home.keywords')}
        path="/"
        jsonLd={[localBusinessJsonLd, organizationJsonLd]}
      />
      <section
        className="hero-video-section"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        {showVideo && (
          <video
            className="hero-video-bg"
            style={{ opacity: videoReady ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_IMG}
            onCanPlay={() => setVideoReady(true)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
        <div className="hero-video-gradient" />
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <FadeIn>
                <h1 className="display-4 fw-bold mb-4">
                  {t('home.heroTitle')}{' '}
                  <span className="text-highlight">{t('home.heroHighlight1')}</span>{' '}
                  {t('home.heroTitleMid')}{' '}
                  <span className="text-highlight">{t('home.heroHighlight2')}</span>
                </h1>
                <p className="lead mb-4 opacity-75">{t('home.heroSubtitle')}</p>
                <div className="d-flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/booking" className="pill-btn-primary text-decoration-none">
                      {t('nav.bookNow')}
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/about" className="pill-btn-outline text-decoration-none">
                      {t('nav.learnMore')}
                    </Link>
                  </motion.div>
                </div>
              </FadeIn>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-end">
              <FadeIn delay={0.2}>
                <div
                  className="px-4 py-3 rounded-4"
                  style={{ background: 'rgba(255,193,7,0.9)', color: '#111' }}
                >
                  <div className="fw-bold fs-4 d-flex align-items-center gap-2">
                    <Star size={20} fill="currentColor" strokeWidth={0} />
                    {t('home.rating')}
                  </div>
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
                <FadeIn delay={i * 0.05}>
                  <div className="stat-item">
                    <CountUp value={stat.value} className="stat-value" />
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <FadeIn>
                <div className="about-image-wrap">
                  <img
                    src={ABOUT_IMG}
                    alt={t('home.aboutImageAlt')}
                    className="rounded-4 w-100"
                    loading="lazy"
                    style={{ maxHeight: 480, objectFit: 'cover' }}
                  />
                  <img
                    src={CAR_IMG}
                    alt={t('home.fleetImageAlt')}
                    className="position-absolute rounded-3 d-none d-md-block"
                    loading="lazy"
                    style={{ width: 180, bottom: -20, insetInlineEnd: -20, border: '4px solid #fff' }}
                  />
                </div>
              </FadeIn>
            </div>
            <div className="col-lg-6">
              <FadeIn delay={0.1}>
                <p className="section-label">{t('home.aboutLabel')}</p>
                <h2 className="section-title">{t('home.aboutTitle')}</h2>
                <p className="text-muted mb-4">{t('home.aboutText')}</p>
                <ul className="check-list mb-4">
                  {features.map((f) => (
                    <li key={f}>
                      <span className="check-icon">
                        <CheckCircle2 size={18} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/about" className="pill-btn-primary text-decoration-none">
                  {t('nav.learnMore')}
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark-section" id="services">
        <div className="container">
          <FadeIn>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
              <div>
                <p className="section-label">{t('home.servicesLabel')}</p>
                <h2 className="section-title text-white mb-0">{t('home.servicesTitle')}</h2>
              </div>
              <Link to="/booking" className="text-highlight fw-semibold icon-link text-decoration-none">
                {t('home.seeAll')} <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
          <StaggerContainer className="row g-4">
            {SERVICE_KEYS.map((key, i) => {
              const ServiceIcon = SERVICE_ICONS[i]
              return (
                <StaggerItem key={key} className="col-md-6 col-lg-4">
                  <div className="service-card">
                    <div className="service-icon">
                      <ServiceIcon size={24} strokeWidth={1.75} />
                    </div>
                    <h5 className="text-white mb-2">
                      {t(`home.services.${key}.title`)}
                    </h5>
                    <p className="small opacity-75 mb-3">
                      {t(`home.services.${key}.desc`)}
                    </p>
                    <Link
                      to="/booking"
                      className="text-highlight small fw-semibold icon-link text-decoration-none"
                    >
                      {t('common.readMore')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding" id="how-it-works">
        <div className="container text-center">
          <FadeIn>
            <h2 className="section-title">{t('home.howTitle')}</h2>
          </FadeIn>
          <div className="row g-4 mt-2">
            {(['search', 'choose', 'book'] as const).map((step, i) => (
              <div key={step} className="col-md-4">
                <FadeIn delay={i * 0.1}>
                  <div className="how-step">
                    <div className="step-icon">{i + 1}</div>
                    <h5>{t(`home.howSteps.${step}.title`)}</h5>
                    <p className="text-muted small">{t(`home.howSteps.${step}.desc`)}</p>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <Link to="/booking" className="pill-btn-primary text-decoration-none mt-4">
              {t('home.bookYourRide')}
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-dark-section" id="fleet">
        <div className="container">
          <FadeIn>
            <div className="d-flex flex-wrap justify-content-between align-items-start mb-5 gap-3">
              <div>
                <p className="section-label">{t('home.fleet.label')}</p>
                <h2 className="section-title text-white mb-2">{t('home.fleet.title')}</h2>
                <p className="text-white-50 mb-0" style={{ maxWidth: 480 }}>
                  {t('home.fleet.subtitle')}
                </p>
              </div>
              <Link to="/booking" className="pill-btn-primary text-decoration-none">
                {t('home.fleet.viewAll')}
              </Link>
            </div>
          </FadeIn>

          {fleetLoading ? (
            <div className="rate-card-loading">
              <div className="rate-card-spinner mb-3" />
              <p className="text-white-50 mb-0">{t('home.fleet.loading')}</p>
            </div>
          ) : fleetError || !activeVehicle ? (
            <div className="rate-card-loading">
              <p className="text-white-50 mb-3">{fleetError || t('home.fleet.empty')}</p>
              <button
                type="button"
                className="pill-btn-primary"
                onClick={() => {
                  setFleetLoading(true)
                  fetchRateCard()
                    .then((data) => {
                      setRateCard(data)
                      setFleetError('')
                    })
                    .catch(() => setFleetError(t('home.fleet.loadError')))
                    .finally(() => setFleetLoading(false))
                }}
              >
                {t('home.fleet.retry')}
              </button>
            </div>
          ) : (
            <>
              <FadeIn key={activeVehicle.vehicleId}>
                <div className="fleet-card">
                  <div className="fleet-card-image">
                    <img
                      src={activeVehicle.image}
                      alt={localizedLabel(activeVehicle.name, activeVehicle.nameAr, !!isArabic)}
                      loading="lazy"
                    />
                    <span className="fleet-seats-badge">
                      {activeVehicle.pax} {t('booking.vehicleStep.seats')}
                    </span>
                  </div>
                  <div className="fleet-card-body">
                    {activeVehicle.category && (
                      <p className="section-label mb-1">
                        {localizedLabel(activeVehicle.category, activeVehicle.categoryAr, !!isArabic)}
                      </p>
                    )}
                    <h3 className="text-white mb-2">
                      {localizedLabel(activeVehicle.name, activeVehicle.nameAr, !!isArabic)}
                    </h3>
                    <div className="fleet-rating mb-3 d-flex align-items-center gap-2">
                      <Star size={16} className="text-highlight" fill="currentColor" strokeWidth={0} />
                      {(activeVehicle.rating ?? 4.8).toFixed(1)} {t('home.fleet.rating')}
                    </div>
                    {activeVehicle.description && (
                      <p className="text-white-50 mb-3">
                        {localizedLabel(activeVehicle.description, activeVehicle.descriptionAr, !!isArabic)}
                      </p>
                    )}
                    <div className="fleet-capacity-row mb-4">
                      <span className="fleet-capacity-chip">
                        <UserRound size={16} strokeWidth={1.9} />
                        {activeVehicle.pax} {t('booking.vehicleStep.seats')}
                      </span>
                      <span className="fleet-capacity-chip">
                        <Briefcase size={16} strokeWidth={1.9} />
                        {activeVehicle.luggage}
                      </span>
                    </div>
                    <div className="fleet-feature-grid mb-4">
                      {FLEET_FEATURE_KEYS.map((key, i) => {
                        const FeatureIcon = FLEET_FEATURE_ICONS[i]
                        return (
                          <div className="fleet-feature" key={key}>
                            <span className="fleet-feature-icon">
                              <FeatureIcon size={17} strokeWidth={1.9} />
                            </span>
                            {t(`home.fleet.features.${key}`)}
                          </div>
                        )
                      })}
                    </div>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                      {(() => {
                        const startingPrice = startingPriceForVehicle(
                          activeVehicle.vehicleId,
                          rateCard.oneWayRoutes,
                          rateCard.roundTripPackages,
                        )
                        return (
                          <div>
                            <p className="text-white-50 small text-uppercase mb-1">
                              {t('home.fleet.startingFrom')}
                            </p>
                            <p className="mb-0">
                              <span className="text-highlight fs-3 fw-bold">
                                {startingPrice !== null ? `SAR ${startingPrice}` : t('booking.vehicleStep.priceOnRequest')}
                              </span>{' '}
                              {startingPrice !== null && (
                                <span className="text-white-50 small">{t('home.fleet.perTrip')}</span>
                              )}
                            </p>
                          </div>
                        )
                      })()}
                      <Link to="/booking" className="pill-btn-primary text-decoration-none icon-link">
                        {t('home.fleet.bookVehicle')} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <div className="fleet-thumbs">
                {fleetVehicles.map((vehicle, i) => (
                  <motion.button
                    key={vehicle.vehicleId}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className={`fleet-thumb ${i === activeFleet ? 'active' : ''}`}
                    onClick={() => setActiveFleet(i)}
                    aria-label={localizedLabel(vehicle.name, vehicle.nameAr, !!isArabic)}
                    aria-pressed={i === activeFleet}
                  >
                    <img
                      src={vehicle.image}
                      alt={localizedLabel(vehicle.name, vehicle.nameAr, !!isArabic)}
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section-padding" id="value">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <FadeIn>
                <p className="section-label">{t('home.valueLabel')}</p>
                <h2 className="section-title mb-4">{t('home.valueTitle')}</h2>
              </FadeIn>
              <StaggerContainer className="row g-4">
                {VALUE_KEYS.map((key) => (
                  <StaggerItem key={key} className="col-sm-6">
                    <div className="value-item">
                      <div className="value-item-heading">
                        <span className="value-item-icon">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <h6 className="value-item-title">
                          {t(`home.valueItems.${key}.title`)}
                        </h6>
                      </div>
                      <p className="value-item-desc">
                        {t(`home.valueItems.${key}.desc`)}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
            <div className="col-lg-6">
              <div className="value-image-wrap">
                <motion.img
                  src={VALUE_SUV_IMG}
                  alt={t('home.valueTitle')}
                  className="value-image"
                  loading="lazy"
                  initial={{ opacity: 0, x: 120, scale: 0.92 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark-section" id="destinations">
        <div className="container">
          <FadeIn>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
              <h2 className="section-title text-white mb-0">{t('home.destinationsTitle')}</h2>
              <Link to="/booking" className="text-highlight fw-semibold icon-link text-decoration-none">
                {t('home.seeAllDestinations')} <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
          <div className="row g-4">
            {DESTINATIONS.map((dest, i) => (
              <div key={dest.key} className="col-md-6">
                <FadeIn delay={i * 0.08}>
                  <div className="destination-card">
                    <img
                      src={dest.img}
                      alt={t('home.destinationAlt', { place: t(`home.destinations.${dest.key}`) })}
                      loading="lazy"
                    />
                    <div className="destination-overlay">
                      <h4>{t(`home.destinations.${dest.key}`)}</h4>
                      <Link to="/booking" className="pill-btn-primary btn-sm mt-2 text-decoration-none">
                        {t('home.viewDetails')}
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-light-section" id="testimonials">
        <div className="container">
          <FadeIn>
            <h2 className="section-title text-center mb-5">{t('home.testimonialsTitle')}</h2>
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
            <h2 className="section-title text-center mb-2">{t('home.bookingSectionTitle')}</h2>
            <p className="text-center text-muted mb-5">
              <Link to="/booking" className="pill-btn-primary text-decoration-none">
                {t('nav.bookNow')}
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-light-section" id="faq">
        <div className="container">
          <FadeIn>
            <h2 className="section-title text-center mb-5">{t('home.faqTitle')}</h2>
          </FadeIn>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <Accordion items={faqItems} defaultOpen="q1" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
