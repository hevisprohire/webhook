import { getRedis, isRedisConfigured } from './redis'

const OTP_TTL_SECONDS = 5 * 60
const OTP_KEY_PREFIX = 'hevis:otp:'

type OtpEntry = {
  otp: string
  expiresAt: number
}

const memoryStore = new Map<string, OtpEntry>()

/** Canonical key: digits only, 10-digit Indian numbers get 91 prefix */
export function normalizeMobileForOtp(mobile: string): string {
  const digits = mobile.replace(/\D/g, '')

  if (digits.length === 10) {
    return `91${digits}`
  }

  if (digits.startsWith('91') && digits.length === 12) {
    return digits
  }

  return digits
}

function otpKey(mobile: string) {
  return `${OTP_KEY_PREFIX}${normalizeMobileForOtp(mobile)}`
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveOtp(mobile: string, otp: string) {
  const key = otpKey(mobile)
  const redis = getRedis()

  if (redis) {
    await redis.set(key, otp, { ex: OTP_TTL_SECONDS })
    return
  }

  memoryStore.set(normalizeMobileForOtp(mobile), {
    otp,
    expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
  })
}

export async function hasPendingOtp(mobile: string): Promise<boolean> {
  const redis = getRedis()
  const key = otpKey(mobile)

  if (redis) {
    const exists = await redis.exists(key)
    return exists === 1
  }

  const entry = memoryStore.get(normalizeMobileForOtp(mobile))
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(normalizeMobileForOtp(mobile))
    return false
  }
  return true
}

export { isRedisConfigured }

export async function verifyOtp(mobile: string, otp: string): Promise<boolean> {
  const normalizedOtp = otp.replace(/\D/g, '').trim()
  const redis = getRedis()
  const key = otpKey(mobile)

  if (redis) {
    const stored = await redis.get<string>(key)

    if (!stored || stored !== normalizedOtp) {
      return false
    }

    await redis.del(key)
    return true
  }

  const normalizedMobile = normalizeMobileForOtp(mobile)
  const entry = memoryStore.get(normalizedMobile)

  if (!entry) {
    return false
  }

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(normalizedMobile)
    return false
  }

  if (entry.otp !== normalizedOtp) {
    return false
  }

  memoryStore.delete(normalizedMobile)
  return true
}

export function getOtpDebugInfo(mobile: string) {
  return {
    storage: isRedisConfigured() ? 'redis' : 'memory',
    mobileKey: normalizeMobileForOtp(mobile),
    redisKey: otpKey(mobile),
  }
}
