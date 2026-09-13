const express = require('express')
const { uploadVehicleImage: uploadVehicleImageMiddleware } = require('../middleware/uploadMiddleware')
const { uploadVehicleImage } = require('../controllers/uploadController')
const { requireAdminAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAdminAuth)

router.post('/vehicle-image', uploadVehicleImageMiddleware, uploadVehicleImage)

module.exports = router
