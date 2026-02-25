import { useAppearance } from '../../AppearanceContext';
import { getMergedConfig } from '../../../../public/templates/TemplateRegistry';

function Toggle({
  label,
  description,
  checked,
  onChange,
  testId,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  testId: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer group">
      <div className="pr-3">
        <span
          className="text-sm font-medium block"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {label}
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--editorial-text-muted)' }}
        >
          {description}
        </span>
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          data-testid={testId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className="w-9 h-5 rounded-full transition-colors peer-checked:bg-[var(--editorial-accent-primary)] peer-disabled:opacity-50"
          style={{ backgroundColor: checked ? 'var(--editorial-accent-primary)' : 'var(--editorial-border)' }}
        />
        <div
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </label>
  );
}

export function LayoutOptionsSection() {
  const { state, dispatch, isSaving } = useAppearance();
  const merged = getMergedConfig(state.dashboardTemplate, state.dashboardConfig);

  return (
    <div className="space-y-1">
      <Toggle
        label="Show Sidebar"
        description="Display navigation sidebar with objectives"
        checked={merged.showSidebar ?? true}
        onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { showSidebar: v } })}
        testId="config-show-sidebar"
        disabled={isSaving}
      />
      <Toggle
        label="Show Hero Section"
        description="Display title and description at top of dashboard"
        checked={merged.showNarrativeHero ?? true}
        onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { showNarrativeHero: v } })}
        testId="config-show-hero"
        disabled={isSaving}
      />
      <Toggle
        label="Enable Animations"
        description="Animate cards and charts on load"
        checked={merged.enableAnimations ?? false}
        onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { enableAnimations: v } })}
        testId="config-enable-animations"
        disabled={isSaving}
      />
    </div>
  );
}
