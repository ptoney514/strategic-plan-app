import { useAppearance } from '../../AppearanceContext';
import { getMergedConfig } from '../../../../public/templates/TemplateRegistry';
import type { DashboardConfig } from '../../../../../lib/types';

const CARD_VARIANTS: { id: NonNullable<DashboardConfig['cardVariant']>; label: string; description: string }[] = [
  { id: 'default', label: 'Default', description: 'Standard card with border' },
  { id: 'compact', label: 'Compact', description: 'Smaller cards, dense layout' },
  { id: 'rich', label: 'Rich', description: 'Elevated cards with shadows' },
];

export function CardStyleSection() {
  const { state, dispatch, isSaving } = useAppearance();
  const merged = getMergedConfig(state.dashboardTemplate, state.dashboardConfig);

  return (
    <div>
      <p className="text-xs mb-2.5" style={{ color: 'var(--editorial-text-muted)' }}>
        Visual style for metric cards
      </p>
      <div className="grid grid-cols-3 gap-2">
        {CARD_VARIANTS.map(({ id, label }) => {
          const isActive = merged.cardVariant === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`config-card-${id}`}
              onClick={() => dispatch({ type: 'UPDATE_CONFIG', payload: { cardVariant: id } })}
              disabled={isSaving}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors capitalize ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: isActive ? 'var(--editorial-accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--editorial-text-secondary)',
                border: isActive ? 'none' : '1px solid var(--editorial-border)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
