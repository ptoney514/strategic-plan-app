import { Link, Outlet } from 'react-router-dom';

export function V2MarketingLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            <span className="text-gray-900">Strata</span>
            <span className="text-blue-500">Dash</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <a href="#examples" className="hover:text-gray-900 transition-colors">
              Examples
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup?redirect=/onboard"
              className="text-sm font-medium text-white bg-blue-500 rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} StrataDash. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hover:text-gray-700 transition-colors">
              Pricing
            </Link>
            <a href="mailto:support@stratadash.org" className="hover:text-gray-700 transition-colors">
              Support
            </a>
            <a href="mailto:sales@stratadash.org" className="hover:text-gray-700 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
