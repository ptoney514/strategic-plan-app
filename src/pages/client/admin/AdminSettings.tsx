import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Palette,
  Eye,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';

export function AdminSettings() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);

  // Local state for settings (will be saved to database)
  const [settings, setSettings] = useState({
    primaryColor: district?.primary_color || '#3b82f6',
    secondaryColor: district?.secondary_color || '#1e293b',
    logoUrl: district?.logo_url || '',
    headerColor: '#1e40af',
    accentColor: '#60a5fa',
  });

  const [previewLogo, setPreviewLogo] = useState(settings.logoUrl);

  const handleSave = () => {
    // TODO: Save to database
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl sm:text-[28px] font-medium tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            District Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            Customize your district's branding and appearance
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-semibold text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Upload */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5" style={{ color: 'var(--editorial-text-muted)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>District Logo</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>Logo URL</label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => {
                    setSettings({ ...settings, logoUrl: e.target.value });
                    setPreviewLogo(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none"
                  style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
                  Enter the URL of your district logo (recommended: 200x60px PNG with transparent background)
                </p>
              </div>

              {previewLogo && (
                <div className="rounded-lg p-4" style={{ border: '1px solid var(--editorial-border)', backgroundColor: 'var(--editorial-surface-alt)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--editorial-text-muted)' }}>Preview:</p>
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    className="h-16 object-contain"
                    onError={() => setPreviewLogo('')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Theme Colors */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5" style={{ color: 'var(--editorial-text-muted)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Theme Colors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <ColorSetting
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(v) => setSettings({ ...settings, primaryColor: v })}
                description="Used for buttons, links, and highlights"
              />

              {/* Secondary Color */}
              <ColorSetting
                label="Secondary Color"
                value={settings.secondaryColor}
                onChange={(v) => setSettings({ ...settings, secondaryColor: v })}
                description="Used for headers and accents"
              />

              {/* Header Color */}
              <ColorSetting
                label="Header Color"
                value={settings.headerColor}
                onChange={(v) => setSettings({ ...settings, headerColor: v })}
                description="Used for objective card headers"
              />

              {/* Accent Color */}
              <ColorSetting
                label="Accent Color"
                value={settings.accentColor}
                onChange={(v) => setSettings({ ...settings, accentColor: v })}
                description="Used for progress bars and indicators"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-6 sticky top-24" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5" style={{ color: 'var(--editorial-text-muted)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Preview</h3>
            </div>

            {/* Logo Preview */}
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--editorial-surface-alt)' }}>
              {previewLogo ? (
                <img src={previewLogo} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="h-12 flex items-center justify-center text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                  No logo set
                </div>
              )}
            </div>

            {/* Color Palette Preview */}
            <div className="space-y-3">
              {[
                { label: 'Primary', color: settings.primaryColor },
                { label: 'Secondary', color: settings.secondaryColor },
                { label: 'Header', color: settings.headerColor },
                { label: 'Accent', color: settings.accentColor },
              ].map(({ label, color }) => (
                <div key={label}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--editorial-text-muted)' }}>{label}</div>
                  <div
                    className="h-10 rounded-lg"
                    style={{ backgroundColor: color, border: '1px solid var(--editorial-border)' }}
                  />
                </div>
              ))}
            </div>

            {/* Sample Button */}
            <div className="mt-6">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--editorial-text-muted)' }}>Sample Button:</p>
              <button
                className="w-full px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Primary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorSetting({ label, value, onChange, description }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-20 rounded-lg cursor-pointer"
          style={{ border: '1px solid var(--editorial-border)' }}
        />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-mono text-sm"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
          />
        </div>
      </div>
      <div
        className="mt-2 h-12 rounded-lg"
        style={{ backgroundColor: value, border: '1px solid var(--editorial-border)' }}
      />
      <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
