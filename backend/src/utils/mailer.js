const nodemailer = require('nodemailer')

let transporterPromise = null
let usingEthereal = false

/**
 * Lazily builds (and caches) a nodemailer transporter.
 *
 * If SMTP_HOST/SMTP_USER/SMTP_PASS are configured, a real SMTP transporter
 * is used. Otherwise an Ethereal (https://ethereal.email) test account is
 * created automatically so booking confirmation emails can be demoed end
 * to end without any real mailbox — every sent message gets a shareable
 * preview URL that is logged to the console and returned to the caller.
 */
const getTransporter = async () => {
  if (transporterPromise) return transporterPromise

  transporterPromise = (async () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      usingEthereal = false
      return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        // Reuses a warm connection across sends instead of paying a fresh
        // TLS handshake + auth round-trip every time — noticeably faster
        // and less prone to hanging on a slow moment with Hostinger's SMTP.
        pool: true,
        maxConnections: 3,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      })
    }

    console.warn(
      '[mailer] No SMTP_HOST/SMTP_USER/SMTP_PASS configured — creating a temporary Ethereal ' +
        'test inbox so booking emails can still be sent for demo purposes. ' +
        'Set real SMTP credentials in backend/.env to send actual emails.',
    )
    const testAccount = await nodemailer.createTestAccount()
    usingEthereal = true
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  })()

  return transporterPromise
}

const currency = (value) => (typeof value === 'number' ? `${value.toLocaleString()} SAR` : 'On request')

// Kept in sync with frontend/src/config/contact.ts so the confirmation email
// and the website always show the same support number and email address.
const CONTACT_PHONE_DISPLAY = '+966 59 320 5151'
const CONTACT_WHATSAPP_LINK = 'https://wa.me/966593205151'
const CONTACT_EMAIL = 'admin@salamcabs.com'

