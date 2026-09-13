const mongoose = require('mongoose')

const { Schema } = mongoose

const OtpSessionSchema = new Schema(
  {
    phone: { type: String, required: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
)

// MongoDB removes expired OTP rows automatically — no cron job needed.
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('OtpSession', OtpSessionSchema)
