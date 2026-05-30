type OtpEntry = {
  otp: string
  expiresAt: number
}

const otpStore = new Map<string, OtpEntry>()

const OTP_TTL_MS = 5 * 60 * 1000

export function saveOtp(mobile: string, otp: string) {
  otpStore.set(normalizeMobile(mobile), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  })
}

export function verifyOtp(mobile: string, otp: string): boolean {
  const entry = otpStore.get(normalizeMobile(mobile))

  if (!entry) {
    return false
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizeMobile(mobile))
    return false
  }

  if (entry.otp !== otp) {
    return false
  }

  otpStore.delete(normalizeMobile(mobile))
  return true
}

function normalizeMobile(mobile: string) {
  return mobile.replace(/\D/g, '')
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