const buildConfirmationEmailHtml = (booking) => {
  const rows = [
    ['Booking Reference', booking.bookingId],
    ['Trip Type', booking.tripTypeLabel || booking.tripType],
    ['Route', booking.route || '—'],
    ['Date', booking.date],
    ['Time', booking.time],
    ['Passengers', booking.passengers],
    ['Vehicle', booking.vehicleName || booking.vehicle || 'To be confirmed'],
    ['Flight No.', booking.flightNo || '—'],
    ['Payment Method', 'Cash on Arrival'],
  ]

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #eef0f3;">${label}</td>
          <td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #eef0f3;text-align:end;">${value}</td>
        </tr>`,
    )
    .join('')

  return `
  <div style="background:#f9f7f2;padding:32px 16px;font-family:Segoe UI, Arial, sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <div style="background:#1a1a1a;padding:28px 24px;text-align:center;">
        <h1 style="color:#ffc107;margin:0;font-size:20px;letter-spacing:0.02em;">Salam Cab</h1>
        <p style="color:#d1d1d1;margin:6px 0 0;font-size:13px;">Booking Confirmation</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="font-size:15px;color:#111827;margin:0 0 4px;">Assalamu Alaikum ${booking.fullName || ''},</p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px;">
          Thank you for booking with Salam Cab. We've received your request and it is
          currently <strong>${booking.status === 'confirmed' ? 'confirmed' : 'pending confirmation'}</strong>.
          Our team will contact you shortly to finalize the details.
        </p>

        <table style="width:100%;border-collapse:collapse;background:#fafbfc;border-radius:10px;overflow:hidden;">
          ${rowsHtml}
        </table>

        <div style="margin-top:20px;padding:16px;background:#fff8e1;border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;color:#a06800;font-weight:600;">Total Estimate</span>
          <span style="font-size:18px;color:#a06800;font-weight:700;">${currency(booking.totalPrice)}</span>
        </div>

        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">
          Payment is collected in cash directly from the driver on arrival — no advance payment
          is required. If you need to make any changes, reply to this email at
          <a href="mailto:${CONTACT_EMAIL}" style="color:#a06800;font-weight:600;">${CONTACT_EMAIL}</a> or reach us on WhatsApp.
        </p>

        <div style="margin-top:16px;padding:16px;background:#fafbfc;border-radius:10px;text-align:center;">
          <p style="font-size:13px;color:#6b7280;margin:0 0 10px;">Have a question about your booking?</p>
          <a href="${CONTACT_WHATSAPP_LINK}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 20px;border-radius:999px;">
            Chat on WhatsApp: ${CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </div>
      <div style="background:#f9f7f2;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 4px;">
          Need help? Call/WhatsApp ${CONTACT_PHONE_DISPLAY} or email
          <a href="mailto:${CONTACT_EMAIL}" style="color:#9ca3af;">${CONTACT_EMAIL}</a>
        </p>
        <p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} Salam Cab. All rights reserved.</p>
      </div>
    </div>
  </div>`
}

/**
 * Sends the booking confirmation email and returns a status object that
 * the caller can persist on the booking document.
 */
const sendBookingConfirmationEmail = async (booking) => {
  try {
    const transporter = await getTransporter()
    const fromName = process.env.MAIL_FROM_NAME || 'Salam Cab'
    const fromAddress = process.env.MAIL_FROM_ADDRESS || 'admin@salamcabs.com'

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: booking.email,
      subject: `Salam Cab — Booking Confirmation (${booking.bookingId})`,
      html: buildConfirmationEmailHtml(booking),
    })

    const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) || undefined : undefined

    if (previewUrl) {
      console.log(`[mailer] Confirmation email preview (${booking.bookingId}): ${previewUrl}`)
    } else {
      console.log(`[mailer] Confirmation email sent to ${booking.email} (${booking.bookingId})`)
    }

    return {
      status: 'sent',
      messageId: info.messageId,
      previewUrl,
      sentAt: new Date(),
    }
  } catch (error) {
    console.error(`[mailer] Failed to send confirmation email for ${booking.bookingId}:`, error.message)
    return {
      status: 'failed',
      error: error.message,
    }
  }
}

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const buildContactNotificationHtml = ({ name, email, phone, subject, message }) => `
  <div style="background:#f9f7f2;padding:32px 16px;font-family:Segoe UI, Arial, sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <div style="background:#1a1a1a;padding:28px 24px;text-align:center;">
        <h1 style="color:#ffc107;margin:0;font-size:20px;letter-spacing:0.02em;">Salam Cab</h1>
        <p style="color:#d1d1d1;margin:6px 0 0;font-size:13px;">New Contact Form Message</p>
      </div>
      <div style="padding:28px 24px;">
        <table style="width:100%;border-collapse:collapse;background:#fafbfc;border-radius:10px;overflow:hidden;">
          ${[
            ['Name', escapeHtml(name)],
            ['Email', escapeHtml(email)],
            ['Phone', escapeHtml(phone)],
            ['Subject', escapeHtml(subject)],
          ]
            .map(
              ([label, value]) => `
              <tr>
                <td style="padding:10px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #eef0f3;">${label}</td>
                <td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #eef0f3;text-align:end;">${value}</td>
              </tr>`,
            )
            .join('')}
        </table>
        <div style="margin-top:16px;padding:16px;background:#fff8e1;border-radius:10px;">
          <p style="font-size:12px;color:#a06800;font-weight:600;margin:0 0 6px;">Message</p>
          <p style="font-size:14px;color:#111827;line-height:1.6;margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:20px;">
          Reply directly to this email or contact ${escapeHtml(name)} at
          <a href="mailto:${escapeHtml(email)}" style="color:#a06800;font-weight:600;">${escapeHtml(email)}</a>.
        </p>
      </div>
      <div style="background:#f9f7f2;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} Salam Cab. All rights reserved.</p>
      </div>
    </div>
  </div>`

/**
 * Sends the Contact page submission straight to the Salam Cab inbox so no
 * database storage is needed for this — it's a direct notification email.
 */
const sendContactMessageEmail = async ({ name, email, phone, subject, message }) => {
  try {
    const transporter = await getTransporter()
    const fromName = process.env.MAIL_FROM_NAME || 'Salam Cab'
    const fromAddress = process.env.MAIL_FROM_ADDRESS || CONTACT_EMAIL

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Salam Cab Contact Form: ${subject}`,
      html: buildContactNotificationHtml({ name, email, phone, subject, message }),
    })

    const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) || undefined : undefined

    if (previewUrl) {
      console.log(`[mailer] Contact message preview: ${previewUrl}`)
    } else {
      console.log(`[mailer] Contact message from ${email} sent to ${CONTACT_EMAIL}`)
    }

    return { status: 'sent', messageId: info.messageId, previewUrl, sentAt: new Date() }
  } catch (error) {
    console.error('[mailer] Failed to send contact message:', error.message)
    return { status: 'failed', error: error.message }
  }
}

module.exports = { sendBookingConfirmationEmail, sendContactMessageEmail }
