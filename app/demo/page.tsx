// app/demo/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart2, ArrowRight } from 'lucide-react'
import { FinancialSummary } from '@/components/dashboard/financial-summary'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

export default function DemoPage() {
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

      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold">Experience the Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
              This is a demo of our financial dashboard. See how you can track expenses, monitor investments, and plan your financial future.
            </p>
          </div>

          <div className="relative mb-12">
            <div className="absolute -top-4 -right-4 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded text-blue-700 dark:text-blue-300 font-medium shadow-sm transform rotate-3 z-10">
              Demo Version
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">Financial Dashboard</h2>
              </div>
              <div className="p-6">
                <FinancialSummary />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <SpendingChart />
                  <RecentTransactions />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M18 9l-6-6-6 6" />
                    <path d="M6 9v4" />
                    <path d="M10 9v7" />
                    <path d="M14 9v10" />
                  </svg>
                </div>
                <h3 className="font-bold">Performance Insights</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your financial performance with intuitive charts and metrics.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                    <path d="M3 11h13" />
                    <path d="M18 22l5-5" />
                    <path d="M23 17h-6v6" />
                  </svg>
                </div>
                <h3 className="font-bold">Smart Budgeting</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create and manage budgets that automatically adjust based on your income.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <path d="M18 12a2 2 0 0 0 0 4h2v-4h-2z" />
                  </svg>
                </div>
                <h3 className="font-bold">Finance Automation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automate expense categorization and recurring transaction tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to take control of your finances?</h2>
              <p className="mb-6 opacity-90">
                Create your account now and start your journey toward financial freedom.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="mt-2">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}