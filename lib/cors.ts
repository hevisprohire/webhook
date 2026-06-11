import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_ALLOWED_ORIGINS = [
  'https://api.hevisprohire.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

function getAllowedOrigins(): string[] {
  const fromEnv = process.env.CORS_ALLOWED_ORIGINS
  if (!fromEnv?.trim()) {
    return DEFAULT_ALLOWED_ORIGINS
  }

  return fromEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false
  return getAllowedOrigins().includes(origin)
}

function applyCorsHeaders(req: NextRequest, response: NextResponse): NextResponse {
  const origin = req.headers.get('origin')

  if (isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept'
    )
    response.headers.set('Vary', 'Origin')
  }

  return response
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    return new NextResponse(null, { status: 403 })
  }

  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }))
}

export function jsonWithCors(
  req: NextRequest,
  body: unknown,
  init?: ResponseInit
): NextResponse {
  return applyCorsHeaders(req, NextResponse.json(body, init))
}
