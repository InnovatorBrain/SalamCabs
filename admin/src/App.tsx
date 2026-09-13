import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { BookingsListPage } from '@/pages/BookingsListPage'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { RoutesPricingPage } from '@/pages/RoutesPricingPage'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<BookingsListPage />} />
                <Route path="/bookings/:id" element={<BookingDetailPage />} />
                <Route path="/routes-pricing" element={<RoutesPricingPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}
