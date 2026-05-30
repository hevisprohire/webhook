import { NextRequest, NextResponse } from 'next/server'
import { isRedisConfigured, verifyOtp as verifyStoredOtp } from '@/lib/otp-store'

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

    const normalizedMobile = mobile.replace(/\s/g, '')
    const isValid = await verifyStoredOtp(normalizedMobile, otp.trim())

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired OTP',
          hint: isRedisConfigured()
            ? 'Check same mobile as send-otp and use /api/send-otp (not direct sms4power Postman).'
            : 'Redis not configured — OTP is in server memory only; set UPSTASH env on Vercel and redeploy.',
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
