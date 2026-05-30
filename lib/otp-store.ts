import { getRedis } from './redis'

const OTP_TTL_SECONDS = 5 * 60
const OTP_KEY_PREFIX = 'hevis:otp:'

type OtpEntry = {
  otp: string
  expiresAt: number
}

const memoryStore = new Map<string, OtpEntry>()

function normalizeMobile(mobile: string) {
  return mobile.replace(/\D/g, '')
}

function otpKey(mobile: string) {
  return `${OTP_KEY_PREFIX}${normalizeMobile(mobile)}`
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveOtp(mobile: string, otp: string) {
  const redis = getRedis()

  if (redis) {
    await redis.set(otpKey(mobile), otp, { ex: OTP_TTL_SECONDS })
    return
  }

  memoryStore.set(normalizeMobile(mobile), {
    otp,
    expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
  })
}

export async function verifyOtp(mobile: string, otp: string): Promise<boolean> {
  const redis = getRedis()

  if (redis) {
    const key = otpKey(mobile)
    const stored = await redis.get<string>(key)

    if (!stored || stored !== otp) {
      return false
    }

    await redis.del(key)
    return true
  }

  const entry = memoryStore.get(normalizeMobile(mobile))

  if (!entry) {
    return false
  }

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(normalizeMobile(mobile))
    return false
  }

  if (entry.otp !== otp) {
    return false
  }

  memoryStore.delete(normalizeMobile(mobile))
  return true
}
