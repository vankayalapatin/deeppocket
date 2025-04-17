export default function SettingsPage() {
  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow h-14">
        <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Account Settings</h2>
          <p>Your account settings will appear here.</p>
        </div>
      </main>
    </>
  )
}