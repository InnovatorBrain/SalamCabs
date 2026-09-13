import { useState, type ComponentType } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowRight,
  type LucideProps,
} from 'lucide-react'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa6'
import { PageLayout } from '@/components/layout/PageLayout'
import { FadeIn } from '@/components/ui/Accordion'
import { useToast } from '@/components/ui/Toast'
import { submitContact } from '@/api/contact.api'
import { createContactSchema, type ContactFormData } from '@/utils/validation'
import { WHATSAPP_LINK, CONTACT_PHONE_TEL } from '@/config/contact'
import { Seo } from '@/components/seo/Seo'

const HERO_IMG =
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80'

export default function ContactPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const schema = createContactSchema(t)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ContactFormData) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await submitContact(data)
      showToast(t('toast.contactSuccess'), 'success')
      reset()
    } catch {
      showToast(t('toast.contactError'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const contactCards: {
    icon: ComponentType<LucideProps>
    title: string
    detail: string
    sub?: string
    action?: string
    href?: string
    btnClass?: string
  }[] = [
    {
      icon: MessageCircle,
      title: t('contact.whatsapp'),
      detail: t('footer.phone'),
      action: t('contact.whatsappBtn'),
      href: WHATSAPP_LINK,
      btnClass: 'pill-btn-primary',
    },
    {
      icon: Phone,
      title: t('contact.phoneTitle'),
      detail: t('footer.phone'),
      sub: t('contact.phoneAvailable'),
      action: t('contact.callBtn'),
      href: `tel:${CONTACT_PHONE_TEL}`,
    },
    {
      icon: Mail,
      title: t('contact.emailTitle'),
      detail: t('footer.email'),
      sub: t('contact.emailReply'),
      action: t('contact.emailBtn'),
      href: `mailto:${t('footer.email')}`,
    },
    {
      icon: MapPin,
      title: t('contact.officeTitle'),
      detail: t('contact.officeAddress'),
      action: t('contact.openMaps'),
      href: 'https://maps.google.com/?q=Makkah,Saudi+Arabia',
    },
  ]

  const socialLinks: { key: string; icon: ComponentType<{ size?: number }>; href: string; label: string }[] = [
    { key: 'f', icon: FaFacebookF, href: 'https://facebook.com/salamcab', label: 'Facebook' },
    { key: 'in', icon: FaInstagram, href: 'https://instagram.com/salamcab', label: 'Instagram' },
    { key: 'yt', icon: FaYoutube, href: 'https://youtube.com/@salamcab', label: 'YouTube' },
    { key: 'wa', icon: MessageCircle, href: WHATSAPP_LINK, label: 'WhatsApp' },
  ]

  const hours = [
    { day: t('contact.hours.satThu'), time: t('contact.hours.satThuTime') },
    { day: t('contact.hours.fri'), time: t('contact.hours.friTime') },
    { day: t('contact.hours.wa'), time: t('contact.hours.waTime') },
  ]

  return (
    <PageLayout>
      <Seo
        title={t('seo.contact.title')}
        description={t('seo.contact.description')}
        keywords={t('seo.contact.keywords')}
        path="/contact"
      />
      <section
        className="hero-section-sm hero-overlay"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        <div className="container">
          <FadeIn>
            <h1 className="display-5 fw-bold">
              {t('contact.heroTitle')} <span className="text-highlight">{t('contact.heroHighlight')}</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <FadeIn>
                <div className="card-shadow p-4 p-lg-5 bg-white">
                  <h3 className="fw-bold mb-4">{t('contact.formTitle')}</h3>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label-sc" htmlFor="name">
                          {t('contact.name')}
                        </label>
                        <input
                          id="name"
                          className={`form-control-sc ${errors.name ? 'is-invalid' : ''}`}
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="error-text">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-sc" htmlFor="email">
                          {t('contact.email')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`form-control-sc ${errors.email ? 'is-invalid' : ''}`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="error-text">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-sc" htmlFor="phone">
                          {t('contact.phone')}
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          className={`form-control-sc ${errors.phone ? 'is-invalid' : ''}`}
                          {...register('phone')}
                        />
                        {errors.phone && (
                          <p className="error-text">{errors.phone.message}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-sc" htmlFor="subject">
                          {t('contact.subject')}
                        </label>
                        <select
                          id="subject"
                          className={`form-control-sc ${errors.subject ? 'is-invalid' : ''}`}
                          {...register('subject')}
                        >
                          <option value="">{t('contact.subject')}</option>
                          <option value="booking">{t('contact.subjects.booking')}</option>
                          <option value="support">{t('contact.subjects.support')}</option>
                          <option value="corporate">{t('contact.subjects.corporate')}</option>
                          <option value="other">{t('contact.subjects.other')}</option>
                        </select>
                        {errors.subject && (
                          <p className="error-text">{errors.subject.message}</p>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label-sc" htmlFor="message">
                          {t('contact.message')}
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          placeholder={t('contact.messagePlaceholder')}
                          className={`form-control-sc ${errors.message ? 'is-invalid' : ''}`}
                          {...register('message')}
                        />
                        {errors.message && (
                          <p className="error-text">{errors.message.message}</p>
                        )}
                      </div>
                      <div className="col-12">
                        <motion.button
                          type="submit"
                          className="pill-btn-primary"
                          disabled={submitting}
                          whileTap={{ scale: 0.97 }}
                        >
                          {submitting ? t('common.loading') : t('contact.sendMessage')}{' '}
                          <Send size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              </FadeIn>
            </div>

            <div className="col-lg-5">
              {contactCards.map((card, i) => {
                const CardIcon = card.icon
                return (
                  <FadeIn key={i} delay={i * 0.08}>
                    <div className="contact-info-card d-flex gap-3">
                      <div className="contact-icon">
                        <CardIcon size={20} strokeWidth={1.75} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{card.title}</h6>
                        <p className="mb-1 small">{card.detail}</p>
                        {card.sub && <p className="text-muted small mb-2">{card.sub}</p>}
                        {card.action && card.href && (
                          <a
                            href={card.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${card.btnClass ?? 'text-highlight'} small fw-semibold text-decoration-none icon-link`}
                          >
                            {card.action} <ArrowRight size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <FadeIn>
            <iframe
              title="Map"
              className="map-embed"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4740.5!2d39.8262!3d21.4225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c204dc3e77c3f1%3A0x5c5e5e5e5e5e5e5e!2sMakkah!5e0!3m2!1sen!2ssa!4v1"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </FadeIn>
        </div>
      </section>

      <section className="bg-dark-section section-padding">
        <div className="container">
          <div className="row g-5">
            <div className="col-md-6">
              <FadeIn>
                <p className="section-label">{t('contact.workingHours')}</p>
                <h3 className="text-white mb-4">{t('contact.workingSubtitle')}</h3>
                {hours.map((h) => (
                  <div key={h.day} className="working-hours-row">
                    <span>{h.day}</span>
                    <span className="text-highlight fw-semibold">{h.time}</span>
                  </div>
                ))}
              </FadeIn>
            </div>
            <div className="col-md-6">
              <FadeIn delay={0.1}>
                <p className="section-label">{t('contact.followUs')}</p>
                <h3 className="text-white mb-4">{t('contact.followSubtitle')}</h3>
                <div>
                  {socialLinks.map(({ key, icon: SocialIcon, href, label }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label={label}
                    >
                      <SocialIcon size={16} />
                    </a>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
