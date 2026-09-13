const express = require('express')
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingDriver,
  deleteBooking,
} = require('../controllers/bookingController')
const { requireAdminAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', createBooking)

// Admin-only — viewing/managing bookings requires a valid admin session.
router.get('/', requireAdminAuth, getBookings)
router.get('/:id', requireAdminAuth, getBookingById)
router.patch('/:id/status', requireAdminAuth, updateBookingStatus)
router.patch('/:id/driver', requireAdminAuth, updateBookingDriver)
router.delete('/:id', requireAdminAuth, deleteBooking)

module.exports = router
