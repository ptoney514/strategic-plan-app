import { useAppearance } from '../../AppearanceContext';
import { getMergedConfig } from '../../../../public/templates/TemplateRegistry';

const GRID_OPTIONS: { cols: 2 | 3 | 4; label: string }[] = [
  { cols: 2, label: '2 Columns' },
  { cols: 3, label: '3 Columns' },
  { cols: 4, label: '4 Columns' },
];

function MiniGrid({ cols }: { cols: number }) {
  return (
    <div className={`grid gap-0.5 w-5 h-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <div key={i} className="rounded-[1px] bg-current opacity-40" />
      ))}
    </div>
  );
}

export function GridDensitySection() {
  const { state, dispatch, isSaving } = useAppearance();
  const merged = getMergedConfig(state.dashboardTemplate, state.dashboardConfig);

  return (
    <div>
      <p className="text-xs mb-2.5" style={{ color: 'var(--editorial-text-muted)' }}>
        Number of columns on large screens
      </p>
      <div className="flex gap-2">
        {GRID_OPTIONS.map(({ cols, label }) => {
          const isActive = merged.gridColumns === cols;
          return (
            <button
              key={cols}
              type="button"
              data-testid={`config-grid-${cols}`}
              onClick={() => dispatch({ type: 'UPDATE_CONFIG', payload: { gridColumns: cols } })}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'hover:bg-[var(--editorial-surface-alt)]'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                backgroundColor: isActive ? 'var(--editorial-accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--editorial-text-secondary)',
                border: isActive ? 'none' : '1px solid var(--editorial-border)',
              }}
            >
              <MiniGrid cols={cols} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
