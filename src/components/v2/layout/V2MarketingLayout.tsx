import { Outlet } from 'react-router-dom';

export function V2MarketingLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">StrataDash</span>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <a href="/v2/pricing" className="hover:text-gray-900">Pricing</a>
            <a href="/login" className="hover:text-gray-900">Login</a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
