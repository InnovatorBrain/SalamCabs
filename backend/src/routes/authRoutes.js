const express = require('express')
const { login, logout, me } = require('../controllers/authController')
const { requireAdminAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', requireAdminAuth, me)

module.exports = router
