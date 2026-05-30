import { NextRequest, NextResponse } from 'next/server'
import {
  generateOtp,
  getOtpDebugInfo,
  hasPendingOtp,
  isRedisConfigured,
  normalizeMobileForOtp,
  saveOtp,
} from '@/lib/otp-store'
import { sendWhatsappOtp, WhatsAppApiError } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile } = body

    if (!mobile || typeof mobile !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Mobile number required' },
        { status: 400 }
      )
    }

    const normalizedMobile = normalizeMobileForOtp(mobile)
    const otp = generateOtp()

    const devMode = process.env.WHATSAPP_DEV_MODE === 'true'

    if (devMode) {
      await saveOtp(normalizedMobile, otp)
      return NextResponse.json({
        success: true,
        message:
          'Dev mode: OTP generated locally (WhatsApp skipped until Meta approves template)',
        devOtp: otp,
        storage: isRedisConfigured() ? 'redis' : 'memory',
        mobileKey: normalizedMobile,
      })
    }

    const { otpToStore } = await sendWhatsappOtp(normalizedMobile, otp)
    await saveOtp(normalizedMobile, otpToStore)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      storage: isRedisConfigured() ? 'redis' : 'memory',
      mobileKey: normalizedMobile,
    })
  } catch (error) {
    console.error(error)

    if (error instanceof WhatsAppApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
