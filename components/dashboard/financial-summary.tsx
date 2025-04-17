export function FinancialSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</h3>
        <p className="text-2xl font-bold mt-1">$24,563.87</p>
        <span className="text-green-500 text-sm flex items-center mt-2">
          +2.5% from last month
        </span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</h3>
        <p className="text-2xl font-bold mt-1">$8,350.00</p>
        <span className="text-green-500 text-sm flex items-center mt-2">
          +5.3% from last month
        </span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</h3>
        <p className="text-2xl font-bold mt-1">$3,863.42</p>
        <span className="text-red-500 text-sm flex items-center mt-2">
          +1.8% from last month
        </span>
      </div>
    </div>
  )
}