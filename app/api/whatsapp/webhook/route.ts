import { NextRequest, NextResponse } from 'next/server'
import { insertWebhookPayload } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const insertId = await insertWebhookPayload(payload)

    return NextResponse.json({
      success: true,
      id: insertId,
    })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)

    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}
