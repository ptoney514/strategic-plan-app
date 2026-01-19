import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface MarketingNavProps {
  onDemoClick: () => void;
}

export function MarketingNav({ onDemoClick }: MarketingNavProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
      <div className="flex h-20 max-w-7xl mx-auto px-6 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex shadow-blue-900/20 text-white bg-indigo-900 w-8 h-8 rounded-lg shadow-lg items-center justify-center">
            <Icon icon="solar:widget-bold" className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-indigo-900">StrataDash</span>
        </Link>

        {/* Nav Links - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#goals"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Goals
          </a>
          <a
            href="#initiatives"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Initiatives
          </a>
          <a
            href="#progress"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Progress
          </a>
          <a
            href="#resources"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Resources
          </a>
          <Link
            to="/about"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Log in
          </Link>
          <button
            onClick={onDemoClick}
            className="bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md hover:shadow-indigo-200"
          >
            View District Plan Demo
          </button>
        </div>
      </div>
    </nav>
  );
}
