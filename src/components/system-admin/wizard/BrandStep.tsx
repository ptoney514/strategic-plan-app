import { Palette } from 'lucide-react';
import type { WizardState } from './NameStep';

interface BrandStepProps {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export function BrandStep({ data, onChange }: BrandStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--editorial-accent-primary)', opacity: 0.15 }}
        >
          <Palette size={20} style={{ color: 'var(--editorial-accent-primary)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
            Branding
          </h2>
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            Customize the look and feel
          </p>
        </div>
      </div>

      {/* Logo URL */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          Logo URL
        </label>
        <input
          type="url"
          value={data.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
          className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
        />
        {data.logoUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={data.logoUrl}
              alt="Logo preview"
              className="w-12 h-12 rounded-lg object-cover border"
              style={{ borderColor: 'var(--editorial-border)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>Preview</span>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
              style={{ borderColor: 'var(--editorial-border)' }}
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="flex-1 px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                borderColor: 'var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
              style={{ borderColor: 'var(--editorial-border)' }}
            />
            <input
              type="text"
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="flex-1 px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                borderColor: 'var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
          Preview
        </label>
        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--editorial-border)' }}
        >
          <div className="h-2" style={{ backgroundColor: data.primaryColor }} />
          <div className="p-5" style={{ backgroundColor: 'var(--editorial-surface)' }}>
            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <img
                  src={data.logoUrl}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-base font-bold"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  {data.name ? data.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
                  {data.name || 'District Name'}
                </div>
                <div className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>
                  {data.slug || 'district-slug'}
                </div>
              </div>
            </div>
            {data.tagline && (
              <p className="text-xs mt-3" style={{ color: 'var(--editorial-text-muted)' }}>
                {data.tagline}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <div className="w-16 h-4 rounded" style={{ backgroundColor: data.primaryColor }} />
              <div className="w-16 h-4 rounded" style={{ backgroundColor: data.secondaryColor }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
