import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Include common tablet identifiers (iPad, Tablet, Silk, PlayBook, Touch)
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile|Tablet|Silk|PlayBook|Touch/i

export function middleware(req: NextRequest) {
  const host = req.nextUrl.hostname

  // Don't redirect if already on the beta host or running on localhost
  if (host === 'beta.infuseting.fr' || host.startsWith('localhost') || host === '127.0.0.1') {
    return NextResponse.next()
  }

  const ua = req.headers.get('user-agent') || ''
  if (MOBILE_UA.test(ua)) {
    const destination = `https://beta.infuseting.fr${req.nextUrl.pathname}${req.nextUrl.search}`
    return NextResponse.redirect(destination)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
