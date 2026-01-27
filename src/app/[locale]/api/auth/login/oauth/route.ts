import axios, { AxiosError } from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expires_at } = await request.json()

    // Input validation
    if (
      !access_token ||
      !refresh_token ||
      !expires_at ||
      typeof access_token !== 'string' ||
      typeof refresh_token !== 'string' ||
      typeof expires_at !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Check request origin
    const headersList = await headers()
    const origin = headersList.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const profileUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jss/jsk/jobseekers/info`
    const response = await axios.get(profileUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })

    const user = response.data.data

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const splitName = user.fullname.split(' ')
    const firstname = splitName.pop()
    const lastname = splitName.join(' ')
    const sessionId = crypto.randomUUID()

    const sessionData: any = {
      member_id: user.id,
      member_firstname: firstname,
      member_lastname: lastname ?? '',
      member_username: firstname,
      member_email: user.email,
      ispolicy: user.is_policy,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 3600 will be expires_at, // TODO: Add expires in
      session_id: sessionId,
      user_type: 'jobseeker',
    }

    // Call create session action start from this line!!!
    // Call store tokens action start from this line!!!

    return NextResponse.json({
      success: true,
      user: {}, // TODO: Add user data
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof AxiosError) {
      if (error.message.includes('CSRF') || error.message.includes('rate limit')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.status === 401) {
        return NextResponse.json({ error: error.response?.data.message }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
