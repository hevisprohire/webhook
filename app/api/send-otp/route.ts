import { NextRequest, NextResponse } from 'next/server'
import { generateOtp, saveOtp } from '@/lib/otp-store'
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

    const otp = generateOtp()
    await saveOtp(mobile, otp)
    console.log(`Generated OTP for ${mobile}: ${otp}`)

    const devMode = process.env.WHATSAPP_DEV_MODE === 'true'

    if (devMode) {
      return NextResponse.json({
        success: true,
        message:
          'Dev mode: OTP generated locally (WhatsApp skipped until Meta approves template)',
        devOtp: otp,
      })
    }

    await sendWhatsappOtp(mobile, otp)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
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
