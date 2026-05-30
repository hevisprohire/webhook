export class WhatsAppApiError extends Error {
  status: number
  body: string

  constructor(message: string, status: number, body = '') {
    super(message)
    this.name = 'WhatsAppApiError'
    this.status = status
    this.body = body
  }
}

export async function sendWhatsappOtp(mobile: string, otp: string) {
  const apiUrl = process.env.WHATSAPP_API_URL
  const apiKey = process.env.WHATSAPP_API_KEY
  const sender = process.env.WHATSAPP_SENDER
  const templateId = process.env.WHATSAPP_TEMPLATE_ID

  if (!apiUrl || !apiKey) {
    throw new Error('WhatsApp API credentials are not configured')
  }

  if (!sender || !templateId) {
    throw new Error('WHATSAPP_SENDER and WHATSAPP_TEMPLATE_ID are required')
  }

  const url = new URL(apiUrl)
  url.searchParams.set('api_key', apiKey)

  const to = mobile.replace(/\s/g, '')
  const supportContact =
    process.env.WHATSAPP_SUPPORT_CONTACT ?? 'our support team'

  // sms4power maps {{1}} → bodyvar0, {{2}} → bodyvar1
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message_type: 'text',
      sender,
      to,
      template_id: templateId,
      bodyvar0: otp,
      bodyvar1: supportContact,
    }),
  })

  const text = await response.text()
  let data: unknown = text

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // keep raw text
  }

  if (!response.ok) {
    throw new WhatsAppApiError(
      `WhatsApp API error: ${response.status}`,
      response.status,
      text
    )
  }

  return data
}
