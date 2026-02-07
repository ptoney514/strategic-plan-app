import { useState, useEffect } from 'react';
import { Palette, ImageIcon, Save, Loader2, LayoutTemplate } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict, useUpdateDistrict } from '../../../hooks/useDistricts';
import { LogoUpload } from '../../../components/admin/LogoUpload';
import { TemplateSelector } from '../../../components/admin/TemplateSelector';
import { TemplateConfigEditor } from '../../../components/admin/TemplateConfigEditor';
import { AppearancePreview } from '../../../components/admin/preview';
import type { DashboardTemplate, DashboardConfig } from '../../../lib/types';

/**
 * DistrictAppearance - Customize district branding and appearance
 * Restyled with editorial warm paper aesthetic
 */
export function DistrictAppearance() {
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const updateDistrict = useUpdateDistrict();

  const [primaryColor, setPrimaryColor] = useState('#0099CC');
  const [secondaryColor, setSecondaryColor] = useState('#FFB800');
  const [logoUrl, setLogoUrl] = useState('');
  const [dashboardTemplate, setDashboardTemplate] = useState<DashboardTemplate>('hierarchical');
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({});

  // Initialize form with district data
  useEffect(() => {
    if (district) {
      setPrimaryColor(district.primary_color || '#0099CC');
      setSecondaryColor(district.secondary_color || '#FFB800');
      setLogoUrl(district.logo_url || '');
      setDashboardTemplate(district.dashboard_template || 'hierarchical');
      setDashboardConfig(district.dashboard_config || {});
    }
  }, [district]);

  const handleSave = async () => {
    if (!district) return;

    try {
      await updateDistrict.mutateAsync({
        id: district.id,
        updates: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl || undefined,
          dashboard_template: dashboardTemplate,
          dashboard_config: dashboardConfig,
        },
      });
    } catch (error) {
      console.error('Failed to update district:', error);
    }
  };

  if (districtLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
          <div className="h-4 w-32 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
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
            Appearance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            Customize your district's branding
          </p>
        </div>
        <button
          data-testid="appearance-save-btn"
          onClick={handleSave}
          disabled={updateDistrict.isPending}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          onMouseEnter={(e) => { if (!updateDistrict.isPending) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
          onMouseLeave={(e) => { if (!updateDistrict.isPending) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
        >
          {updateDistrict.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(184, 92, 56, 0.1)' }}>
              <Palette className="h-5 w-5" style={{ color: 'var(--editorial-accent-primary)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Colors</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  data-testid="color-primary-picker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                  style={{ border: '1px solid var(--editorial-border)' }}
                />
                <input
                  type="text"
                  data-testid="color-primary-input"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none"
                  style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
                  placeholder="#0099CC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  data-testid="color-secondary-picker"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                  style={{ border: '1px solid var(--editorial-border)' }}
                />
                <input
                  type="text"
                  data-testid="color-secondary-input"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none"
                  style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
                  placeholder="#FFB800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)' }}>
              <ImageIcon className="h-5 w-5" style={{ color: 'var(--editorial-accent-link)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Logo</h2>
          </div>

          <LogoUpload
            currentUrl={logoUrl}
            onUpload={(url) => setLogoUrl(url)}
            onRemove={() => setLogoUrl('')}
            folder="district-logos"
            label="District Logo"
            helpText="PNG, JPG, SVG or WebP. Max 5MB."
          />
        </div>
      </div>

      {/* Dashboard Template */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
            <LayoutTemplate className="h-5 w-5" style={{ color: 'var(--editorial-accent-secondary)' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Dashboard Template</h2>
            <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
              Choose how your public dashboard looks
            </p>
          </div>
        </div>

        <TemplateSelector
          value={dashboardTemplate}
          onChange={setDashboardTemplate}
          disabled={updateDistrict.isPending}
        />

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--editorial-border-light)' }}>
          <TemplateConfigEditor
            template={dashboardTemplate}
            config={dashboardConfig}
            onChange={setDashboardConfig}
            disabled={updateDistrict.isPending}
          />
        </div>
      </div>

      {/* Preview */}
      <AppearancePreview
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        logoUrl={logoUrl}
        districtName={district?.name || 'District Name'}
        tagline={district?.tagline}
      />
    </div>
  );
}
