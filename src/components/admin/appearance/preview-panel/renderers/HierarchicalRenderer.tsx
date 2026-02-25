import { PreviewHeader } from '../../../preview/PreviewHeader';
import { PreviewHero } from '../../../preview/PreviewHero';
import { PreviewObjectiveCard } from '../../../preview/PreviewObjectiveCard';
import type { PreviewRendererProps } from './index';

export function HierarchicalRenderer({
  primaryColor,
  secondaryColor,
  logoUrl,
  districtName,
  tagline,
  config,
}: PreviewRendererProps) {
  return (
    <div className="flex min-h-full">
      {/* Optional sidebar */}
      {config.showSidebar && (
        <aside className="w-56 bg-slate-900 text-white flex-shrink-0">
          <div className="p-4 border-b border-slate-700">
            <div className="text-sm font-bold tracking-wide" style={{ color: primaryColor }}>
              STRATEGIC PLAN
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {['Overview', 'Student Achievement', 'Community', 'Staff Development'].map((item, i) => (
              <div
                key={item}
                className={`px-3 py-2 rounded text-sm ${
                  i === 0 ? 'font-medium' : 'text-slate-400'
                }`}
                style={i === 0 ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : {}}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <PreviewHeader
          primaryColor={primaryColor}
          districtName={districtName}
          tagline={tagline}
          logoUrl={logoUrl}
        />
        {config.showNarrativeHero && (
          <PreviewHero primaryColor={primaryColor} districtName={districtName} />
        )}
        <PreviewObjectiveCard
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>
    </div>
  );
}
