import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from './lib/i18n/config'

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Prefix strategy - always include locale in URL
  localePrefix: 'always',
})

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check for x-locale header for custom locale detection
  const xLocaleHeader = request.headers.get('x-locale')
  if (xLocaleHeader && (locales as readonly string[]).includes(xLocaleHeader)) {
    // If x-locale header is present and valid, redirect to that locale
    const url = request.nextUrl.clone()
    if (!url.pathname.startsWith(`/${xLocaleHeader}`)) {
      url.pathname = `/${xLocaleHeader}${url.pathname}`
      return NextResponse.redirect(url)
    }
  }

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    (pathname.includes('.') && !pathname.endsWith('.html'))
  ) {
    return NextResponse.next()
  }

  // Handle CORS for API routes
  if (
    request.headers.get('next-action') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/graphql') // add the condition if we have graphql endpoint
  ) {
    const response = NextResponse.next()

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Origin',
      request.headers.get('origin') || '*',
    )
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    )

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }

  // Handle auth callback and extract tokens from cookies
  if (pathname.startsWith('/auth/callback')) {
    const response = NextResponse.next()

    // Get cookies from the request
    const accessToken = request.cookies.get('wado_access_token')
    const refreshToken = request.cookies.get('wado_refresh_token')

    if (accessToken || refreshToken) {
      // Store tokens in localStorage or sessionStorage via client-side script
      // Since we can't directly access localStorage in middleware, we'll pass this to the client
      response.headers.set('X-Auth-Tokens-Available', 'true')
    }

    return response
  }

  // Apply internationalization middleware for all other routes
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for
  // - API routes, Next.js internal routes, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
