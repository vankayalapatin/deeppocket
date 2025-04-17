// app/auth-test/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthTestPage() {
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('password123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const testSignUp = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('Testing signup with:', { testEmail, testPassword })
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            display_name: 'Test User'
          }
        }
      })
      
      setResult({ 
        type: 'Sign Up', 
        success: !error,
        data: data ? JSON.stringify(data, null, 2) : null,
        error: error ? JSON.stringify(error, null, 2) : null
      })
    } catch (e: any) {
      console.error('Error during test:', e)
      setResult({ 
        type: 'Sign Up',
        success: false,
        error: e.message,
        stack: e.stack
      })
    } finally {
      setLoading(false)
    }
  }
  
  const checkSession = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.getSession()
      
      setResult({ 
        type: 'Check Session', 
        success: !error,
        data: data ? JSON.stringify(data, null, 2) : null,
        error: error ? JSON.stringify(error, null, 2) : null
      })
    } catch (e: any) {
      setResult({ 
        type: 'Check Session',
        success: false,
        error: e.message
      })
    } finally {
      setLoading(false)
    }
  }
  
  const getEnvInfo = () => {
    setResult({
      type: 'Environment Info',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Auth Testing</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testPassword">Password</Label>
              <Input
                id="testPassword"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={testSignUp} disabled={loading}>
              Test Sign Up
            </Button>
            <Button onClick={checkSession} disabled={loading} variant="outline">
              Check Session
            </Button>
            <Button onClick={getEnvInfo} disabled={loading} variant="secondary">
              Get Environment Info
            </Button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">{result.type} Result</h2>
            
            {result.success === false && (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 mb-4 rounded border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-300 font-medium">Error occurred</p>
              </div>
            )}
            
            {result.success === true && (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 mb-4 rounded border border-green-200 dark:border-green-800">
                <p className="text-green-600 dark:text-green-300 font-medium">Success</p>
              </div>
            )}
            
            <div className="mt-4 border-t pt-4">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}