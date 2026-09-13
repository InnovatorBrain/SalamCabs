// One-time migration: seeds the MongoDB rate-card collections
// (Vehicle, OneWayRoute, RoundTripPackage, Surcharge) with the same data
// that used to live in frontend/src/data/rateCard.ts, so nothing is lost
// when the booking form switches from a static file to the database.
//
// Usage: npm run seed:rate-card   (run from the backend/ folder)
// Safe to re-run — it upserts by a stable natural key instead of duplicating.

require('dotenv').config()
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const cloudinary = require('../config/cloudinary')
const Vehicle = require('../models/Vehicle')
const OneWayRoute = require('../models/OneWayRoute')
const RoundTripPackage = require('../models/RoundTripPackage')
const Surcharge = require('../models/Surcharge')

const DEFAULT_IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'vehicles')

// Default vehicle photos ship with the repo as local files and are pushed to
// Cloudinary here with a fixed public_id + overwrite:true, so re-running the
// seed never creates duplicate assets — it just re-syncs the same one. Only
// the resulting secure_url (a permanent, absolute HTTPS link) is ever stored
// in MongoDB — exactly like an admin-uploaded photo.
const uploadDefaultImage = async (vehicleId, filename) => {
  const result = await cloudinary.uploader.upload(path.join(DEFAULT_IMAGES_DIR, filename), {
    public_id: `salam-cab/vehicles/defaults/${vehicleId}`,
    overwrite: true,
    resource_type: 'image',
  })
  return { image: result.secure_url, imagePublicId: result.public_id }
}

const LOCATIONS = {
  jedAirport: { en: 'Jeddah Airport (JED)', ar: 'مطار جدة (JED)' },
  makHotel: { en: 'Makkah Hotel', ar: 'فندق مكة' },
  medHotel: { en: 'Madinah Hotel', ar: 'فندق المدينة' },
  medHotelBadr: { en: 'Madinah Hotel (via Badr Road)', ar: 'فندق المدينة (عبر طريق بدر)' },
  medAirport: { en: 'Madinah Airport (MED)', ar: 'مطار المدينة (MED)' },
  trainStation: { en: 'Haramain Train Station', ar: 'محطة قطار الحرمين' },
  hotelGeneric: { en: 'Hotel (Makkah / Madinah)', ar: 'فندق (مكة / المدينة)' },
  medZiyarat: { en: 'Madinah Ziyarat Tour', ar: 'جولة زيارة المدينة' },
  makZiyarat: { en: 'Makkah Ziyarat Tour', ar: 'جولة زيارة مكة' },
  taif: { en: 'Taif (Return Trip)', ar: 'الطائف (رحلة ذهاب وعودة)' },
}

const loc = (key) => LOCATIONS[key].en
const locAr = (key) => LOCATIONS[key].ar

