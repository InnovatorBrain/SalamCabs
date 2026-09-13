const mongoose = require('mongoose')

const { Schema } = mongoose

const BookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // --- Trip details -----------------------------------------------------
    tripType: {
      type: String,
      enum: ['oneWay', 'roundTrip', 'byHour'],
      required: true,
    },
    tripTypeLabel: { type: String, trim: true },
    route: { type: String, trim: true },
    from: { type: String, trim: true },
    to: { type: String, trim: true },
    roundTripPackage: { type: String, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    passengers: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, trim: true, default: '' },
    jeddahHajjPickup: { type: Boolean, default: false },
    hajjDropoff: { type: Boolean, default: false },

    // --- Vehicle ------------------------------------------------------------
    vehicle: { type: String, trim: true },
    vehicleName: { type: String, trim: true },

    // --- Driver assignment (set manually by an admin) --------------------------
    driverName: { type: String, trim: true, default: '' },
    driverPhone: { type: String, trim: true, default: '' },

    // --- Contact --------------------------------------------------------------
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    flightNo: { type: String, trim: true, default: '' },

    // --- Payment ------------------------------------------------------------
    // Cash on arrival is currently the only supported payment method.
    paymentMethod: {
      type: String,
      enum: ['cash'],
      default: 'cash',
      required: true,
    },

    // --- Pricing --------------------------------------------------------------
    basePrice: { type: Number, default: null },
    surcharge: { type: Number, default: 0 },
    totalPrice: { type: Number, default: null },

    // --- Status tracking --------------------------------------------------------
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    confirmationEmail: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
      },
      messageId: { type: String },
      previewUrl: { type: String },
      error: { type: String },
      sentAt: { type: Date },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Booking', BookingSchema)
