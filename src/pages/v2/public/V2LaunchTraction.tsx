import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useWidgets } from '../../../hooks/v2/useWidgets';
import { WidgetGrid } from '../../../components/v2/widgets/WidgetGrid';

export function V2LaunchTraction() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: widgets, isLoading } = useWidgets(slug || '');

  const activeWidgets = (widgets || [])
    .filter((w) => w.isActive)
    .sort((a, b) => a.position - b.position);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Dark header */}
      <div style={{ backgroundColor: '#1e1e2e' }} className="px-6 py-10 text-white">
        <h1 className="text-2xl font-light">
          <strong>{district?.name?.toUpperCase()}</strong> LAUNCH TRACTION
        </h1>
        {district?.tagline && (
          <p className="text-sm mt-2" style={{ opacity: 0.6 }}>
            {district.tagline}
          </p>
        )}
        <button
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/30 opacity-50 cursor-not-allowed"
          disabled
        >
          Download Report
        </button>
      </div>

      {/* Widget section */}
      <div className="p-6 max-w-7xl mx-auto">
        <WidgetGrid widgets={activeWidgets} isLoading={isLoading} />

        <p
          className="text-xs text-center mt-8"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          Data updated quarterly.
        </p>
      </div>
    </div>
  );
}
