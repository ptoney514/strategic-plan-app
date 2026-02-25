import { useAppearance } from '../../AppearanceContext';
import { TemplateSelector } from '../../../TemplateSelector';

export function TemplateSelectorSection() {
  const { state, dispatch, isSaving } = useAppearance();

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: 'var(--editorial-text-muted)' }}>
        Choose how your public dashboard looks
      </p>
      <TemplateSelector
        value={state.dashboardTemplate}
        onChange={(template) => dispatch({ type: 'SET_TEMPLATE', payload: template })}
        disabled={isSaving}
      />
    </div>
  );
}
