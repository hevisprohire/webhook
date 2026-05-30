import { NextRequest, NextResponse } from 'next/server'
import {
  getOtpDebugInfo,
  hasPendingOtp,
  isRedisConfigured,
  normalizeMobileForOtp,
  verifyOtp as verifyStoredOtp,
} from '@/lib/otp-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile, otp } = body

    if (!mobile || typeof mobile !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Mobile number required' },
        { status: 400 }
      )
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, message: 'OTP required' },
        { status: 400 }
      )
    }

    const normalizedMobile = normalizeMobileForOtp(mobile)
    const isValid = await verifyStoredOtp(normalizedMobile, otp)

    if (!isValid) {
      const debug = getOtpDebugInfo(normalizedMobile)
      const pending = await hasPendingOtp(normalizedMobile)

      let hint = isRedisConfigured()
        ? 'Use the same Vercel URL for send-otp and verify-otp with the same mobile.'
        : 'Redis not configured on this server — set UPSTASH env on Vercel and redeploy.'

      if (pending) {
        hint =
          'OTP is waiting in Redis but the code does not match. sms4power may send its own OTP — confirm WhatsApp code matches what /api/send-otp stored, or ask sms4power for OTP verify API.'
      } else if (isRedisConfigured()) {
        hint =
          'No OTP found for this mobile — call /api/send-otp first on the same URL, use mobileKey below, and verify within 5 minutes.'
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired OTP',
          hint,
          debug: {
            ...debug,
            otpPending: pending,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
