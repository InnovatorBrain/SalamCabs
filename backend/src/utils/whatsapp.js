/**
 * Sends OTP codes through the Meta WhatsApp Cloud API.
 *
 * When WHATSAPP_OTP_MOCK=true (the default locally), nothing is sent externally —
 * the code is logged to the server console so the full booking flow can be demoed
 * without a Meta Business account.
 */

const WHATSAPP_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0'

const isMockMode = () => process.env.WHATSAPP_OTP_MOCK !== 'false'

const getConfig = () => ({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  templateName: process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'salam_cab_otp',
  templateLang: process.env.WHATSAPP_OTP_TEMPLATE_LANG || 'en',
})

const sendWhatsAppOtp = async ({ to, code }) => {
  if (isMockMode()) {
    console.log(`[whatsapp:mock] OTP for ${to}: ${code}`)
    return { status: 'mock', messageId: `mock-${Date.now()}` }
  }

  const { phoneNumberId, accessToken, templateName, templateLang } = getConfig()

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'WhatsApp is not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in backend/.env',
    )
  }

  const url = `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const detail = data?.error?.message || JSON.stringify(data)
    throw new Error(`WhatsApp API error: ${detail}`)
  }

  console.log(`[whatsapp] OTP sent to ${to} (message id: ${data.messages?.[0]?.id || 'unknown'})`)
  return { status: 'sent', messageId: data.messages?.[0]?.id }
}

module.exports = { sendWhatsAppOtp, isMockMode }
