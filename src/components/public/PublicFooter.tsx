import type { District } from '../../lib/types';

interface PublicFooterProps {
  district: District;
}

export function PublicFooter({ district }: PublicFooterProps) {
  return (
    <footer className="mt-20 border-t border-gray-200 pt-8 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* District info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">{district.name}</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
            Accessibility
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
            Contact
          </a>
          <div className="flex items-center gap-2 text-gray-400">
            <span>Powered by</span>
            <a
              href="https://stratadash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              StrataDash
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