const VEHICLES = [
  {
    vehicleId: 'sedan',
    name: 'Standard Sedan',
    nameAr: 'سيدان عادية',
    category: 'Sedan',
    categoryAr: 'سيدان',
    description: 'Comfortable sedan for solo travellers and small families.',
    descriptionAr: 'سيدان مريحة للمسافرين الفرديين والعائلات الصغيرة.',
    rating: 4.9,
    pax: '2–3',
    luggage: '2 large + 1 small bag',
    imageFile: 'sedan.jpg',
    order: 0,
  },
  {
    vehicleId: 'starexh1',
    name: 'Starex / H1',
    nameAr: 'ستاريكس / H1',
    category: 'Van',
    categoryAr: 'فان',
    description: 'Spacious van ideal for small groups and Umrah transfers.',
    descriptionAr: 'فان واسعة مثالية للمجموعات الصغيرة ونقل العمرة.',
    rating: 4.8,
    pax: '7–8',
    luggage: '7 large + 1 small bag',
    imageFile: 'starex-h1.jpg',
    order: 1,
  },
  {
    vehicleId: 'staria',
    name: 'Hyundai Staria',
    nameAr: 'هيونداي ستاريا',
    category: 'Premium Van',
    categoryAr: 'فان مميزة',
    description: 'Modern premium van with a stylish, comfortable interior.',
    descriptionAr: 'فان عصرية ومميزة بتصميم داخلي أنيق ومريح.',
    rating: 4.9,
    pax: '7',
    luggage: '7 large + 1 small bag',
    imageFile: 'staria.jpg',
    order: 2,
  },
  {
    vehicleId: 'yukon',
    name: 'GMC Yukon',
    nameAr: 'جي إم سي يوكون',
    category: 'Luxury SUV',
    categoryAr: 'دفع رباعي فاخر',
    description: 'Full-size luxury SUV for premium family travel.',
    descriptionAr: 'دفع رباعي فاخر بحجم كامل لسفر العائلة المميز.',
    rating: 4.9,
    pax: '6',
    luggage: '7 large bags',
    imageFile: 'yukon.jpg',
    order: 3,
  },
  {
    vehicleId: 'hiace',
    name: 'Toyota Hiace',
    nameAr: 'تويوتا هايس',
    category: 'Van',
    categoryAr: 'فان',
    description: 'High-roof van perfect for group airport transfers.',
    descriptionAr: 'فان بسقف مرتفع مثالية لنقل المجموعات من وإلى المطار.',
    rating: 4.7,
    pax: '11',
    luggage: '9 large bags',
    imageFile: 'hiace.jpg',
    order: 4,
  },
  {
    vehicleId: 'coaster',
    name: 'Toyota Coaster',
    nameAr: 'تويوتا كوستر',
    category: 'Bus',
    categoryAr: 'حافلة',
    description: 'Spacious coach for large group pilgrimages and tours.',
    descriptionAr: 'حافلة واسعة للمجموعات الكبيرة والرحلات والحج والعمرة.',
    rating: 4.8,
    pax: '20',
    luggage: '15 large + 5 small bags',
    imageFile: 'coaster.jpg',
    order: 5,
  },
]

const oneWayRoute = (order, from, to, prices) => ({
  fromLabel: loc(from),
  fromLabelAr: locAr(from),
  toLabel: loc(to),
  toLabelAr: locAr(to),
  prices,
  order,
})

const ONE_WAY_ROUTES = [
  oneWayRoute(0, 'jedAirport', 'makHotel', { sedan: 245, starexh1: 270, staria: 295, yukon: 470, hiace: 370, coaster: 570 }),
  oneWayRoute(1, 'makHotel', 'jedAirport', { sedan: 195, starexh1: 250, staria: 270, yukon: 415, hiace: 345, coaster: 470 }),
  oneWayRoute(2, 'jedAirport', 'medHotel', { sedan: 470, starexh1: 515, staria: 570, yukon: 1015, hiace: 615, coaster: 970 }),
  oneWayRoute(3, 'medHotel', 'jedAirport', { sedan: 395, starexh1: 445, staria: 495, yukon: 915, hiace: 570, coaster: 895 }),
  oneWayRoute(4, 'makHotel', 'medHotel', { sedan: 395, starexh1: 445, staria: 495, yukon: 915, hiace: 570, coaster: 895 }),
  oneWayRoute(5, 'medHotel', 'makHotel', { sedan: 395, starexh1: 445, staria: 495, yukon: 915, hiace: 570, coaster: 895 }),
  oneWayRoute(6, 'makHotel', 'medHotelBadr', { sedan: 495, starexh1: 570, staria: 595, yukon: 1115, hiace: 670, coaster: 1095 }),
  oneWayRoute(7, 'medHotelBadr', 'makHotel', { sedan: 495, starexh1: 570, staria: 595, yukon: 1115, hiace: 670, coaster: 1095 }),
  oneWayRoute(8, 'medAirport', 'medHotel', { sedan: 140, starexh1: 170, staria: 190, yukon: 315, hiace: 295, coaster: 395 }),
  oneWayRoute(9, 'medHotel', 'medAirport', { sedan: 110, starexh1: 130, staria: 145, yukon: 270, hiace: 245, coaster: 370 }),
  oneWayRoute(10, 'trainStation', 'hotelGeneric', { sedan: 120, starexh1: 130, staria: 145, yukon: 270, hiace: 245, coaster: 370 }),
  oneWayRoute(11, 'hotelGeneric', 'trainStation', { sedan: 110, starexh1: 120, staria: 130, yukon: 245, hiace: 195, coaster: 370 }),
  oneWayRoute(12, 'medHotel', 'medZiyarat', { sedan: 195, starexh1: 220, staria: 240, yukon: 370, hiace: 310, coaster: 410 }),
  oneWayRoute(13, 'makHotel', 'makZiyarat', { sedan: 210, starexh1: 245, staria: 270, yukon: 415, hiace: 345, coaster: 410 }),
  oneWayRoute(14, 'makHotel', 'taif', { sedan: 395, starexh1: 420, staria: 470, yukon: 870, hiace: 570, coaster: 870 }),
]

