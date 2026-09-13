import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export const Layout = () => {
  const { admin, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    showToast('Logged out successfully', 'success')
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-brand">
          <span className="admin-logo-badge">SC</span>
          <div>
            <p className="admin-brand-title">Salam Cab</p>
            <p className="admin-brand-subtitle">Admin Dashboard</p>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
            Bookings
          </NavLink>
          <NavLink
            to="/routes-pricing"
            className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
          >
            Routes &amp; Pricing
          </NavLink>
        </nav>

        <div className="admin-header-account">
          <span className="admin-account-email">{admin?.email}</span>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
