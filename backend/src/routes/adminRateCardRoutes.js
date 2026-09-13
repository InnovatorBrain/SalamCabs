const express = require('express')
const {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  listOneWayRoutes,
  createOneWayRoute,
  updateOneWayRoute,
  deleteOneWayRoute,
  listRoundTripPackages,
  createRoundTripPackage,
  updateRoundTripPackage,
  deleteRoundTripPackage,
  listSurcharges,
  createSurcharge,
  updateSurcharge,
  deleteSurcharge,
} = require('../controllers/adminRateCardController')
const { requireAdminAuth } = require('../middleware/authMiddleware')

const router = express.Router()

// Everything under /api/admin/rate-card requires a valid admin session.
router.use(requireAdminAuth)

router.get('/vehicles', listVehicles)
router.post('/vehicles', createVehicle)
router.patch('/vehicles/:id', updateVehicle)
router.delete('/vehicles/:id', deleteVehicle)

router.get('/one-way-routes', listOneWayRoutes)
router.post('/one-way-routes', createOneWayRoute)
router.patch('/one-way-routes/:id', updateOneWayRoute)
router.delete('/one-way-routes/:id', deleteOneWayRoute)

router.get('/round-trip-packages', listRoundTripPackages)
router.post('/round-trip-packages', createRoundTripPackage)
router.patch('/round-trip-packages/:id', updateRoundTripPackage)
router.delete('/round-trip-packages/:id', deleteRoundTripPackage)

router.get('/surcharges', listSurcharges)
router.post('/surcharges', createSurcharge)
router.patch('/surcharges/:id', updateSurcharge)
router.delete('/surcharges/:id', deleteSurcharge)

module.exports = router
