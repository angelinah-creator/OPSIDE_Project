import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Proxy
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const userCookie = request.cookies.get('user')?.value
  const path = request.nextUrl.pathname

  const protectedPrefixes = ['/candidat', '/client', '/admin']
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (token && userCookie) {
    try {
      const user = JSON.parse(userCookie)
      if (path.startsWith('/admin') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (path.startsWith('/candidat') && user.role !== 'candidat') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (path.startsWith('/client') && user.role !== 'client') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {}
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/candidat/:path*', '/client/:path*', '/admin/:path*'],
}
