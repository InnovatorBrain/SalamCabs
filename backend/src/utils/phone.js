// Normalizes phone numbers for storage (E.164) and WhatsApp Cloud API delivery.

const digitsOnly = (value = '') => String(value).replace(/\D/g, '')

/**
 * Builds E.164 from a dial code like "+966" and a national number like "593205151".
 * Returns null when the result doesn't look like a real mobile number.
 */
const toE164 = (countryCode, nationalNumber) => {
  const dial = digitsOnly(countryCode)
  const national = digitsOnly(nationalNumber).replace(/^0+/, '')
  if (!dial || national.length < 6) return null
  return `+${dial}${national}`
}

/** WhatsApp Cloud API expects digits only, no leading "+". */
const toWhatsAppRecipient = (e164) => digitsOnly(e164)

module.exports = { digitsOnly, toE164, toWhatsAppRecipient }
