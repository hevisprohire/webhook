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
  const apiUrl =
    process.env.WHATSAPP_OTP_API_URL ??
    'https://wtpapi.sms4power.com/api/v1/whatsapp/otp'
  const apiKey = process.env.WHATSAPP_API_KEY
  const sender = process.env.WHATSAPP_SENDER
  const templateId = process.env.WHATSAPP_TEMPLATE_ID

  if (!apiKey) {
    throw new Error('WHATSAPP_API_KEY is not configured')
  }

  if (!sender || !templateId) {
    throw new Error('WHATSAPP_SENDER and WHATSAPP_TEMPLATE_ID are required')
  }

  const url = new URL(apiUrl)
  url.searchParams.set('api_key', apiKey)

  const to = mobile.replace(/\s/g, '')

  const payload: Record<string, unknown> = {
    sender,
    to,
    template_id: templateId,
    sample: { otp },
  }

  const optionalParams = ['pr1', 'pr2', 'pr3', 'pr4', 'pr5'] as const
  for (const key of optionalParams) {
    const value = process.env[`WHATSAPP_OTP_${key.toUpperCase()}`]
    if (value?.trim()) {
      payload[key] = value.trim()
    }
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
