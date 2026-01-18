import type { District } from '../../lib/types';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';

interface PublicFooterProps {
  district: District;
}

export function PublicFooter({ district }: PublicFooterProps) {
  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-slate-800 pt-8 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* District info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium text-gray-600 dark:text-slate-300">{district.name}</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <a href={buildSubdomainUrlWithPath('root', '/privacy')} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
            Privacy Policy
          </a>
          <a href={buildSubdomainUrlWithPath('root', '/terms')} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
            Accessibility
          </a>
          <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500">
            <span>Powered by</span>
            <a
              href="https://stratadash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              StrataDash
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
