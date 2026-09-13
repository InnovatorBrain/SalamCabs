const Vehicle = require('../models/Vehicle')
const OneWayRoute = require('../models/OneWayRoute')
const RoundTripPackage = require('../models/RoundTripPackage')
const Surcharge = require('../models/Surcharge')

// GET /api/rate-card — public, combined snapshot of everything the
// customer-facing booking form needs. Only active records are returned,
// sorted the same way the admin panel orders them.
const getRateCard = async (req, res, next) => {
  try {
    const sort = { order: 1, createdAt: 1 }
    const activeFilter = { isActive: true }

    const [vehicles, oneWayRoutes, roundTripPackages, surcharges] = await Promise.all([
      Vehicle.find(activeFilter).sort(sort),
      OneWayRoute.find(activeFilter).sort(sort),
      RoundTripPackage.find(activeFilter).sort(sort),
      Surcharge.find(activeFilter).sort(sort),
    ])

    return res.json({
      success: true,
      vehicles,
      oneWayRoutes,
      roundTripPackages,
      surcharges,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { getRateCard }
