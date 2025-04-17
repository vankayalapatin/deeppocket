// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { FinancialSummary } from '@/components/dashboard/financial-summary'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { Button } from '@/components/ui/button'

export default async function Dashboard() {
  const supabase = await createClient()
  
  // Get user details if needed
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get display name or use email fallback
  const displayName = user?.user_metadata?.display_name || 
                      (user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` 
                        : user?.email?.split('@')[0] || 'User')
  
  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow h-14">
        <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Financial Dashboard</h1>
          <div className="flex items-center gap-4">
            {user && <p className="text-sm text-gray-600 dark:text-gray-300">Welcome, {displayName}</p>}
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <FinancialSummary />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <SpendingChart />
          <RecentTransactions />
        </div>
      </main>
    </>
  )
}