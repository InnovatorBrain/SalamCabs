const jwt = require('jsonwebtoken')

// Protects admin-only routes (booking list/detail/status updates, etc).
// Expects an `Authorization: Bearer <token>` header containing a JWT
// issued by POST /api/admin/auth/login.
const requireAdminAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' })
  }
}

module.exports = { requireAdminAuth }
