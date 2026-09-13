const Vehicle = require('../models/Vehicle')
const OneWayRoute = require('../models/OneWayRoute')
const RoundTripPackage = require('../models/RoundTripPackage')
const Surcharge = require('../models/Surcharge')
const cloudinary = require('../config/cloudinary')

// Best-effort cleanup — never let a Cloudinary hiccup block the DB write the
// admin is actually waiting on.
const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('[cloudinary] failed to delete asset', publicId, error.message)
  }
}

const SORT = { order: 1, createdAt: 1 }

// Normalizes a `{ vehicleId: price }` request body into a plain object of
// finite, non-negative numbers so bad input can never corrupt the price map.
const sanitizePrices = (prices) => {
  const clean = {}
  if (!prices || typeof prices !== 'object') return clean
  Object.entries(prices).forEach(([vehicleId, price]) => {
    const num = Number(price)
    if (vehicleId && Number.isFinite(num) && num >= 0) {
      clean[vehicleId.trim().toLowerCase()] = num
    }
  })
  return clean
}

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/* ------------------------------- Vehicles -------------------------------- */

const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({}).sort(SORT)
    return res.json({ success: true, vehicles })
  } catch (error) {
    return next(error)
  }
}

const createVehicle = async (req, res, next) => {
  try {
    const {
      name,
      nameAr,
      category,
      categoryAr,
      description,
      descriptionAr,
      rating,
      pax,
      luggage,
      image,
      imagePublicId,
      order,
      isActive,
    } = req.body || {}

    if (!name || !pax || !luggage || !image) {
      return res.status(400).json({
        success: false,
        message: 'name, pax, luggage and image are required',
      })
    }

    const vehicleId = slugify(req.body?.vehicleId || name)
    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Could not derive a valid vehicleId from name' })
    }

    const exists = await Vehicle.exists({ vehicleId })
    if (exists) {
      return res.status(409).json({ success: false, message: `A vehicle with id "${vehicleId}" already exists` })
    }

    const vehicle = await Vehicle.create({
      vehicleId,
      name,
      nameAr: nameAr || '',
      category: category || '',
      categoryAr: categoryAr || '',
      description: description || '',
      descriptionAr: descriptionAr || '',
      rating: rating !== undefined && rating !== '' ? Number(rating) : 4.8,
      pax,
      luggage,
      image,
      imagePublicId: imagePublicId || '',
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    return res.status(201).json({ success: true, vehicle })
  } catch (error) {
    return next(error)
  }
}

const updateVehicle = async (req, res, next) => {
  try {
    const {
      name,
      nameAr,
      category,
      categoryAr,
      description,
      descriptionAr,
      rating,
      pax,
      luggage,
      image,
      imagePublicId,
      order,
      isActive,
    } = req.body || {}
    const update = {}
    if (name !== undefined) update.name = name
    if (nameAr !== undefined) update.nameAr = nameAr
    if (category !== undefined) update.category = category
    if (categoryAr !== undefined) update.categoryAr = categoryAr
    if (description !== undefined) update.description = description
    if (descriptionAr !== undefined) update.descriptionAr = descriptionAr
    if (rating !== undefined && rating !== '') update.rating = Number(rating)
    if (pax !== undefined) update.pax = pax
    if (luggage !== undefined) update.luggage = luggage
    if (image !== undefined) update.image = image
    if (imagePublicId !== undefined) update.imagePublicId = imagePublicId
    if (order !== undefined) update.order = Number(order) || 0
    if (isActive !== undefined) update.isActive = Boolean(isActive)

    const previous = image !== undefined ? await Vehicle.findById(req.params.id) : null

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' })
    }

    // Photo was replaced with a different Cloudinary asset — remove the old one.
    if (previous && previous.imagePublicId && previous.imagePublicId !== imagePublicId) {
      destroyCloudinaryAsset(previous.imagePublicId)
    }

    return res.json({ success: true, vehicle })
  } catch (error) {
    return next(error)
  }
}

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' })
    }
    destroyCloudinaryAsset(vehicle.imagePublicId)
    return res.json({ success: true, message: `Vehicle "${vehicle.name}" deleted successfully` })
  } catch (error) {
    return next(error)
  }
}

/* ----------------------------- One-way routes ----------------------------- */

const listOneWayRoutes = async (req, res, next) => {
  try {
    const oneWayRoutes = await OneWayRoute.find({}).sort(SORT)
    return res.json({ success: true, oneWayRoutes })
  } catch (error) {
    return next(error)
  }
}

