import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()

  cookieStore.set('csrf-token', token, {
    httpOnly: false, // Need to be accessible by client for form submissions
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
    domain: process.env.COOKIE_DOMAIN ?? undefined,
  })

  return token
}

export async function verifyCSRFToken(
  submittedToken: string,
): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get('csrf-token')

  if (!storedToken || !submittedToken) {
    return false
  }

  // Use timing-safe comparison
  return storedToken.value === submittedToken
}

export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get('csrf-token')

  if (storedToken && storedToken.value) {
    return storedToken.value
  }

  // Generate new token if none exists
  return await setCSRFToken()
}
