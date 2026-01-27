import { AxiosError } from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { setCSRFToken } from '@/utils/csrf'

export async function POST(request: NextRequest) {
  try {
    const registerData: any & { csrfToken: string } = await request.json()

    // Input validation
    const { first_name, last_name, email, password, csrfToken } = registerData

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      typeof first_name !== 'string' ||
      typeof last_name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    // Check request origin
    const headersList = await headers()
    const origin = headersList.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    // Call registration action over here!!!
    const user = null // TODO: Add registration action

    if (!user) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }

    // Generate new CSRF token for next request
    const newCSRFToken = await setCSRFToken()

    return NextResponse.json({
      success: true,
      user: {}, // TODO: Add user data
      csrfToken: newCSRFToken,
      message: 'Registration successful',
    })
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.message.includes('CSRF')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (error.status === 400) {
        return NextResponse.json({ error: error.response?.data.message }, { status: 400 })
      }
    }
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
