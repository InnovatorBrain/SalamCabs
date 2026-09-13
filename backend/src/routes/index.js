const express = require('express')
const bookingRoutes = require('./bookingRoutes')
const authRoutes = require('./authRoutes')
const contactRoutes = require('./contactRoutes')
const rateCardRoutes = require('./rateCardRoutes')
const adminRateCardRoutes = require('./adminRateCardRoutes')
const uploadRoutes = require('./uploadRoutes')
const otpRoutes = require('./otpRoutes')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Salam Cab API is running' })
})

router.use('/admin/auth', authRoutes)
router.use('/admin/rate-card', adminRateCardRoutes)
router.use('/admin/uploads', uploadRoutes)
router.use('/bookings', bookingRoutes)
router.use('/contact', contactRoutes)
router.use('/rate-card', rateCardRoutes)
router.use('/otp', otpRoutes)

module.exports = router
