const cloudinary = require('../config/cloudinary')

const CLOUDINARY_FOLDER = 'salam-cab/vehicles'

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(buffer)
  })

// POST /api/admin/uploads/vehicle-image
const uploadVehicleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was uploaded' })
    }

    // Cloudinary always hands back a complete, absolute HTTPS URL — that's
    // the only thing we ever store in the database for a vehicle photo.
    const result = await uploadBufferToCloudinary(req.file.buffer)

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: req.file.size,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { uploadVehicleImage }
