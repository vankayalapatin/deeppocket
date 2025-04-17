export function RecentTransactions() {
  const transactions = [
    { id: 1, name: 'Grocery Store', amount: -85.32, date: '2025-04-15', category: 'Groceries' },
    { id: 2, name: 'Salary Deposit', amount: 4175.00, date: '2025-04-01', category: 'Income' },
    { id: 3, name: 'Electric Bill', amount: -124.56, date: '2025-04-10', category: 'Utilities' },
    { id: 4, name: 'Amazon.com', amount: -67.49, date: '2025-04-08', category: 'Shopping' },
    { id: 5, name: 'Restaurant', amount: -52.75, date: '2025-04-12', category: 'Dining' }
  ]
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map(transaction => (
          <div key={transaction.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <div>
              <p className="font-medium">{transaction.name}</p>
              <p className="text-sm text-gray-500">{transaction.date} · {transaction.category}</p>
            </div>
            <span className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}