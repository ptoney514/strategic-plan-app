import { useState, useEffect } from 'react';
import { Palette, ImageIcon, Save, Loader2 } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict, useUpdateDistrict } from '../../../hooks/useDistricts';
import { LogoUpload } from '../../../components/admin/LogoUpload';

/**
 * DistrictAppearance - Customize district branding and appearance
 */
export function DistrictAppearance() {
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const updateDistrict = useUpdateDistrict();

  const [primaryColor, setPrimaryColor] = useState('#0099CC');
  const [secondaryColor, setSecondaryColor] = useState('#FFB800');
  const [logoUrl, setLogoUrl] = useState('');

  // Initialize form with district data
  useEffect(() => {
    if (district) {
      setPrimaryColor(district.primary_color || '#0099CC');
      setSecondaryColor(district.secondary_color || '#FFB800');
      setLogoUrl(district.logo_url || '');
    }
  }, [district]);

  const handleSave = async () => {
    if (!district) return;

    try {
      await updateDistrict.mutateAsync({
        slug: district.slug,
        updates: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl || null,
        },
      });
    } catch (error) {
      console.error('Failed to update district:', error);
    }
  };

  if (districtLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize your district's branding
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateDistrict.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
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
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Colors</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="#0099CC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="#FFB800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Logo</h2>
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

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Preview</h2>
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="District logo"
                className="h-12 w-12 object-contain rounded-lg"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {district?.name?.substring(0, 2).toUpperCase() || 'DI'}
              </div>
            )}
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {district?.name || 'District Name'}
              </h3>
              <p className="text-sm text-slate-600">
                Strategic Plan 2021-2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
