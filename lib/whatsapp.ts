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

export type SendWhatsappOtpResult = {
  providerResponse: unknown
  /** OTP to store for verify — provider may return a different code than we generated */
  otpToStore: string
}

function extractOtpFromProviderResponse(
  data: unknown,
  fallback: string,
): string {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const root = data as Record<string, unknown>

  const candidates: unknown[] = [
    root.otp,
    root.code,
    (root.sample as Record<string, unknown> | undefined)?.otp,
    (root.data as Record<string, unknown> | undefined)?.otp,
  ]

  const results = root.results
  if (Array.isArray(results) && results[0] && typeof results[0] === 'object') {
    const first = results[0] as Record<string, unknown>
    candidates.push(first.otp, first.code)
  }

  for (const value of candidates) {
    if (typeof value === 'string' && /^\d{4,8}$/.test(value.trim())) {
      return value.trim()
    }
    if (typeof value === 'number' && value >= 1000 && value <= 99999999) {
      return String(value)
    }
  }

  return fallback
}

export async function sendWhatsappOtp(
  mobile: string,
  otp: string,
): Promise<SendWhatsappOtpResult> {
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

  const otpToStore = extractOtpFromProviderResponse(data, otp)

  return { providerResponse: data, otpToStore }
}
