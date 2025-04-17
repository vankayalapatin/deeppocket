// app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log("Auth callback route triggered")
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log("Auth code present:", !!code)

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore,
      })
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        )
      }
      
      console.log("Session established successfully")
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(
        new URL('/login?error=Something went wrong during authentication', request.url)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}