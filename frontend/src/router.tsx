import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDirection } from '@/hooks/useDirection'

const HomePage = lazy(() => import('@/pages/HomePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const BookingPage = lazy(() => import('@/pages/BookingPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const RefundPolicyPage = lazy(() => import('@/pages/RefundPolicyPage'))

// Scrolls to the element matching the URL hash (e.g. /#fleet) after each
// navigation, or to the top of the page when there is no hash. Runs on a
// short delay so lazy-loaded page content has mounted first.
const ScrollToHashOrTop = () => {
  const location = useLocation()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (location.hash) {
        const el = document.querySelector(location.hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  return null
}

const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner-sc" />
  </div>
)

const AnimatedRoutes = () => {
  const location = useLocation()
  const { direction } = useDirection()

  return (
    <>
      <ScrollToHashOrTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export const AppRouter = () => (
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
)
