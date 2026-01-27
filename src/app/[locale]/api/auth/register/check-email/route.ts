import { NextRequest, NextResponse } from 'next/server'

const existingEmails: string[] = ['jane.doe@example.com']

const findJobseekerByEmail = async (email: string) => {
  await new Promise(resolve => setTimeout(resolve, 50))

  const isFound = existingEmails.includes(email.toLowerCase())

  if (isFound) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'LANG_ERROR_EMAIL_NULL' }, { status: 400 })
    }

    const existingUser = await findJobseekerByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: 'js_register_email_exist_new' }, { status: 409 })
    }

    // 4. Send Success Response
    return NextResponse.json({
      success: true,
      message: 'js_register_email_not_exist',
    })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ error: 'internalServerError' }, { status: 500 })
  }
}
