import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, Save } from 'lucide-react';
import { useDistrict, useUpdateDistrict } from '../../../hooks/useDistricts';
import { DistrictProfileSection } from '../../../components/admin/settings/DistrictProfileSection';
import { ThemeBrandingSection } from '../../../components/admin/settings/ThemeBrandingSection';

interface SettingsState {
  name: string;
  logoUrl: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

export function AdminSettings() {
  const { slug } = useParams();
  const { data: district, isLoading } = useDistrict(slug!);
  const updateDistrict = useUpdateDistrict();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const [settings, setSettings] = useState<SettingsState>({
    name: '',
    logoUrl: '',
    tagline: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
  });

  useEffect(() => {
    if (district) {
      setSettings({
        name: district.name || '',
        logoUrl: district.logo_url || '',
        tagline: district.tagline || '',
        primaryColor: district.primary_color || '#3b82f6',
        secondaryColor: district.secondary_color || '#1e293b',
      });
    }
  }, [district]);

  useEffect(() => {
    if (saveStatus !== 'idle') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleChange = (updates: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    if (!district) return;
    updateDistrict.mutate(
      {
        id: district.id,
        updates: {
          name: settings.name,
          logo_url: settings.logoUrl,
          tagline: settings.tagline,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
        },
      },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <p style={{ color: 'var(--editorial-text-muted)' }}>Loading settings...</p>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-sm font-medium text-green-600">Changes saved!</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm font-medium text-red-600">Error saving</span>
          )}
          <button
            onClick={handleSave}
            disabled={updateDistrict.isPending}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-semibold text-sm disabled:opacity-50"
            style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
            onMouseEnter={(e) => { if (!updateDistrict.isPending) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
          >
            <Save className="h-4 w-4" />
            <span>{updateDistrict.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          <DistrictProfileSection
            name={settings.name}
            slug={slug || ''}
            logoUrl={settings.logoUrl}
            tagline={settings.tagline}
            onChange={handleChange}
          />
          <ThemeBrandingSection
            primaryColor={settings.primaryColor}
            secondaryColor={settings.secondaryColor}
            onChange={handleChange}
          />
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
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
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
