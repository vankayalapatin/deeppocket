// app/dashboard/transactions/page.tsx
import TransactionsDisplay from '@/components/dashboard/transactions-display'; // Import the display component

export default function TransactionsPage() {
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {/* Render the client component that fetches and displays transactions */}
      <TransactionsDisplay />

    </main>
  );
}