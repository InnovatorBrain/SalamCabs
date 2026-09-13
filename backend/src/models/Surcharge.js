const mongoose = require('mongoose')

const { Schema } = mongoose

// A configurable extra fee shown as an optional checkbox in the booking flow.
//
// `triggerStage` decides where it's offered:
//   - "pickup"  -> shown in the Trip Details step, only when the customer's
//                  selected "from" label matches `triggerMatchLabel` exactly
//                  (leave `triggerMatchLabel` empty to always show it there).
//   - "dropoff" -> shown in the Vehicle Selection step, only when the chosen
//                  vehicle's `vehicleId` is included in `appliesToVehicleIds`
//                  (leave `appliesToVehicleIds` empty to apply to all vehicles).
const SurchargeSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    labelAr: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    triggerStage: {
      type: String,
      enum: ['pickup', 'dropoff'],
      required: true,
    },
    triggerMatchLabel: { type: String, trim: true, default: '' },
    appliesToVehicleIds: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Surcharge', SurchargeSchema)
