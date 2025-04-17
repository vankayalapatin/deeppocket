// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create supabase middleware client
  const supabase = createMiddlewareClient({ req, res })
  
  // Wait for the session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If no session and trying to access protected routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If session exists and trying to access login page
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
}