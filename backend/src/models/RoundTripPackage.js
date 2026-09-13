const mongoose = require('mongoose')

const { Schema } = mongoose

// A multi-leg round-trip package (e.g. Jeddah -> Makkah -> Madinah -> Jeddah)
// with one flat price per vehicle type. `legs`/`legsAr` are ordered waypoint
// labels shown to the customer as "Jeddah → Makkah → Madinah → Jeddah".
const RoundTripPackageSchema = new Schema(
  {
    legs: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'A round-trip package needs at least 2 legs',
      },
    },
    legsAr: { type: [String], default: [] },
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

module.exports = mongoose.model('RoundTripPackage', RoundTripPackageSchema)
