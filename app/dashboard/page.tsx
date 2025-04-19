// app/dashboard/page.tsx
import FinancialDataDisplay from '@/components/dashboard/financial-data-display'; // Import the new component

export default function Dashboard() {
  // This remains a Server Component, the client-side fetching happens inside FinancialDataDisplay

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {/* You can keep other header elements if needed */}
      </div>

      {/* The FinancialDataDisplay component will handle loading, error, and data states */}
      <FinancialDataDisplay />

    </main>
  );
}