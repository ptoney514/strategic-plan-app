import { useState } from 'react';
import { Monitor, LayoutDashboard } from 'lucide-react';
import { PreviewHeader } from './PreviewHeader';
import { PreviewHero } from './PreviewHero';
import { PreviewObjectiveCard } from './PreviewObjectiveCard';

type PreviewTab = 'homepage' | 'dashboard';

interface AppearancePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  districtName: string;
  tagline?: string;
}

/**
 * AppearancePreview - Main container for previewing district appearance settings
 * Renders a scaled-down version of the public site that updates in real-time
 */
export function AppearancePreview({
  primaryColor,
  secondaryColor,
  logoUrl,
  districtName,
  tagline,
}: AppearancePreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('homepage');

  const tabs = [
    { id: 'homepage' as const, label: 'Homepage', icon: Monitor },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div data-testid="appearance-preview" className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Browser frame */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-200 border-b border-slate-300">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-white rounded px-3 py-1 text-xs text-slate-500 font-mono truncate">
              https://{districtName.toLowerCase().replace(/\s+/g, '')}.stratadash.com
            </div>
          </div>
        </div>

        {/* Preview content area with scaling */}
        <div
          className="relative overflow-hidden bg-white"
          style={{ height: '450px' }}
        >
          <div
            className="absolute origin-top-left"
            style={{
              transform: 'scale(0.4)',
              width: '250%',
              height: '250%',
            }}
          >
            {/* Shared header */}
            <PreviewHeader
              primaryColor={primaryColor}
              districtName={districtName}
              tagline={tagline}
              logoUrl={logoUrl}
            />

            {/* Tab-specific content */}
            {activeTab === 'homepage' ? (
              <PreviewHero
                primaryColor={primaryColor}
                districtName={districtName}
              />
            ) : (
              <PreviewObjectiveCard
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-3 text-xs text-slate-500 text-center">
        This preview shows how your public site will appear. Changes are reflected in real-time.
      </p>
    </div>
  );
}
