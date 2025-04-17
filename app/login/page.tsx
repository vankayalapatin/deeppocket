// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Check if the user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    console.log("Attempting login with:", { email }) // Don't log passwords
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log("Login response:", { data, error })
      
      if (error) {
        throw error
      }
      
      // Successful login, navigate to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 p-8 border border-gray-200 dark:border-gray-800 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Log In</h1>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="johndoe@gmail.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
    </div>
  )
}