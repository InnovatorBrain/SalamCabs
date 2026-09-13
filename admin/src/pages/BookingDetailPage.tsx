import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import {
  getBookingById,
  updateBookingStatus,
  updateBookingDriver,
  deleteBooking,
  type Booking,
  type BookingStatus,
} from '@/api/bookings.api'
import { StatusBadgeSelect } from '@/components/StatusBadgeSelect'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/context/ToastContext'
import { formatCurrency, formatDateTime, tripTypeLabel } from '@/utils/format'

export const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [savingDriver, setSavingDriver] = useState(false)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const res = await getBookingById(id)
      setBooking(res.booking)
      setDriverName(res.booking.driverName || '')
      setDriverPhone(res.booking.driverPhone || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking) return
    setUpdating(true)
    try {
      const res = await updateBookingStatus(booking.bookingId, status)
      setBooking(res.booking)
      showToast(`Status updated to ${status}`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveDriver = async () => {
    if (!booking) return
    setSavingDriver(true)
    try {
      const res = await updateBookingDriver(booking.bookingId, {
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
      })
      setBooking(res.booking)
      showToast(
        driverName.trim() ? `Driver assigned: ${driverName.trim()}` : 'Driver assignment cleared',
        'success',
      )
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to assign driver', 'error')
    } finally {
      setSavingDriver(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!booking) return
    setDeleting(true)
    try {
      await deleteBooking(booking.bookingId)
      showToast(`${booking.bookingId} deleted successfully`, 'success')
      navigate('/', { replace: true })
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete booking', 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="page-loader-inline">Loading booking…</div>
  }

  if (error || !booking) {
    return (
      <div className="detail-page">
        <p className="form-error">{error || 'Booking not found'}</p>
        <Link to="/" className="view-link">
          ← Back to bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        ← Back to bookings
      </Link>

      <div className="detail-header">
        <div>
          <h1 className="mono">{booking.bookingId}</h1>
          <p className="page-subtitle">Created {formatDateTime(booking.createdAt)}</p>
        </div>
        <div className="detail-header-actions">
          <StatusBadgeSelect value={booking.status} disabled={updating} onChange={handleStatusChange} />
          <button
            type="button"
            className="delete-icon-btn"
            aria-label={`Delete booking ${booking.bookingId}`}
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Trip Details</h2>
          <dl>
            <div className="detail-row">
              <dt>Trip Type</dt>
              <dd>{booking.tripTypeLabel || tripTypeLabel(booking.tripType)}</dd>
            </div>
            <div className="detail-row">
              <dt>Route</dt>
              <dd>{booking.route || '—'}</dd>
            </div>
            <div className="detail-row">
              <dt>Date</dt>
              <dd>{booking.date}</dd>
            </div>
            <div className="detail-row">
              <dt>Time</dt>
              <dd>{booking.time}</dd>
            </div>
            <div className="detail-row">
              <dt>Passengers</dt>
              <dd>{booking.passengers}</dd>
            </div>
            <div className="detail-row">
              <dt>Jeddah Hajj Pickup</dt>
              <dd>{booking.jeddahHajjPickup ? 'Yes' : 'No'}</dd>
            </div>
            <div className="detail-row">
              <dt>Hajj Terminal Drop-off</dt>
              <dd>{booking.hajjDropoff ? 'Yes' : 'No'}</dd>
            </div>
            <div className="detail-row">
              <dt>Special Requests</dt>
              <dd>{booking.specialRequests || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-card">
          <h2>Vehicle &amp; Pricing</h2>
          <dl>
            <div className="detail-row">
              <dt>Vehicle</dt>
              <dd>{booking.vehicleName || booking.vehicle || 'To be confirmed'}</dd>
            </div>
            <div className="detail-row">
              <dt>Base Price</dt>
              <dd>{formatCurrency(booking.basePrice)}</dd>
            </div>
            <div className="detail-row">
              <dt>Surcharge</dt>
              <dd>{formatCurrency(booking.surcharge)}</dd>
            </div>
            <div className="detail-row highlight">
              <dt>Total Price</dt>
              <dd>{formatCurrency(booking.totalPrice)}</dd>
            </div>
            <div className="detail-row">
              <dt>Payment Method</dt>
              <dd>Cash on Arrival</dd>
            </div>
          </dl>
        </section>

        <section className="detail-card">
          <h2>Driver Assignment</h2>
          <p className="driver-note">Manually assign a driver to this booking.</p>
          <div className="driver-form">
            <div className="form-field">
              <label htmlFor="driverName">Driver Name</label>
              <input
                id="driverName"
                placeholder="e.g. Khalid Al-Otaibi"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="driverPhone">Driver Phone (optional)</label>
              <input
                id="driverPhone"
                placeholder="e.g. +966501112222"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
              />
            </div>
            <button type="button" className="assign-driver-btn" disabled={savingDriver} onClick={handleSaveDriver}>
              {savingDriver ? 'Saving…' : booking.driverName ? 'Update Driver' : 'Assign Driver'}
            </button>
          </div>
        </section>

        <section className="detail-card">
          <h2>Contact Information</h2>
          <dl>
            <div className="detail-row">
              <dt>Full Name</dt>
              <dd>{booking.fullName}</dd>
            </div>
            <div className="detail-row">
              <dt>Phone</dt>
              <dd>{booking.phone}</dd>
            </div>
            <div className="detail-row">
              <dt>Email</dt>
              <dd>{booking.email}</dd>
            </div>
            <div className="detail-row">
              <dt>Flight No.</dt>
              <dd>{booking.flightNo || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-card">
          <h2>Confirmation Email</h2>
          <dl>
            <div className="detail-row">
              <dt>Status</dt>
              <dd className={`email-status email-status-${booking.confirmationEmail?.status || 'pending'}`}>
                {booking.confirmationEmail?.status || 'pending'}
              </dd>
            </div>
            {booking.confirmationEmail?.sentAt && (
              <div className="detail-row">
                <dt>Sent At</dt>
                <dd>{formatDateTime(booking.confirmationEmail.sentAt)}</dd>
              </div>
            )}
            {booking.confirmationEmail?.previewUrl && (
              <div className="detail-row">
                <dt>Preview</dt>
                <dd>
                  <a href={booking.confirmationEmail.previewUrl} target="_blank" rel="noopener noreferrer">
                    View email preview ↗
                  </a>
                </dd>
              </div>
            )}
            {booking.confirmationEmail?.error && (
              <div className="detail-row">
                <dt>Error</dt>
                <dd className="form-error">{booking.confirmationEmail.error}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this booking?"
        message={`This will permanently delete booking ${booking.bookingId} for ${booking.fullName}. This cannot be undone.`}
        confirming={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
