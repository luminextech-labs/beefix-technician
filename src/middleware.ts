import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Public API paths - no auth required
  if (
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/sub-categories') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register')
  ) {
    return NextResponse.next()
  }

  // Accept token from query param (from beefix-web onboarding redirect)
  const queryToken = searchParams.get('token')

  // Check auth for all other routes
  const token = req.cookies.get('tech_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    queryToken

  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If token came from query param, set it as a cookie for future requests
  if (queryToken && !req.cookies.get('tech_token')) {
    const response = NextResponse.next()
    response.cookies.set('tech_token', queryToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
