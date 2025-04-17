// app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from 'next-themes'
import { PlusCircle } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get user details
  const { data: { user } } = await supabase.auth.getUser()
  
  // Prepare display name for header
  const displayName = user?.user_metadata?.display_name || 
                     (user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                       ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` 
                       : user?.email?.split('@')[0] || 'User')

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="bg-card shadow border-b border-border h-14">
            <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
              <h1 className="text-xl font-bold">Financial Dashboard</h1>
              <div className="flex items-center gap-4">
                <ModeToggle />
                {user && <p className="text-sm text-muted-foreground">Welcome, {displayName}</p>}
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" variant="outline">Sign Out</Button>
                </form>
              </div>
            </div>
          </header>
          
          <div className="relative flex-1 overflow-auto">
            <div className="absolute top-6 right-8 z-10">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}