const { verifyOtpToken } = require('../utils/otpToken')
const { digitsOnly } = require('../utils/phone')

const normalizeE164 = (value) => {
  const digits = digitsOnly(value)
  return digits ? `+${digits}` : null
}

/**
 * Booking creation requires a short-lived JWT issued by POST /api/otp/verify.
 * The token's phone must match the phone on the booking payload.
 */
const requireOtpVerification = (req, res, next) => {
  if (process.env.OTP_REQUIRED === 'false') {
    return next()
  }

  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Phone verification required. Please verify your WhatsApp number first.',
    })
  }

  try {
    const decoded = verifyOtpToken(token)
    const payloadPhone = normalizeE164(req.body?.phone)

    if (!payloadPhone || normalizeE164(decoded.phone) !== payloadPhone) {
      return res.status(403).json({
        success: false,
        message: 'Verified phone does not match the booking phone number.',
      })
    }

    req.verifiedPhone = payloadPhone
    return next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Verification expired or invalid. Please verify your WhatsApp number again.',
    })
  }
}

module.exports = { requireOtpVerification }
