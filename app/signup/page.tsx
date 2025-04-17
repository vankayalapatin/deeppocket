// app/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabaseLoaded, setSupabaseLoaded] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if Supabase client is initialized properly
    if (supabase) {
      console.log("Supabase client initialized")
      setSupabaseLoaded(true)
    } else {
      console.error("Failed to initialize Supabase client")
    }
  }, [supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign up form submitted")
    
    if (!supabaseLoaded) {
      setError("Authentication service not initialized. Please try again later.")
      return
    }
    
    setLoading(true)
    setError(null)
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }
    
    try {
      console.log("Attempting to sign up with:", { email, firstName, lastName })
      
      // Check if Supabase URL and key are available
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Available" : "Missing")
      console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Available" : "Missing")
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`
          }
        },
      })
      
      console.log("Sign up response:", { 
        data: data ? "Received data" : "No data",
        error: error ? error.message : "No error" 
      })
      
      if (error) {
        throw error
      }
      
      // Notify user to check email
      alert('Success! Check your email for the confirmation link.')
      
      // Navigate to login page
      router.push('/login')
    } catch (error: any) {
      console.error("Sign up error:", error)
      setError(error?.message || 'An unexpected error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  // Simple form submission function without Supabase for testing
  const testFormSubmission = () => {
    console.log("Test form submission with data:", {
      email,
      firstName,
      lastName,
      password,
      confirmPassword
    })
    alert("Form data captured successfully (test mode)")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart2 className="h-6 w-6" />
            <span className="text-xl">Financial Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Start managing your finances with our powerful dashboard
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            {!supabaseLoaded && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-600 dark:text-yellow-300 text-sm">
                Warning: Authentication service is still initializing. Form submission may be delayed.
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@example.com"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="flex justify-center mt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={testFormSubmission}
                  className="text-sm"
                >
                  Test Form (Bypass Supabase)
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}