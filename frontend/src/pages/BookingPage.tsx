import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Flag,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  User,
  Mail,
  Plane,
  Route,
  Landmark,
  Banknote,
  RotateCcw,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { FadeIn } from '@/components/ui/Accordion'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/utils/formatters'
import {
  fetchRateCard,
  getOneWayDestinations,
  findOneWayRoute,
  getDistinctOrigins,
  findRoundTripPackage,
  findVehicle,
  packageLabel,
  localizedLabel,
  type RateCard,
} from '@/api/rateCard.api'
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  findCountry,
  getExpectedDigits,
  isValidNationalNumber,
} from '@/data/countryCodes'
import { createBooking, type BookingPayload } from '@/api/booking.api'
import { WHATSAPP_LINK } from '@/config/contact'
import { Seo } from '@/components/seo/Seo'

const HERO_IMG =
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80'

type TripType = 'oneWay' | 'roundTrip' | 'byHour'
type WizardStep = 'trip' | 'vehicle' | 'details'
// Cash on arrival is currently the only supported payment method.
type PaymentMethod = 'cash'

const STEP_ORDER: WizardStep[] = ['trip', 'vehicle', 'details']

const fadeVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const emptyRateCard: RateCard = {
  vehicles: [],
  oneWayRoutes: [],
  roundTripPackages: [],
  surcharges: [],
}

