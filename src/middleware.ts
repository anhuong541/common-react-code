import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import { i18nConfig } from './utils/i18n'

export function middleware(request: NextRequest) {
  // return i18nRouter(request, i18nConfig) // ? handle route change for i18n
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
}
