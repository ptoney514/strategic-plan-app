import { useAppearance } from '../../AppearanceContext';

const PRESET_COLORS = [
  '#0099CC', '#1E40AF', '#7C3AED', '#059669',
  '#DC2626', '#EA580C', '#CA8A04', '#0F766E',
  '#4F46E5', '#BE185D', '#1D4ED8', '#15803D',
];

function ColorField({
  label,
  value,
  onChange,
  pickerTestId,
  inputTestId,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
  pickerTestId: string;
  inputTestId: string;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          data-testid={pickerTestId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer flex-shrink-0"
          style={{ border: '1px solid var(--editorial-border)' }}
        />
        <input
          type="text"
          data-testid={inputTestId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent-primary)] font-mono"
          style={{
            border: '1px solid var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function BrandColorsSection() {
  const { state, dispatch } = useAppearance();

  return (
    <div className="space-y-4">
      <ColorField
        label="Primary Color"
        value={state.primaryColor}
        onChange={(c) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: c })}
        pickerTestId="color-primary-picker"
        inputTestId="color-primary-input"
      />

      <ColorField
        label="Secondary Color"
        value={state.secondaryColor}
        onChange={(c) => dispatch({ type: 'SET_SECONDARY_COLOR', payload: c })}
        pickerTestId="color-secondary-picker"
        inputTestId="color-secondary-input"
      />

      {/* Preset palette */}
      <div>
        <span
          className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--editorial-text-muted)' }}
        >
          Quick Picks
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => dispatch({ type: 'SET_PRIMARY_COLOR', payload: color })}
              className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: state.primaryColor === color ? 'var(--editorial-text-primary)' : 'transparent',
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
