import { NextRequest } from 'next/server'
import { corsPreflightResponse, jsonWithCors } from '@/lib/cors'
import {
  normalizeMobileForOtp,
  sendWhatsappOtp,
  WhatsAppApiError,
} from '@/lib/whatsapp'

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile, otp } = body

    if (!mobile || typeof mobile !== 'string') {
      return jsonWithCors(
        req,
        { success: false, message: 'Mobile number required' },
        { status: 400 }
      )
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return jsonWithCors(
        req,
        { success: false, message: 'Valid 6-digit OTP required' },
        { status: 400 }
      )
    }

    const normalizedMobile = normalizeMobileForOtp(mobile)
    await sendWhatsappOtp(normalizedMobile, otp.trim())

    return jsonWithCors(req, { success: true })
  } catch (error) {
    console.error(error)

    if (error instanceof WhatsAppApiError) {
      return jsonWithCors(
        req,
        {
          success: false,
          message: error.message,
        },
        { status: 502 }
      )
    }

    return jsonWithCors(
      req,
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
