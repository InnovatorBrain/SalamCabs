const Booking = require('../models/Booking')
const { sendBookingConfirmationEmail } = require('../utils/mailer')

const REQUIRED_FIELDS = ['tripType', 'date', 'time', 'passengers', 'fullName', 'phone', 'email']

// Bookings are looked up by their human-friendly bookingId (e.g. SC-12345)
// or by their Mongo _id, from a single :id route param.
const byIdOrBookingId = (id) => ({
  $or: [{ bookingId: id }, { _id: id.match(/^[a-f0-9]{24}$/i) ? id : undefined }],
})

const generateBookingId = () => {
  const random = Math.floor(Math.random() * 90000) + 10000
  return `SC-${random}`
}

const getUniqueBookingId = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateBookingId()
    // eslint-disable-next-line no-await-in-loop
    const exists = await Booking.exists({ bookingId: candidate })
    if (!exists) return candidate
  }
  throw new Error('Could not generate a unique booking reference, please try again')
}

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const payload = req.body || {}

    const missing = REQUIRED_FIELDS.filter((field) => {
      const value = payload[field]
      return value === undefined || value === null || value === ''
    })

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`,
      })
    }

    const bookingId = await getUniqueBookingId()

    const booking = await Booking.create({
      ...payload,
      bookingId,
      paymentMethod: 'cash',
    })

    const emailResult = await sendBookingConfirmationEmail(booking)
    booking.confirmationEmail = emailResult
    await booking.save()

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: booking.bookingId,
      booking,
    })
  } catch (error) {
    return next(error)
  }
}

// "upcoming" query values map to a lookahead window (in days) from right now,
// used to answer "which trips are coming up in the next day / 3 days / week?"
const UPCOMING_WINDOW_DAYS = { '1d': 1, '3d': 3, '7d': 7 }

// GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { phone, email, status, upcoming, page = 1, limit = 20 } = req.query
    const query = {}
    if (phone) query.phone = { $regex: String(phone).replace(/\D/g, ''), $options: 'i' }
    if (email) query.email = String(email).toLowerCase()
    if (status) query.status = status

    const pageNum = Math.max(Number(page) || 1, 1)
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100)

    const windowDays = UPCOMING_WINDOW_DAYS[upcoming]

    if (!windowDays) {
      const [bookings, total] = await Promise.all([
        Booking.find(query)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Booking.countDocuments(query),
      ])

      return res.json({
        success: true,
        count: bookings.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        bookings,
      })
    }

    // `date` ("YYYY-MM-DD") and `time` ("HH:MM") are stored as separate strings
    // (they come straight from <input type="date"/time">), so combine them into
    // a real Date via aggregation to compare against the "now → now+N days" window.
    // Trips with an unparsable date/time simply fall out of the range below.
    const now = new Date()
    const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000)

    const basePipeline = [
      { $match: query },
      {
        $addFields: {
          tripDateTime: {
            $dateFromString: {
              dateString: { $concat: ['$date', 'T', '$time', ':00'] },
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { tripDateTime: { $gte: now, $lte: windowEnd } } },
    ]

    const [bookings, countResult] = await Promise.all([
      Booking.aggregate([
        ...basePipeline,
        { $sort: { tripDateTime: 1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]),
      Booking.aggregate([...basePipeline, { $count: 'total' }]),
    ])
    const total = countResult[0]?.total || 0

    return res.json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      bookings,
    })
  } catch (error) {
    return next(error)
  }
}

// GET /api/bookings/:id  (matches Mongo _id OR bookingId, e.g. SC-12345)
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await Booking.findOne(byIdOrBookingId(id))

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    return res.json({ success: true, booking })
  } catch (error) {
    return next(error)
  }
}

// PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be one of: pending, confirmed, cancelled',
      })
    }

    const booking = await Booking.findOneAndUpdate(byIdOrBookingId(id), { status }, { new: true })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    return res.json({ success: true, booking })
  } catch (error) {
    return next(error)
  }
}

// PATCH /api/bookings/:id/driver
const updateBookingDriver = async (req, res, next) => {
  try {
    const { id } = req.params
    const { driverName, driverPhone } = req.body || {}

    if (driverName !== undefined && typeof driverName !== 'string') {
      return res.status(400).json({ success: false, message: 'driverName must be a string' })
    }
    if (driverPhone !== undefined && typeof driverPhone !== 'string') {
      return res.status(400).json({ success: false, message: 'driverPhone must be a string' })
    }

    const update = {}
    if (driverName !== undefined) update.driverName = driverName.trim()
    if (driverPhone !== undefined) update.driverPhone = driverPhone.trim()

    const booking = await Booking.findOneAndUpdate(byIdOrBookingId(id), update, { new: true })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    return res.json({ success: true, booking })
  } catch (error) {
    return next(error)
  }
}

// DELETE /api/bookings/:id
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await Booking.findOneAndDelete(byIdOrBookingId(id))

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    return res.json({
      success: true,
      message: `Booking ${booking.bookingId} deleted successfully`,
      bookingId: booking.bookingId,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingDriver,
  deleteBooking,
}
