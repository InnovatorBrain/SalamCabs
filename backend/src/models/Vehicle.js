const mongoose = require('mongoose')

const { Schema } = mongoose

// A vehicle "type" offered on the booking form (Sedan, Hiace, Coaster, etc).
// `vehicleId` is the stable slug referenced as a price-map key on routes and
// packages, so it must stay unique and is never mutated once other records
// point to it — rename via `name`/`nameAr` instead.
const VehicleSchema = new Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, trim: true, default: '' },
    // Shown on the homepage fleet showcase (booking form only needs name/pax/luggage/image).
    category: { type: String, trim: true, default: '' },
    categoryAr: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    descriptionAr: { type: String, trim: true, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 4.8 },
    pax: { type: String, required: true, trim: true },
    luggage: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    // Cloudinary public_id for `image`, kept so we can delete the asset from
    // Cloudinary storage when the vehicle is removed. Empty for any legacy
    // images that predate the Cloudinary migration.
    imagePublicId: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Vehicle', VehicleSchema)