export default function BookingPage() {
  const { t, i18n } = useTranslation()
  const { showToast } = useToast()
  const isArabic = i18n.language?.startsWith('ar')

  // --- Rate card (vehicles/routes/packages/surcharges), fetched from the DB -----
  const [rateCard, setRateCard] = useState<RateCard>(emptyRateCard)
  const [rateCardLoading, setRateCardLoading] = useState(true)
  const [rateCardError, setRateCardError] = useState('')

  useEffect(() => {
    let cancelled = false
    setRateCardLoading(true)
    fetchRateCard()
      .then((data) => {
        if (!cancelled) setRateCard(data)
      })
      .catch(() => {
        if (!cancelled) setRateCardError(t('booking.rateCardError'))
      })
      .finally(() => {
        if (!cancelled) setRateCardLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { vehicles, oneWayRoutes, roundTripPackages, surcharges } = rateCard

  // --- Wizard state -----------------------------------------------------------
  const [step, setStep] = useState<WizardStep>('trip')
  const [tripType, setTripType] = useState<TripType>('oneWay')
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [packageId, setPackageId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  // Keyed by Surcharge.key — generalizes the old single jeddahHajjPickup/
  // hajjDropoff booleans to however many surcharges the admin configures.
  const [surchargeChecks, setSurchargeChecks] = useState<Record<string, boolean>>({})
  const [tripErrors, setTripErrors] = useState<Record<string, string>>({})

  const [vehicleId, setVehicleId] = useState('')
  const [vehicleError, setVehicleError] = useState('')

  const [fullName, setFullName] = useState('')
  const [detailsCountryCode, setDetailsCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [contactPhone, setContactPhone] = useState('')
  const [email, setEmail] = useState('')
  const [flightNo, setFlightNo] = useState('')
  const paymentMethod: PaymentMethod = 'cash'
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({})

  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')

  useEffect(() => {
    setToId('')
  }, [fromId])

  useEffect(() => {
    setFromId('')
    setToId('')
    setPackageId('')
  }, [tripType])

  const destinations = useMemo(() => getOneWayDestinations(oneWayRoutes, fromId), [oneWayRoutes, fromId])
  const origins = useMemo(() => getDistinctOrigins(oneWayRoutes), [oneWayRoutes])
  const selectedOneWayRoute = useMemo(
    () => findOneWayRoute(oneWayRoutes, fromId, toId),
    [oneWayRoutes, fromId, toId],
  )
  const selectedPackage = useMemo(
    () => findRoundTripPackage(roundTripPackages, packageId),
    [roundTripPackages, packageId],
  )
  const selectedVehicle = useMemo(() => findVehicle(vehicles, vehicleId), [vehicles, vehicleId])

  // Surcharges applicable right now, given the current trip/vehicle selection.
  const pickupSurcharges = useMemo(
    () =>
      tripType === 'oneWay'
        ? surcharges.filter(
            (s) => s.triggerStage === 'pickup' && (!s.triggerMatchLabel || s.triggerMatchLabel === fromId),
          )
        : [],
    [surcharges, tripType, fromId],
  )
  const dropoffSurcharges = useMemo(
    () =>
      surcharges.filter(
        (s) =>
          s.triggerStage === 'dropoff' &&
          (s.appliesToVehicleIds.length === 0 || s.appliesToVehicleIds.includes(vehicleId)),
      ),
    [surcharges, vehicleId],
  )

  const basePrice = useMemo(() => {
    if (!vehicleId) return null
    if (tripType === 'roundTrip') return selectedPackage?.prices[vehicleId] ?? null
    if (tripType === 'oneWay') return selectedOneWayRoute?.prices[vehicleId] ?? null
    return null
  }, [tripType, vehicleId, selectedPackage, selectedOneWayRoute])

  const surcharge = useMemo(
    () =>
      [...pickupSurcharges, ...dropoffSurcharges].reduce(
        (sum, s) => sum + (surchargeChecks[s.key] ? s.amount : 0),
        0,
      ),
    [pickupSurcharges, dropoffSurcharges, surchargeChecks],
  )

  const totalPrice = basePrice !== null ? basePrice + surcharge : null

  const priceForVehicle = (id: string): number | null => {
    if (tripType === 'roundTrip') return selectedPackage?.prices[id] ?? null
    if (tripType === 'oneWay') return selectedOneWayRoute?.prices[id] ?? null
    return null
  }

  const tripTypeLabel =
    tripType === 'oneWay'
      ? t('booking.oneWay')
      : tripType === 'roundTrip'
        ? t('booking.roundTrip')
        : t('booking.byHour')

  const routeDisplay = useMemo(() => {
    if (tripType === 'oneWay') {
      if (selectedOneWayRoute) {
        const from = localizedLabel(selectedOneWayRoute.fromLabel, selectedOneWayRoute.fromLabelAr, isArabic)
        const to = localizedLabel(selectedOneWayRoute.toLabel, selectedOneWayRoute.toLabelAr, isArabic)
        return `${from} ${isArabic ? '←' : '→'} ${to}`
      }
      return t('common.notSet')
    }
    if (tripType === 'roundTrip') {
      return selectedPackage ? packageLabel(selectedPackage, isArabic) : t('common.notSet')
    }
    return t('common.notSet')
  }, [tripType, selectedOneWayRoute, selectedPackage, isArabic, t])

  // --- Trip step -----------------------------------------------------------
  const validateTrip = () => {
    const errors: Record<string, string> = {}
    if (tripType === 'oneWay') {
      if (!fromId) errors.from = t('validation.pickupRequired')
      if (!toId) errors.to = t('validation.dropoffRequired')
    } else if (tripType === 'roundTrip') {
      if (!packageId) errors.package = t('validation.packageRequired')
    }
    if (!date) errors.date = t('validation.dateRequired')
    if (!time) errors.time = t('validation.timeRequired')
    if (!passengers || passengers < 1) errors.passengers = t('validation.passengersRequired')
    setTripErrors(errors)
    const firstError = Object.values(errors)[0]
    if (firstError) showToast(firstError, 'error')
    return Object.keys(errors).length === 0
  }

  const handleContinueToVehicle = () => {
    if (validateTrip()) {
      setStep('vehicle')
      showToast(t('booking.tripSavedToast'), 'success')
    }
  }

  // --- Vehicle step ----------------------------------------------------------
  const handleContinueToDetails = () => {
    if (!vehicleId) {
      const message = t('validation.vehicleRequired')
      setVehicleError(message)
      showToast(message, 'error')
      return
    }
    setVehicleError('')
    setStep('details')
    showToast(t('booking.vehicleSavedToast'), 'success')
  }

  // --- Details step ----------------------------------------------------------
  const detailsDigitHint = t('booking.digitHint', {
    digits: getExpectedDigits(detailsCountryCode),
    country: findCountry(detailsCountryCode)?.name ?? '',
    code: detailsCountryCode,
  })

  const handleDetailsCountryChange = (code: string) => {
    setDetailsCountryCode(code)
    const country = findCountry(code)
    showToast(
      t('booking.digitHint', { digits: getExpectedDigits(code), country: country?.name ?? '', code }),
      'info',
    )
  }

  const validateDetails = () => {
    const errors: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) errors.fullName = t('validation.fullNameRequired')
    if (!isValidNationalNumber(contactPhone, detailsCountryCode)) errors.phone = detailsDigitHint
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = t('validation.emailInvalid')
    setDetailsErrors(errors)
    const firstError = Object.values(errors)[0]
    if (firstError) showToast(firstError, 'error')
    return Object.keys(errors).length === 0
  }

  const handleConfirmBooking = async () => {
    if (!validateDetails()) return
    setSubmitting(true)

    const bookingPayload: BookingPayload = {
      tripType,
      tripTypeLabel,
      route: routeDisplay,
      from: tripType === 'oneWay' ? fromId : undefined,
      to: tripType === 'oneWay' ? toId : undefined,
      roundTripPackage: tripType === 'roundTrip' ? packageId : undefined,
      date,
      time,
      passengers,
      specialRequests,
      // Preserves the original Booking schema's two known flags for backward
      // compatibility with the admin panel, derived from whichever surcharges
      // are currently checked and applicable.
      jeddahHajjPickup: pickupSurcharges.some((s) => s.key === 'jeddah-hajj-pickup' && surchargeChecks[s.key]),
      hajjDropoff: dropoffSurcharges.some((s) => s.key === 'hajj-dropoff' && surchargeChecks[s.key]),
      vehicle: vehicleId,
      vehicleName: selectedVehicle ? localizedLabel(selectedVehicle.name, selectedVehicle.nameAr, isArabic) : undefined,
      fullName,
      phone: `${detailsCountryCode}${contactPhone}`,
      email,
      flightNo,
      paymentMethod,
      basePrice,
      surcharge,
      totalPrice,
    }

    // eslint-disable-next-line no-console
    console.log('[Salam Cab] Submitting booking:', bookingPayload)

    try {
      const response = await createBooking(bookingPayload)
      // eslint-disable-next-line no-console
      console.log('[Salam Cab] Booking saved to database:', response.booking)
      setBookingId(response.bookingId)
      setShowSuccess(true)
      showToast(t('toast.bookingSuccess'), 'success')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Salam Cab] Booking submission failed:', error)
      showToast(t('toast.bookingError'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMakeAnotherBooking = () => {
    setShowSuccess(false)
    setStep('trip')
    setTripType('oneWay')
    setFromId('')
    setToId('')
    setPackageId('')
    setDate('')
    setTime('')
    setPassengers(1)
    setSpecialRequests('')
    setSurchargeChecks({})
    setVehicleId('')
    setFullName('')
    setContactPhone('')
    setDetailsCountryCode(DEFAULT_COUNTRY_CODE)
    setEmail('')
    setFlightNo('')
  }

  const trustItems = ['secure', 'support', 'noFees', 'cancel'] as const
  const currentStepIndex = STEP_ORDER.indexOf(step)

  return (
    <PageLayout>
      <Seo
        title={t('seo.booking.title')}
        description={t('seo.booking.description')}
        keywords={t('seo.booking.keywords')}
        path="/booking"
      />
      <section
        className="hero-section-sm hero-overlay"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        <div className="container">
          <FadeIn>
            <h1 className="display-5 fw-bold">
              {t('booking.heroTitle')}{' '}
              <span className="text-highlight">{t('booking.heroHighlight')}</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <FadeIn>
            <p className="text-center text-muted mb-4">{t('booking.subtitle')}</p>
          </FadeIn>

          <AnimatePresence mode="wait">
            {rateCardLoading ? (
              <motion.div
                key="rate-card-loading"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="rate-card-loading"
              >
                <span className="rate-card-spinner" aria-hidden="true" />
                <p className="text-muted mt-3">{t('booking.loadingRateCard')}</p>
              </motion.div>
            ) : rateCardError ? (
              <motion.div
                key="rate-card-error"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="rate-card-loading"
              >
                <p className="error-text">{rateCardError}</p>
                <button type="button" className="pill-btn-outline mt-3" onClick={() => window.location.reload()}>
                  {t('booking.retry')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="wizard"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35 }}
              >
                <div className="stepper mb-5">
                  {STEP_ORDER.map((s, i) => (
                    <span
                      key={s}
                      className={`stepper-item ${
                        i === currentStepIndex ? 'active' : i < currentStepIndex ? 'completed' : ''
                      }`}
                    >
                      {i + 1} {t(`booking.steps.${s === 'details' ? 'confirm' : s}`)}
                    </span>
                  ))}
                </div>

                <div className="row g-4">
                  <div className="col-lg-7 order-2 order-lg-1">
                    <div className="card-shadow p-4 p-lg-5 bg-white">
                      <AnimatePresence mode="wait">
                        {step === 'trip' && (
                          <motion.div
                            key="step-trip"
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                          >
                            <div className="trip-type-toggle mb-4">
                              <button
                                type="button"
                                className={tripType === 'oneWay' ? 'active' : ''}
                                onClick={() => setTripType('oneWay')}
                              >
                                {t('booking.oneWay')}
                              </button>
                              <button
                                type="button"
                                className={tripType === 'roundTrip' ? 'active' : ''}
                                onClick={() => setTripType('roundTrip')}
                              >
                                {t('booking.roundTrip')}
                              </button>
                              <button
                                type="button"
                                className={tripType === 'byHour' ? 'active' : ''}
                                onClick={() => setTripType('byHour')}
                              >
                                {t('booking.byHour')}
                              </button>
                            </div>

                            {tripType === 'oneWay' && (
                              <>
                                <div className="mb-3">
                                  <label className="form-label-sc" htmlFor="fromId">
                                    {t('booking.from')}
                                  </label>
                                  <div className="input-group-sc">
                                    <span className="input-icon">
                                      <MapPin size={18} strokeWidth={1.75} />
                                    </span>
                                    <select
                                      id="fromId"
                                      className={`form-control-sc ${tripErrors.from ? 'is-invalid' : ''}`}
                                      value={fromId}
                                      onChange={(e) => setFromId(e.target.value)}
                                    >
                                      <option value="">{t('booking.selectFrom')}</option>
                                      {origins.map((loc) => (
                                        <option key={loc.label} value={loc.label}>
                                          {localizedLabel(loc.label, loc.labelAr, isArabic)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {tripErrors.from && <p className="error-text">{tripErrors.from}</p>}
                                </div>

                                <div className="mb-3">
                                  <label className="form-label-sc" htmlFor="toId">
                                    {t('booking.to')}
                                  </label>
                                  <div className="input-group-sc">
                                    <span className="input-icon">
                                      <Flag size={18} strokeWidth={1.75} />
                                    </span>
                                    <select
                                      id="toId"
                                      disabled={!fromId}
                                      className={`form-control-sc ${tripErrors.to ? 'is-invalid' : ''}`}
                                      value={toId}
                                      onChange={(e) => setToId(e.target.value)}
                                    >
                                      <option value="">{t('booking.selectTo')}</option>
                                      {destinations.map((route) => (
                                        <option key={route._id} value={route.toLabel}>
                                          {localizedLabel(route.toLabel, route.toLabelAr, isArabic)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {tripErrors.to && <p className="error-text">{tripErrors.to}</p>}
                                </div>

                                {pickupSurcharges.map((s) => (
                                  <label key={s.key} className="surcharge-check mb-3">
                                    <input
                                      type="checkbox"
                                      checked={!!surchargeChecks[s.key]}
                                      onChange={(e) =>
                                        setSurchargeChecks((prev) => ({ ...prev, [s.key]: e.target.checked }))
                                      }
                                    />
                                    {localizedLabel(s.label, s.labelAr, isArabic)} (+
                                    {formatCurrency(s.amount, i18n.language)})
                                  </label>
                                ))}
                              </>
                            )}

                            {tripType === 'roundTrip' && (
                              <div className="mb-3">
                                <label className="form-label-sc" htmlFor="packageId">
                                  {t('booking.package')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <Route size={18} strokeWidth={1.75} />
                                  </span>
                                  <select
                                    id="packageId"
                                    className={`form-control-sc ${tripErrors.package ? 'is-invalid' : ''}`}
                                    value={packageId}
                                    onChange={(e) => setPackageId(e.target.value)}
                                  >
                                    <option value="">{t('booking.selectPackage')}</option>
                                    {roundTripPackages.map((pkg) => (
                                      <option key={pkg._id} value={pkg._id}>
                                        {packageLabel(pkg, isArabic)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {tripErrors.package && (
                                  <p className="error-text">{tripErrors.package}</p>
                                )}
                              </div>
                            )}

                            {tripType === 'byHour' && (
                              <div className="by-hour-notice mb-3">
                                <Landmark size={18} strokeWidth={1.75} />
                                <span>{t('booking.byHourNotice')}</span>
                              </div>
                            )}

                            <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="date">
                                  {t('booking.date')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <Calendar size={18} strokeWidth={1.75} />
                                  </span>
                                  <input
                                    id="date"
                                    type="date"
                                    className={`form-control-sc ${tripErrors.date ? 'is-invalid' : ''}`}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                  />
                                </div>
                                {tripErrors.date && <p className="error-text">{tripErrors.date}</p>}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="time">
                                  {t('booking.time')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <Clock size={18} strokeWidth={1.75} />
                                  </span>
                                  <input
                                    id="time"
                                    type="time"
                                    className={`form-control-sc ${tripErrors.time ? 'is-invalid' : ''}`}
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                  />
                                </div>
                                {tripErrors.time && <p className="error-text">{tripErrors.time}</p>}
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="form-label-sc" htmlFor="passengers">
                                {t('booking.passengers')}
                              </label>
                              <div className="input-group-sc">
                                <span className="input-icon">
                                  <Users size={18} strokeWidth={1.75} />
                                </span>
                                <input
                                  id="passengers"
                                  type="number"
                                  min={1}
                                  max={25}
                                  className={`form-control-sc ${tripErrors.passengers ? 'is-invalid' : ''}`}
                                  value={passengers}
                                  onChange={(e) => setPassengers(Number(e.target.value))}
                                />
                              </div>
                              {tripErrors.passengers && (
                                <p className="error-text">{tripErrors.passengers}</p>
                              )}
                            </div>

                            <div className="mb-4">
                              <label className="form-label-sc" htmlFor="specialRequests">
                                {t('booking.specialRequests')}
                              </label>
                              <textarea
                                id="specialRequests"
                                rows={3}
                                placeholder={t('booking.specialPlaceholder')}
                                className="form-control-sc"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                              />
                            </div>

                            <motion.button
                              type="button"
                              className="pill-btn-primary w-100"
                              whileTap={{ scale: 0.98 }}
                              onClick={handleContinueToVehicle}
                            >
                              {t('booking.continue')} <ArrowRight size={16} />
                            </motion.button>
                          </motion.div>
                        )}

                        {step === 'vehicle' && (
                          <motion.div
                            key="step-vehicle"
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                          >
                            <button
                              type="button"
                              className="step-back-btn mb-3"
                              onClick={() => setStep('trip')}
                            >
                              <ArrowLeft size={16} /> {t('booking.back')}
                            </button>
                            <h4 className="fw-bold mb-4">{t('booking.vehicleStep.title')}</h4>

                            <div className="vehicle-option-list mb-4">
                              {vehicles.map((vehicle) => {
                                const price = priceForVehicle(vehicle.vehicleId)
                                const isActive = vehicleId === vehicle.vehicleId
                                return (
                                  <motion.button
                                    key={vehicle.vehicleId}
                                    type="button"
                                    whileTap={{ scale: 0.99 }}
                                    className={`vehicle-option ${isActive ? 'active' : ''}`}
                                    onClick={() => setVehicleId(vehicle.vehicleId)}
                                  >
                                    <img src={vehicle.image} alt="" loading="lazy" />
                                    <div className="vehicle-option-info">
                                      <h6>{localizedLabel(vehicle.name, vehicle.nameAr, isArabic)}</h6>
                                      <p>
                                        {vehicle.pax} {t('booking.vehicleStep.seats')} · {vehicle.luggage}
                                      </p>
                                    </div>
                                    <div className="vehicle-option-price">
                                      {price !== null ? (
                                        <>
                                          <span>{formatCurrency(price, i18n.language)}</span>
                                          <small>{t('home.fleet.perTrip')}</small>
                                        </>
                                      ) : (
                                        <small>{t('booking.vehicleStep.priceOnRequest')}</small>
                                      )}
                                    </div>
                                    <span className="vehicle-option-radio" aria-hidden="true" />
                                  </motion.button>
                                )
                              })}
                            </div>
                            {vehicleError && <p className="error-text mb-3">{vehicleError}</p>}

                            {dropoffSurcharges.map((s) => (
                              <label key={s.key} className="surcharge-check mb-4">
                                <input
                                  type="checkbox"
                                  checked={!!surchargeChecks[s.key]}
                                  onChange={(e) =>
                                    setSurchargeChecks((prev) => ({ ...prev, [s.key]: e.target.checked }))
                                  }
                                />
                                {localizedLabel(s.label, s.labelAr, isArabic)} (+
                                {formatCurrency(s.amount, i18n.language)})
                              </label>
                            ))}

                            <motion.button
                              type="button"
                              className="pill-btn-primary w-100"
                              whileTap={{ scale: 0.98 }}
                              onClick={handleContinueToDetails}
                            >
                              {t('booking.vehicleStep.continue')} <ArrowRight size={16} />
                            </motion.button>
                          </motion.div>
                        )}

                        {step === 'details' && (
                          <motion.div
                            key="step-details"
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                          >
                            <button
                              type="button"
                              className="step-back-btn mb-3"
                              onClick={() => setStep('vehicle')}
                            >
                              <ArrowLeft size={16} /> {t('booking.back')}
                            </button>
                            <h4 className="fw-bold mb-4">{t('booking.detailsStep.title')}</h4>

                            <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="fullName">
                                  {t('booking.detailsStep.fullName')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <User size={18} strokeWidth={1.75} />
                                  </span>
                                  <input
                                    id="fullName"
                                    className={`form-control-sc ${detailsErrors.fullName ? 'is-invalid' : ''}`}
                                    placeholder={t('booking.detailsStep.fullNamePlaceholder')}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                  />
                                </div>
                                {detailsErrors.fullName && (
                                  <p className="error-text">{detailsErrors.fullName}</p>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="contactPhone">
                                  {t('booking.detailsStep.phone')}
                                </label>
                                <div className="phone-input-row">
                                  <select
                                    aria-label={t('booking.countryCode')}
                                    className="form-control-sc phone-country-select"
                                    value={detailsCountryCode}
                                    onChange={(e) => handleDetailsCountryChange(e.target.value)}
                                  >
                                    {COUNTRY_CODES.map((country) => (
                                      <option key={country.iso} value={country.code}>
                                        {country.code} {country.iso}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="input-group-sc flex-grow-1">
                                    <span className="input-icon">
                                      <Phone size={18} strokeWidth={1.75} />
                                    </span>
                                    <input
                                      id="contactPhone"
                                      type="tel"
                                      inputMode="numeric"
                                      placeholder={t('booking.detailsStep.phonePlaceholder')}
                                      className={`form-control-sc ${detailsErrors.phone ? 'is-invalid' : ''}`}
                                      value={contactPhone}
                                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                                    />
                                  </div>
                                </div>
                                {detailsErrors.phone ? (
                                  <p className="error-text">{detailsErrors.phone}</p>
                                ) : (
                                  <p className="phone-digit-hint">{detailsDigitHint}</p>
                                )}
                              </div>
                            </div>

                            <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="email">
                                  {t('booking.detailsStep.email')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <Mail size={18} strokeWidth={1.75} />
                                  </span>
                                  <input
                                    id="email"
                                    type="email"
                                    className={`form-control-sc ${detailsErrors.email ? 'is-invalid' : ''}`}
                                    placeholder={t('booking.detailsStep.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                  />
                                </div>
                                {detailsErrors.email && (
                                  <p className="error-text">{detailsErrors.email}</p>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label-sc" htmlFor="flightNo">
                                  {t('booking.detailsStep.flightNo')}
                                </label>
                                <div className="input-group-sc">
                                  <span className="input-icon">
                                    <Plane size={18} strokeWidth={1.75} />
                                  </span>
                                  <input
                                    id="flightNo"
                                    className="form-control-sc"
                                    placeholder={t('booking.detailsStep.flightNoPlaceholder')}
                                    value={flightNo}
                                    onChange={(e) => setFlightNo(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="form-label-sc">
                                {t('booking.detailsStep.paymentMethod')}
                              </label>
                              <div className="payment-method-cash-card">
                                <span className="payment-method-cash-icon">
                                  <Banknote size={20} strokeWidth={1.75} />
                                </span>
                                <div>
                                  <p className="payment-method-cash-title">
                                    {t('booking.detailsStep.cashOnArrival')}
                                  </p>
                                  <p className="payment-method-cash-note">
                                    {t('booking.detailsStep.cashOnlyNote')}
                                  </p>
                                </div>
                                <CheckCircle2 size={18} strokeWidth={1.75} className="payment-method-cash-check" />
                              </div>
                            </div>

                            <motion.button
                              type="button"
                              className="pill-btn-primary w-100"
                              disabled={submitting}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleConfirmBooking}
                            >
                              {submitting ? (
                                t('common.loading')
                              ) : (
                                <>
                                  {t('booking.detailsStep.confirm')} <ArrowRight size={16} />
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="col-lg-5 order-1 order-lg-2">
                    <FadeIn delay={0.1}>
                      <div className="summary-card sticky-top" style={{ top: 100 }}>
                        <p className="summary-label mb-2">{t('booking.summaryLabel')}</p>
                        <h4 className="mb-4">{t('booking.summaryTitle')}</h4>
                        <div className="mb-3 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.tripType')}</span>
                          <span>{tripTypeLabel}</span>
                        </div>
                        <div className="mb-3 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.route')}</span>
                          <span className="text-end" style={{ maxWidth: '60%' }}>
                            {routeDisplay}
                          </span>
                        </div>
                        <div className="mb-3 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.dateLabel')}</span>
                          <span>{date || t('common.notSet')}</span>
                        </div>
                        <div className="mb-3 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.timeLabel')}</span>
                          <span>{time || t('common.notSet')}</span>
                        </div>
                        <div className="mb-3 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.passengersLabel')}</span>
                          <span>{passengers || 1}</span>
                        </div>
                        <div className="mb-4 d-flex justify-content-between small">
                          <span className="opacity-75">{t('booking.vehicleLabel')}</span>
                          <span>
                            {selectedVehicle
                              ? localizedLabel(selectedVehicle.name, selectedVehicle.nameAr, isArabic)
                              : t('common.notSet')}
                          </span>
                        </div>
                        <hr className="opacity-25" />
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <span>{t('booking.totalEstimate')}</span>
                          <span className="summary-price">
                            {totalPrice !== null
                              ? formatCurrency(totalPrice, i18n.language)
                              : t('booking.vehicleStep.priceOnRequest')}
                          </span>
                        </div>
                        <a
                          href={WHATSAPP_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill-btn-outline w-100 text-center text-decoration-none d-block"
                        >
                          {t('booking.whatsapp')}
                        </a>
                      </div>
                    </FadeIn>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FadeIn delay={0.2}>
            <div className="row g-3 mt-5">
              {trustItems.map((item) => (
                <div key={item} className="col-6 col-md-3">
                  <div className="trust-pill">
                    <span className="trust-pill-icon">
                      <CheckCircle2 size={16} />
                    </span>
                    {t(`booking.trust.${item}`)}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="success-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="success-icon-badge">
                <CheckCircle2 size={36} strokeWidth={1.75} />
              </div>
              <h4 className="fw-bold text-center mb-2">{t('booking.success.title')}</h4>
              <p className="text-muted text-center mb-3">{t('booking.success.message')}</p>
              {bookingId && (
                <p className="text-center small mb-4">
                  {t('booking.success.bookingRef')}: <strong>{bookingId}</strong>
                </p>
              )}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn-primary w-100 text-center text-decoration-none d-block mb-3"
              >
                {t('booking.success.bookForMe')}
              </a>
              <button
                type="button"
                className="otp-link-btn w-100 text-center d-flex align-items-center justify-content-center gap-2"
                onClick={handleMakeAnotherBooking}
              >
                <RotateCcw size={14} /> {t('booking.success.makeAnother')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  )
}
