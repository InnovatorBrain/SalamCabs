const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// The admin account is provisioned from environment variables (no separate
// user database/collection needed for a single-admin demo). The password is
// hashed once in memory so it is never compared as a raw string.
let cachedPasswordHash = null

const getAdminPasswordHash = () => {
  if (!cachedPasswordHash) {
    cachedPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || '', 10)
  }
  return cachedPasswordHash
}

const signToken = (email) =>
  jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })

// POST /api/admin/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
    const emailMatches = String(email).toLowerCase() === adminEmail
    const passwordMatches = bcrypt.compareSync(String(password), getAdminPasswordHash())

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = signToken(adminEmail)

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { email: adminEmail },
    })
  } catch (error) {
    return next(error)
  }
}

// POST /api/admin/auth/logout
// JWTs are stateless, so there is nothing to invalidate server-side — the
// frontend simply discards its stored token. This endpoint exists so the
// client has a single, consistent place to call on logout.
const logout = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' })
}

// GET /api/admin/auth/me
const me = async (req, res) => {
  return res.json({ success: true, admin: req.admin })
}

module.exports = { login, logout, me }
