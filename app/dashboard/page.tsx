// app/dashboard/page.tsx


export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</h3>
          <p className="text-2xl font-bold mt-1">$0.00</p>
          <span className="text-gray-500 text-sm flex items-center mt-2">
            Add an account to get started
          </span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</h3>
          <p className="text-2xl font-bold mt-1">$0.00</p>
          <span className="text-gray-500 text-sm flex items-center mt-2">
            No income data available
          </span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</h3>
          <p className="text-2xl font-bold mt-1">$0.00</p>
          <span className="text-gray-500 text-sm flex items-center mt-2">
            No expense data available
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Monthly Spending</h2>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Connect an account to view your spending breakdown</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No recent transactions to display</p>
          </div>
        </div>
      </div>
    </main>
  )
}