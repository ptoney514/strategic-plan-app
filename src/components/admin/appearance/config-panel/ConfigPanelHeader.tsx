import { Save, Loader2 } from 'lucide-react';
import { useAppearance } from '../AppearanceContext';

export function ConfigPanelHeader() {
  const { state, save, isSaving } = useAppearance();

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ borderColor: 'var(--editorial-border)' }}
    >
      <div>
        <h1
          className="text-xl font-medium tracking-tight"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--editorial-text-primary)',
          }}
        >
          Appearance
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
          Customize your district's branding
        </p>
      </div>

      <div className="flex items-center gap-2">
        {state.isDirty && (
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--editorial-accent-primary)' }}
          >
            Unsaved
          </span>
        )}
        <button
          data-testid="appearance-save-btn"
          onClick={save}
          disabled={isSaving}
          className="relative flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          onMouseEnter={(e) => {
            if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)';
          }}
        >
          {state.isDirty && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
          )}
          {isSaving ? (
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
    </div>
  );
}
