// app/dashboard/accounts/page.tsx
import AccountsDisplay from '@/components/dashboard/accounts-display'; // Import the display component

export default function AccountsPage() {
  // This page component remains simple, potentially a Server Component
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Accounts</h1>

      {/* Render the client component that fetches and displays accounts */}
      <AccountsDisplay />

    </main>
  );
}