const createOneWayRoute = async (req, res, next) => {
  try {
    const { fromLabel, fromLabelAr, toLabel, toLabelAr, prices, order, isActive } = req.body || {}

    if (!fromLabel || !toLabel) {
      return res.status(400).json({ success: false, message: 'fromLabel and toLabel are required' })
    }

    const route = await OneWayRoute.create({
      fromLabel,
      fromLabelAr: fromLabelAr || '',
      toLabel,
      toLabelAr: toLabelAr || '',
      prices: sanitizePrices(prices),
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    return res.status(201).json({ success: true, route })
  } catch (error) {
    return next(error)
  }
}

const updateOneWayRoute = async (req, res, next) => {
  try {
    const { fromLabel, fromLabelAr, toLabel, toLabelAr, prices, order, isActive } = req.body || {}
    const update = {}
    if (fromLabel !== undefined) update.fromLabel = fromLabel
    if (fromLabelAr !== undefined) update.fromLabelAr = fromLabelAr
    if (toLabel !== undefined) update.toLabel = toLabel
    if (toLabelAr !== undefined) update.toLabelAr = toLabelAr
    if (prices !== undefined) update.prices = sanitizePrices(prices)
    if (order !== undefined) update.order = Number(order) || 0
    if (isActive !== undefined) update.isActive = Boolean(isActive)

    const route = await OneWayRoute.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' })
    }

    return res.json({ success: true, route })
  } catch (error) {
    return next(error)
  }
}

const deleteOneWayRoute = async (req, res, next) => {
  try {
    const route = await OneWayRoute.findByIdAndDelete(req.params.id)
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' })
    }
    return res.json({ success: true, message: 'Route deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

/* --------------------------- Round-trip packages --------------------------- */

const listRoundTripPackages = async (req, res, next) => {
  try {
    const roundTripPackages = await RoundTripPackage.find({}).sort(SORT)
    return res.json({ success: true, roundTripPackages })
  } catch (error) {
    return next(error)
  }
}

const cleanLegs = (legs) =>
  Array.isArray(legs) ? legs.map((leg) => String(leg).trim()).filter(Boolean) : []

const createRoundTripPackage = async (req, res, next) => {
  try {
    const { legs, legsAr, prices, order, isActive } = req.body || {}
    const cleanedLegs = cleanLegs(legs)

    if (cleanedLegs.length < 2) {
      return res.status(400).json({ success: false, message: 'A package needs at least 2 legs' })
    }

    const pkg = await RoundTripPackage.create({
      legs: cleanedLegs,
      legsAr: cleanLegs(legsAr),
      prices: sanitizePrices(prices),
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    return res.status(201).json({ success: true, package: pkg })
  } catch (error) {
    return next(error)
  }
}

const updateRoundTripPackage = async (req, res, next) => {
  try {
    const { legs, legsAr, prices, order, isActive } = req.body || {}
    const update = {}

    if (legs !== undefined) {
      const cleanedLegs = cleanLegs(legs)
      if (cleanedLegs.length < 2) {
        return res.status(400).json({ success: false, message: 'A package needs at least 2 legs' })
      }
      update.legs = cleanedLegs
    }
    if (legsAr !== undefined) update.legsAr = cleanLegs(legsAr)
    if (prices !== undefined) update.prices = sanitizePrices(prices)
    if (order !== undefined) update.order = Number(order) || 0
    if (isActive !== undefined) update.isActive = Boolean(isActive)

    const pkg = await RoundTripPackage.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' })
    }

    return res.json({ success: true, package: pkg })
  } catch (error) {
    return next(error)
  }
}

const deleteRoundTripPackage = async (req, res, next) => {
  try {
    const pkg = await RoundTripPackage.findByIdAndDelete(req.params.id)
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' })
    }
    return res.json({ success: true, message: 'Package deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

/* -------------------------------- Surcharges -------------------------------- */

const listSurcharges = async (req, res, next) => {
  try {
    const surcharges = await Surcharge.find({}).sort(SORT)
    return res.json({ success: true, surcharges })
  } catch (error) {
    return next(error)
  }
}

const createSurcharge = async (req, res, next) => {
  try {
    const { label, labelAr, amount, triggerStage, triggerMatchLabel, appliesToVehicleIds, order, isActive } =
      req.body || {}

    if (!label || amount === undefined || !['pickup', 'dropoff'].includes(triggerStage)) {
      return res.status(400).json({
        success: false,
        message: 'label, amount and a valid triggerStage ("pickup" or "dropoff") are required',
      })
    }

    const key = slugify(req.body?.key || label)
    const exists = await Surcharge.exists({ key })
    if (exists) {
      return res.status(409).json({ success: false, message: `A surcharge with id "${key}" already exists` })
    }

    const surcharge = await Surcharge.create({
      key,
      label,
      labelAr: labelAr || '',
      amount: Number(amount) || 0,
      triggerStage,
      triggerMatchLabel: triggerMatchLabel || '',
      appliesToVehicleIds: Array.isArray(appliesToVehicleIds) ? appliesToVehicleIds : [],
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    return res.status(201).json({ success: true, surcharge })
  } catch (error) {
    return next(error)
  }
}

const updateSurcharge = async (req, res, next) => {
  try {
    const { label, labelAr, amount, triggerStage, triggerMatchLabel, appliesToVehicleIds, order, isActive } =
      req.body || {}
    const update = {}
    if (label !== undefined) update.label = label
    if (labelAr !== undefined) update.labelAr = labelAr
    if (amount !== undefined) update.amount = Number(amount) || 0
    if (triggerStage !== undefined) {
      if (!['pickup', 'dropoff'].includes(triggerStage)) {
        return res.status(400).json({ success: false, message: 'triggerStage must be "pickup" or "dropoff"' })
      }
      update.triggerStage = triggerStage
    }
    if (triggerMatchLabel !== undefined) update.triggerMatchLabel = triggerMatchLabel
    if (appliesToVehicleIds !== undefined) {
      update.appliesToVehicleIds = Array.isArray(appliesToVehicleIds) ? appliesToVehicleIds : []
    }
    if (order !== undefined) update.order = Number(order) || 0
    if (isActive !== undefined) update.isActive = Boolean(isActive)

    const surcharge = await Surcharge.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!surcharge) {
      return res.status(404).json({ success: false, message: 'Surcharge not found' })
    }

    return res.json({ success: true, surcharge })
  } catch (error) {
    return next(error)
  }
}

const deleteSurcharge = async (req, res, next) => {
  try {
    const surcharge = await Surcharge.findByIdAndDelete(req.params.id)
    if (!surcharge) {
      return res.status(404).json({ success: false, message: 'Surcharge not found' })
    }
    return res.json({ success: true, message: 'Surcharge deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
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
}