const roundTripPackage = (order, legKeys, prices) => ({
  legs: legKeys.map(loc),
  legsAr: legKeys.map(locAr),
  prices,
  order,
})

const ROUND_TRIP_PACKAGES = [
  roundTripPackage(0, ['jedAirport', 'makHotel', 'medHotel', 'medAirport'], {
    sedan: 735,
    starexh1: 835,
    staria: 910,
    yukon: 1610,
    hiace: 1150,
    coaster: 1755,
  }),
  roundTripPackage(1, ['jedAirport', 'makHotel', 'medHotel', 'makHotel', 'jedAirport'], {
    sedan: 1185,
    starexh1: 1350,
    staria: 1450,
    yukon: 2650,
    hiace: 1810,
    coaster: 2750,
  }),
  roundTripPackage(2, ['jedAirport', 'makHotel', 'medHotel', 'jedAirport'], {
    sedan: 1010,
    starexh1: 1110,
    staria: 1210,
    yukon: 2300,
    hiace: 1450,
    coaster: 2260,
  }),
  roundTripPackage(3, ['medAirport', 'makHotel', 'medHotel', 'jedAirport'], {
    sedan: 710,
    starexh1: 835,
    staria: 910,
    yukon: 1610,
    hiace: 1150,
    coaster: 1755,
  }),
]

const SURCHARGES = [
  {
    key: 'jeddah-hajj-pickup',
    label: 'Pickup from Jeddah Hajj Terminal',
    labelAr: 'الالتقاط من محطة الحجاج بجدة',
    amount: 90,
    triggerStage: 'pickup',
    triggerMatchLabel: loc('jedAirport'),
    appliesToVehicleIds: [],
    order: 0,
  },
  {
    key: 'hajj-dropoff',
    label: 'Drop-off at Hajj Terminal — Hiace/Coaster only',
    labelAr: 'التوصيل لمحطة الحجاج — هاي إيس/كوستر فقط',
    amount: 90,
    triggerStage: 'dropoff',
    triggerMatchLabel: '',
    appliesToVehicleIds: ['hiace', 'coaster'],
    order: 1,
  },
]

const run = async () => {
  await connectDB()

  console.log('[seed] Uploading default vehicle photos to Cloudinary…')
  await Promise.all(
    VEHICLES.map(async (v) => {
      const { image, imagePublicId } = await uploadDefaultImage(v.vehicleId, v.imageFile)
      v.image = image
      v.imagePublicId = imagePublicId
    }),
  )

  console.log('[seed] Upserting vehicles…')
  await Promise.all(
    VEHICLES.map((v) => Vehicle.findOneAndUpdate({ vehicleId: v.vehicleId }, v, { upsert: true, new: true })),
  )

  console.log('[seed] Upserting one-way routes…')
  await Promise.all(
    ONE_WAY_ROUTES.map((r) =>
      OneWayRoute.findOneAndUpdate({ fromLabel: r.fromLabel, toLabel: r.toLabel }, r, {
        upsert: true,
        new: true,
      }),
    ),
  )

  console.log('[seed] Upserting round-trip packages…')
  await Promise.all(
    ROUND_TRIP_PACKAGES.map((p) =>
      RoundTripPackage.findOneAndUpdate({ legs: p.legs }, p, { upsert: true, new: true }),
    ),
  )

  console.log('[seed] Upserting surcharges…')
  await Promise.all(
    SURCHARGES.map((s) => Surcharge.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true })),
  )

  const counts = await Promise.all([
    Vehicle.countDocuments(),
    OneWayRoute.countDocuments(),
    RoundTripPackage.countDocuments(),
    Surcharge.countDocuments(),
  ])

  console.log(
    `[seed] Done. Vehicles: ${counts[0]}, One-way routes: ${counts[1]}, Round-trip packages: ${counts[2]}, Surcharges: ${counts[3]}`,
  )

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((error) => {
  console.error('[seed] Failed:', error)
  process.exit(1)
})
