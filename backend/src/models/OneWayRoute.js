const mongoose = require('mongoose')

const { Schema } = mongoose

// A single point-to-point route (e.g. "Jeddah Airport" -> "Makkah Hotel")
// with one price per vehicle type. `prices` is keyed by `Vehicle.vehicleId`.
const OneWayRouteSchema = new Schema(
  {
    fromLabel: { type: String, required: true, trim: true },
    fromLabelAr: { type: String, trim: true, default: '' },
    toLabel: { type: String, required: true, trim: true },
    toLabelAr: { type: String, trim: true, default: '' },
    prices: {
      type: Map,
      of: Number,
      default: {},
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { flattenMaps: true }, toObject: { flattenMaps: true } },
)

module.exports = mongoose.model('OneWayRoute', OneWayRouteSchema)
