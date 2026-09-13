const jwt = require('jsonwebtoken')

const OTP_TOKEN_PURPOSE = 'whatsapp_otp_verified'

const getSecret = () => process.env.OTP_JWT_SECRET || process.env.JWT_SECRET

const signOtpToken = (phone) =>
  jwt.sign({ phone, purpose: OTP_TOKEN_PURPOSE }, getSecret(), {
    expiresIn: process.env.OTP_JWT_EXPIRES_IN || '15m',
  })

const verifyOtpToken = (token) => {
  const decoded = jwt.verify(token, getSecret())
  if (decoded.purpose !== OTP_TOKEN_PURPOSE || !decoded.phone) {
    throw new Error('Invalid OTP token')
  }
  return decoded
}

module.exports = { signOtpToken, verifyOtpToken, OTP_TOKEN_PURPOSE }
