const DEFAULT_PRESETS = ['#0099CC', '#1E40AF', '#7C3AED', '#DC2626', '#059669', '#D97706'];

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export function ColorPicker({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (HEX_REGEX.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          data-testid={`color-input-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-slate-300 p-0.5"
        />
        <input
          type="text"
          data-testid={`hex-input-${label}`}
          defaultValue={value}
          key={value}
          onBlur={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const raw = (e.currentTarget as HTMLInputElement).value;
              const hex = raw.startsWith('#') ? raw : `#${raw}`;
              if (HEX_REGEX.test(hex)) onChange(hex);
            }
          }}
          placeholder="#000000"
          maxLength={7}
          className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {presetColors.length > 0 && (
        <div className="flex items-center gap-2" data-testid={`presets-${label}`}>
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Select color ${color}`}
              onClick={() => onChange(color)}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                value === color ? 'border-slate-800 ring-2 ring-offset-1 ring-slate-400' : 'border-slate-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
