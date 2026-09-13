const multer = require('multer')

// Files are kept in memory (as a Buffer) and streamed straight to Cloudinary
// in the controller — nothing is ever written to local disk, so image
// storage works the same way whether this API runs locally or on any host.
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'))
  }
  return cb(null, true)
}

const uploadVehicleImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image')

module.exports = { uploadVehicleImage }
