import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { CONTACT_PHONE_TEL, WHATSAPP_LINK } from '@/config/contact'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="footer-sc">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img src="/images/logo.png" alt="Salam Cab" className="brand-logo brand-logo-footer" />
            </div>
            <p className="small">{t('footer.about')}</p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6>{t('footer.quickLinks')}</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/">{t('nav.home')}</Link></li>
              <li className="mb-2"><Link to="/about">{t('nav.about')}</Link></li>
              <li className="mb-2"><Link to="/#fleet">{t('footer.ourFleet')}</Link></li>
              <li className="mb-2"><Link to="/#destinations">{t('footer.popularRoutes')}</Link></li>
              <li className="mb-2"><Link to="/booking">{t('footer.bookRide')}</Link></li>
              <li className="mb-2"><Link to="/contact">{t('footer.contactUs')}</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6>{t('footer.ourServices')}</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/#services">{t('footer.services.airport')}</Link></li>
              <li className="mb-2"><Link to="/#services">{t('footer.services.umrah')}</Link></li>
              <li className="mb-2"><Link to="/#services">{t('footer.services.makkahMadinah')}</Link></li>
              <li className="mb-2"><Link to="/#services">{t('footer.services.hotel')}</Link></li>
              <li className="mb-2"><Link to="/#services">{t('footer.services.family')}</Link></li>
              <li className="mb-2"><Link to="/#services">{t('footer.services.corporate')}</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6>{t('footer.contactUs')}</h6>
            <ul className="list-unstyled small">
              <li className="mb-2 footer-contact-row">
                <MapPin size={16} strokeWidth={1.75} /> {t('footer.location')}
              </li>
              <li className="mb-2 footer-contact-row">
                <Phone size={16} strokeWidth={1.75} />{' '}
                <a href={`tel:${CONTACT_PHONE_TEL}`}>{t('footer.phone')}</a>
              </li>
              <li className="mb-2 footer-contact-row">
                <Mail size={16} strokeWidth={1.75} />{' '}
                <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
              </li>
              <li className="mb-2 footer-contact-row">
                <MessageCircle size={16} strokeWidth={1.75} />{' '}
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  {t('footer.whatsapp')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span>{t('footer.copyright')}</span>
          <div className="d-flex gap-3">
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
            <Link to="/refund-policy">{t('footer.refund')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
