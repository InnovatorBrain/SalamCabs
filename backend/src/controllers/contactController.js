const { sendContactMessageEmail } = require('../utils/mailer')

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'subject', 'message']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/contact — emails the message straight to the Salam Cab inbox.
// No database storage; this is a direct notification, not a booking record.
//
// The actual SMTP round-trip to Hostinger regularly takes 2-3+ seconds (a
// fresh TLS handshake per send, plus provider-side delay) and occasionally
// longer — that used to make the form sit on a spinner for that whole time
// and even risk hitting the frontend's request timeout on a slow moment. We
// now validate synchronously (fast, always instant) and send the email in
// the background: the visitor gets an immediate, reliable confirmation, and
// any real delivery failure is still logged server-side for us to check.
const submitContact = async (req, res, next) => {
  try {
    const payload = req.body || {}

    const missing = REQUIRED_FIELDS.filter((field) => {
      const value = payload[field]
      return value === undefined || value === null || String(value).trim() === ''
    })

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`,
      })
    }

    if (!EMAIL_REGEX.test(String(payload.email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
    }

    res.status(200).json({ success: true, message: 'Message sent successfully' })

    sendContactMessageEmail(payload)
      .then((result) => {
        if (result.status === 'failed') {
          console.error(`[contact] Email delivery failed for message from ${payload.email}:`, result.error)
        }
      })
      .catch((error) => {
        console.error(`[contact] Unexpected error sending message from ${payload.email}:`, error.message)
      })
  } catch (error) {
    return next(error)
  }
}

module.exports = { submitContact }
