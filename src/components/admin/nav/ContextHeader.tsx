import { ChevronRight, Globe, ExternalLink } from 'lucide-react';
import type { District, School } from '../../../lib/types';

interface ContextHeaderProps {
  district: District;
  school?: School | null;
  publicUrl: string;
  onPublish?: () => void;
}

/**
 * Context header showing breadcrumb and site URL
 */
export function ContextHeader({ district, school, publicUrl, onPublish }: ContextHeaderProps) {
  const contextType = school ? 'school' : 'district';
  const contextName = school?.name || district.name;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            {school && (
              <>
                <span>{district.name}</span>
                <ChevronRight size={14} />
              </>
            )}
            <span className="capitalize">{contextType}</span>
          </div>
          {/* Context Name */}
          <h1 className="text-2xl font-bold text-slate-900">{contextName}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Site URL */}
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{getSiteUrl(district, school)}</span>
            <ExternalLink size={14} />
          </a>

          {/* Publish Button */}
          {onPublish && (
            <button
              onClick={onPublish}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              <Globe size={18} />
              Publish
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Get the display URL for the context
 */
function getSiteUrl(district: District, school?: School | null): string {
  if (school) {
    return `${school.slug}.strategicplanner.app`;
  }
  return `${district.slug}.strategicplanner.app`;
}

interface SimpleBreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

/**
 * Simple breadcrumb component for page headers
 */
export function SimpleBreadcrumb({ items }: SimpleBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} />}
          {item.href ? (
            <a href={item.href} className="hover:text-slate-700">
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
