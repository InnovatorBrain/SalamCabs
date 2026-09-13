import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

interface NavbarProps {
  variant?: 'light' | 'dark'
}

export const Navbar = ({ variant = 'light' }: NavbarProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path
  const navClass = variant === 'dark' ? 'navbar-sc-dark' : 'navbar-sc'

  return (
    <nav className={`navbar navbar-expand-lg ${navClass}`}>
      <div className="container">
        <Link to="/" className="d-flex align-items-center text-decoration-none">
          <img src="/images/logo.png" alt="Salam Cab" className="brand-logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                to="/"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                to="/about"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/booking') ? 'active' : ''}`}
                to="/booking"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.quote')}
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>
                {t('nav.service')}
              </Link>
            </li> */}
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                to="/contact"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-3 mt-lg-0">
            <LanguageToggle />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/booking" className="pill-btn-primary text-decoration-none">
                {t('nav.bookingNow')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/contact"
                className={`${variant === 'dark' ? 'pill-btn-outline' : 'pill-btn-outline-dark'} text-decoration-none`}
              >
                {t('nav.contactUs')}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  )
}
