// app/dashboard/investments/page.tsx
export default function InvestmentsPage() {
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-bold mb-4">Investment Portfolio</h2>
      
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-white dark:text-gray-300">Your investment details will appear here.</p>
      </div>
    </main>
  )
}