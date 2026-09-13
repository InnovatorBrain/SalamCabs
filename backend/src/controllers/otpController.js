const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const OtpSession = require('../models/OtpSession')
const { toE164, toWhatsAppRecipient } = require('../utils/phone')
const { sendWhatsAppOtp, isMockMode } = require('../utils/whatsapp')
const { signOtpToken } = require('../utils/otpToken')

const OTP_LENGTH = Number(process.env.OTP_LENGTH) || 4
const OTP_TTL_MS = (Number(process.env.OTP_TTL_MINUTES) || 5) * 60 * 1000
const RESEND_COOLDOWN_MS = (Number(process.env.OTP_RESEND_SECONDS) || 60) * 1000
const MAX_VERIFY_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5

const generateOtpCode = () => {
  const max = 10 ** OTP_LENGTH
  const value = crypto.randomInt(0, max)
  return String(value).padStart(OTP_LENGTH, '0')
}

const normalizePhoneInput = (countryCode, phone) => {
  const e164 = toE164(countryCode, phone)
  if (!e164) {
    return { error: 'Please provide a valid mobile number with country code' }
  }
  return { e164, whatsappTo: toWhatsAppRecipient(e164) }
}

// POST /api/otp/send
const sendOtp = async (req, res, next) => {
  try {
    const { countryCode, phone } = req.body || {}
    if (!countryCode || !phone) {
      return res.status(400).json({ success: false, message: 'countryCode and phone are required' })
    }

    const normalized = normalizePhoneInput(countryCode, phone)
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error })
    }

    const existing = await OtpSession.findOne({ phone: normalized.e164 }).sort({ createdAt: -1 })
    if (existing?.lastSentAt && Date.now() - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt.getTime())) / 1000,
      )
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another code`,
      })
    }

    const code = generateOtpCode()
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await OtpSession.findOneAndUpdate(
      { phone: normalized.e164 },
      { codeHash, attempts: 0, lastSentAt: new Date(), expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await sendWhatsAppOtp({ to: normalized.whatsappTo, code })

    const payload = {
      success: true,
      message: isMockMode()
        ? 'Demo OTP generated — check the server console or the code shown below'
        : 'Verification code sent to your WhatsApp',
      mock: isMockMode(),
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      otpLength: OTP_LENGTH,
    }

    // Only expose the plaintext code in mock mode so local demos still work.
    if (isMockMode()) {
      payload.demoCode = code
    }

    return res.status(200).json(payload)
  } catch (error) {
    return next(error)
  }
}

// POST /api/otp/verify
const verifyOtp = async (req, res, next) => {
  try {
    const { countryCode, phone, code } = req.body || {}
    if (!countryCode || !phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'countryCode, phone and code are required',
      })
    }

    const normalized = normalizePhoneInput(countryCode, phone)
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error })
    }

    const session = await OtpSession.findOne({ phone: normalized.e164 })
    if (!session || session.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Code expired. Please request a new one.' })
    }

    if (session.attempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      })
    }

    const isMatch = await bcrypt.compare(String(code).trim(), session.codeHash)
    if (!isMatch) {
      session.attempts += 1
      await session.save()
      return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' })
    }

    await OtpSession.deleteOne({ _id: session._id })

    const token = signOtpToken(normalized.e164)

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      token,
      phone: normalized.e164,
      expiresIn: process.env.OTP_JWT_EXPIRES_IN || '15m',
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { sendOtp, verifyOtp }
