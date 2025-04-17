// app/dashboard/page.tsx
import { FinancialSummary } from '@/components/dashboard/financial-summary'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { SpendingChart } from '@/components/dashboard/spending-chart'

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <FinancialSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <SpendingChart />
        <RecentTransactions />
      </div>
    </main>
  )
}