// lib/hooks/useUserData.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  id?: string;
  email?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)
        
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (!session) {
          setUserData(null)
          return
        }
        
        // Get user data from session
        const { user } = session
        
        if (!user) {
          setUserData(null)
          return
        }
        
        // Get user metadata
        const userData: UserData = {
          id: user.id,
          email: user.email,
          // Extract user metadata
          display_name: user.user_metadata?.display_name,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name
        }
        
        setUserData(userData)
      } catch (error) {
        setError(error as Error)
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
    
    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user
        setUserData({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name
        })
      } else {
        setUserData(null)
      }
    })
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  
  return { userData, isLoading, error }
}