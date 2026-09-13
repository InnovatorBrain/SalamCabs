const express = require('express')
const { submitContact } = require('../controllers/contactController')

const router = express.Router()

// Public — the Contact page form emails the site owner directly.
router.post('/', submitContact)

module.exports = router
