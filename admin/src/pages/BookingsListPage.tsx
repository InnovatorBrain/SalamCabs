import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  type Booking,
  type BookingStatus,
  type UpcomingWindow,
} from '@/api/bookings.api'
import { StatusBadgeSelect } from '@/components/StatusBadgeSelect'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/context/ToastContext'
import { formatCurrency, formatDateTime, tripTypeLabel } from '@/utils/format'

const PAGE_SIZE = 10

export const BookingsListPage = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [upcomingFilter, setUpcomingFilter] = useState<UpcomingWindow>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const isEmailSearch = search.includes('@')
      const res = await getBookings({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        upcoming: upcomingFilter || undefined,
        phone: !isEmailSearch && search ? search : undefined,
        email: isEmailSearch ? search : undefined,
      })
      setBookings(res.bookings)
      setPages(res.pages)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, upcomingFilter, search])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleStatusChange = async (booking: Booking, status: BookingStatus) => {
    setUpdatingId(booking._id)
    const previous = booking.status
    setBookings((prev) => prev.map((b) => (b._id === booking._id ? { ...b, status } : b)))

    try {
      await updateBookingStatus(booking.bookingId, status)
      showToast(`${booking.bookingId} marked as ${status}`, 'success')
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? { ...b, status: previous } : b)))
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!bookingToDelete) return
    setDeleting(true)
    try {
      await deleteBooking(bookingToDelete.bookingId)
      setBookings((prev) => prev.filter((b) => b._id !== bookingToDelete._id))
      setTotal((prev) => Math.max(prev - 1, 0))
      showToast(`${bookingToDelete.bookingId} deleted successfully`, 'success')
      setBookingToDelete(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete booking', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p className="page-subtitle">{total} total booking{total === 1 ? '' : 's'}</p>
        </div>

        <div className="filters-bar">
          <input
            type="search"
            placeholder="Search phone or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1)
              setStatusFilter(e.target.value as BookingStatus | '')
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={upcomingFilter}
            onChange={(e) => {
              setPage(1)
              setUpcomingFilter(e.target.value as UpcomingWindow)
            }}
          >
            <option value="">All trip dates</option>
            <option value="1d">Upcoming — next 24 hours</option>
            <option value="3d">Upcoming — next 3 days</option>
            <option value="7d">Upcoming — next 7 days</option>
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="table-card">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Trip</th>
              <th>Date &amp; Time</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="table-empty">
                  Loading bookings…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="clickable-row"
                  onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                >
                  <td className="mono">{booking.bookingId}</td>
                  <td>
                    <div className="cell-title">{booking.fullName}</div>
                    <div className="cell-subtitle">{booking.phone}</div>
                  </td>
                  <td>
                    <div className="cell-title">{tripTypeLabel(booking.tripType)}</div>
                    <div className="cell-subtitle">{booking.route || '—'}</div>
                  </td>
                  <td>
                    <div className="cell-title">{booking.date}</div>
                    <div className="cell-subtitle">{booking.time}</div>
                  </td>
                  <td>{booking.vehicleName || booking.vehicle || '—'}</td>
                  <td>
                    {booking.driverName ? (
                      <span className="cell-title">{booking.driverName}</span>
                    ) : (
                      <span className="cell-subtitle">Not assigned</span>
                    )}
                  </td>
                  <td className="mono">{formatCurrency(booking.totalPrice)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusBadgeSelect
                      value={booking.status}
                      disabled={updatingId === booking._id}
                      onChange={(status) => handleStatusChange(booking, status)}
                    />
                  </td>
                  <td className="cell-subtitle">{formatDateTime(booking.createdAt)}</td>
                  <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                      >
                        View →
                      </button>
                      <button
                        type="button"
                        className="delete-icon-btn"
                        aria-label={`Delete booking ${booking.bookingId}`}
                        onClick={() => setBookingToDelete(booking)}
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pagination-bar">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!bookingToDelete}
        title="Delete this booking?"
        message={
          bookingToDelete
            ? `This will permanently delete booking ${bookingToDelete.bookingId} for ${bookingToDelete.fullName}. This cannot be undone.`
            : ''
        }
        confirming={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setBookingToDelete(null)}
      />
    </div>
  )
}
