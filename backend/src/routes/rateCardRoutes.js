const express = require('express')
const { getRateCard } = require('../controllers/rateCardController')

const router = express.Router()

// Public — the customer-facing booking form needs this without logging in.
router.get('/', getRateCard)

module.exports = router
