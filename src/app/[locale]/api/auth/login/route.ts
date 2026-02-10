import { AxiosError } from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { setCSRFToken } from '@/utils/csrf'

export async function POST(request: NextRequest) {
  try {
    const { email, password, csrfToken } = await request.json()

    // Input validation
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Check request origin
    const headersList = await headers()
    const origin = headersList.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ]

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const user: any = {
      member_id: null, // TODO: Add member id
      member_email: null, // TODO: Add member email
      member_firstname: null, // TODO: Add member first name
      member_lastname: null, // TODO: Add member last name
      member_avatar: null, // TODO: Add member avatar
    } // TODO: authenticate user action

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Store session data (without tokens for security
    const sessionData = { ...user }
    delete sessionData.member_avatar
    // Call store certificate action start from this line!!!

    // Generate new CSRF token for next request
    const newCSRFToken = await setCSRFToken()

    return NextResponse.json({
      success: true,
      user: {}, // TODO: Add user data
      csrfToken: newCSRFToken,
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof AxiosError) {
      if (
        error.message.includes('CSRF') ||
        error.message.includes('rate limit')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.status === 400) {
        return NextResponse.json(
          { error: error.response?.data.message },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
