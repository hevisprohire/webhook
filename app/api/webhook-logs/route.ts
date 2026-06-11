import { NextRequest, NextResponse } from 'next/server'
import { listWebhookLogs } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) : 50
    const logs = await listWebhookLogs(Number.isFinite(limit) ? limit : 50)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error('Webhook logs fetch error:', error)

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
