import { useState } from 'react';
import { Palette, ImageIcon, Save, Loader2 } from 'lucide-react';
import { useAdminContext } from '../../../../hooks/useAdminContext';
import { useUpdateSchool } from '../../../../hooks/useSchools';
import { LogoUpload } from '../../../../components/admin/LogoUpload';

/**
 * SchoolAppearance - Customize school branding and appearance
 */
export function SchoolAppearance() {
  const { school, isLoading: contextLoading } = useAdminContext();
  const updateSchool = useUpdateSchool();

  const [primaryColor, setPrimaryColor] = useState(school?.primary_color || '#0099CC');
  const [secondaryColor, setSecondaryColor] = useState(school?.secondary_color || '#FFB800');
  const [logoUrl, setLogoUrl] = useState(school?.logo_url || '');
  const [description, setDescription] = useState(school?.description || '');

  const handleSave = async () => {
    if (!school) return;

    try {
      await updateSchool.mutateAsync({
        schoolId: school.id,
        updates: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl || undefined,
          description: description || undefined,
        },
      });
    } catch (error) {
      console.error('Failed to update school:', error);
    }
  };

  if (contextLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
          <p className="text-sm text-slate-500 mt-1">
            {school?.name} • Customize your school's branding
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSchool.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {updateSchool.isPending ? (
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
            folder="school-logos"
            label="School Logo"
            helpText="PNG, JPG, SVG or WebP. Max 5MB."
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            School Description
          </h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            placeholder="Enter a brief description of your school..."
          />
          <p className="text-xs text-slate-500 mt-1">
            This description will be shown on your school's public page.
          </p>
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
                alt="School logo"
                className="h-12 w-12 object-contain rounded-lg"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {school?.name?.substring(0, 2).toUpperCase() || 'SC'}
              </div>
            )}
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {school?.name || 'School Name'}
              </h3>
              <p className="text-sm text-slate-600">
                {description || 'School description will appear here'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
