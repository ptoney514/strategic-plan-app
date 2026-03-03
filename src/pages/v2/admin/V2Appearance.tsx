import { useState, useEffect } from 'react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict, useUpdateDistrict } from '../../../hooks/useDistricts';
import { useAppearanceState } from '../../../hooks/useAppearanceState';
import { toast } from '../../../components/Toast';
import { ColorPicker } from '../../../components/v2/appearance/ColorPicker';
import { AppearancePreview } from '../../../components/v2/appearance/AppearancePreview';
import { TemplateModeSelector } from '../../../components/v2/appearance/TemplateModeSelector';
import { LogoUpload } from '../../../components/admin/LogoUpload';
import type { DashboardTemplate } from '../../../lib/types';

export function V2Appearance() {
  const { slug } = useSubdomain();
  const district = useDistrict(slug || '');
  const updateDistrict = useUpdateDistrict();
  const { state, dispatch, initFromDistrict } = useAppearanceState(district.data);

  const [tagline, setTagline] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [localDirty, setLocalDirty] = useState(false);

  useEffect(() => {
    if (district.data) {
      initFromDistrict(district.data);
      setTagline(district.data.tagline || '');
      setIsPublic(district.data.is_public ?? false);
      setLocalDirty(false);
    }
  }, [district.data, initFromDistrict]);

  const isDirty = state.isDirty || localDirty;

  const handleSave = async () => {
    if (!district.data) return;
    try {
      await updateDistrict.mutateAsync({
        id: district.data.id,
        updates: {
          primary_color: state.primaryColor,
          secondary_color: state.secondaryColor,
          // Send null to clear logo in DB; undefined means "no change"
          logo_url: (state.logoUrl === '' ? null : state.logoUrl || undefined) as string | undefined,
          dashboard_template: state.dashboardTemplate,
          tagline,
          is_public: isPublic,
        },
      });
      dispatch({ type: 'SAVED' });
      setLocalDirty(false);
      toast.success('Appearance saved');
    } catch {
      toast.error('Failed to save appearance');
    }
  };

  const handleDiscard = () => {
    if (district.data) {
      initFromDistrict(district.data);
      setTagline(district.data.tagline || '');
      setIsPublic(district.data.is_public ?? false);
      setLocalDirty(false);
    }
  };

  if (district.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="appearance-loading">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Appearance</h1>

      {/* Live Preview */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Preview</h2>
        <AppearancePreview
          districtName={district.data?.name || 'District'}
          tagline={tagline}
          logoUrl={state.logoUrl || undefined}
          primaryColor={state.primaryColor}
          secondaryColor={state.secondaryColor}
        />
      </section>

      {/* Brand Colors */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Brand Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ColorPicker
            label="Primary Color"
            value={state.primaryColor}
            onChange={(c) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: c })}
          />
          <ColorPicker
            label="Secondary Color"
            value={state.secondaryColor}
            onChange={(c) => dispatch({ type: 'SET_SECONDARY_COLOR', payload: c })}
          />
        </div>
      </section>

      {/* Logo */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Logo</h2>
        <LogoUpload
          currentUrl={state.logoUrl || undefined}
          onUpload={(url) => dispatch({ type: 'SET_LOGO_URL', payload: url })}
          onRemove={() => dispatch({ type: 'SET_LOGO_URL', payload: '' })}
          folder="district-logos"
        />
      </section>

      {/* Template */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Dashboard Template</h2>
        <TemplateModeSelector
          selected={state.dashboardTemplate}
          onChange={(t: DashboardTemplate) => dispatch({ type: 'SET_TEMPLATE', payload: t })}
        />
      </section>

      {/* Tagline */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Tagline</h2>
        <input
          type="text"
          data-testid="tagline-input"
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            setLocalDirty(true);
          }}
          maxLength={120}
          placeholder="Enter a short tagline for your district"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">{tagline.length}/120 characters</p>
      </section>

      {/* Public Visibility */}
      <section className="mb-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            data-testid="public-toggle"
            checked={isPublic}
            onChange={(e) => {
              setIsPublic(e.target.checked);
              setLocalDirty(true);
            }}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">Make dashboard publicly accessible</span>
        </label>
      </section>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-3 z-10">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={!isDirty}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </button>
        <button
          type="button"
          data-testid="save-button"
          onClick={handleSave}
          disabled={!isDirty || updateDistrict.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateDistrict.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
