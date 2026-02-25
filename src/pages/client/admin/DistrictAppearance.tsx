import { useEffect, useCallback } from 'react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict, useUpdateDistrict } from '../../../hooks/useDistricts';
import { useAppearanceState } from '../../../hooks/useAppearanceState';
import { AppearanceProvider } from '../../../components/admin/appearance/AppearanceContext';
import { AppearanceEditor } from '../../../components/admin/appearance/AppearanceEditor';

/**
 * DistrictAppearance — Thin orchestrator: fetches district, wires up state + context,
 * delegates rendering to AppearanceEditor (split-view WYSIWYG).
 */
export function DistrictAppearance() {
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const updateDistrict = useUpdateDistrict();
  const { state, dispatch, initFromDistrict } = useAppearanceState(district);

  // Re-init when district data arrives or changes
  useEffect(() => {
    if (district) {
      initFromDistrict(district);
    }
  }, [district, initFromDistrict]);

  const save = useCallback(async () => {
    if (!district) return;

    try {
      await updateDistrict.mutateAsync({
        id: district.id,
        updates: {
          primary_color: state.primaryColor,
          secondary_color: state.secondaryColor,
          logo_url: state.logoUrl || undefined,
          dashboard_template: state.dashboardTemplate,
          dashboard_config: state.dashboardConfig,
        },
      });
      dispatch({ type: 'SAVED' });
    } catch (error) {
      console.error('Failed to update district:', error);
    }
  }, [district, state, updateDistrict, dispatch]);

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
    <AppearanceProvider
      value={{
        state,
        dispatch,
        districtName: district?.name || 'District Name',
        districtTagline: district?.tagline,
        districtSlug: district?.slug || slug || 'district',
        save,
        isSaving: updateDistrict.isPending,
      }}
    >
      <AppearanceEditor />
    </AppearanceProvider>
  );
}
