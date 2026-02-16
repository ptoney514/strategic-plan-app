import { Palette } from 'lucide-react';

interface ThemeBrandingSectionProps {
  primaryColor: string;
  secondaryColor: string;
  onChange: (updates: Partial<{ primaryColor: string; secondaryColor: string }>) => void;
}

export function ThemeBrandingSection({ primaryColor, secondaryColor, onChange }: ThemeBrandingSectionProps) {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5" style={{ color: 'var(--editorial-text-muted)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>Theme Colors</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSetting
          label="Primary Color"
          value={primaryColor}
          onChange={(v) => onChange({ primaryColor: v })}
          description="Used for buttons, links, and highlights"
        />
        <ColorSetting
          label="Secondary Color"
          value={secondaryColor}
          onChange={(v) => onChange({ secondaryColor: v })}
          description="Used for headers and accents"
        />
      </div>
    </div>
  );
}

function ColorSetting({ label, value, onChange, description }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-20 rounded-lg cursor-pointer"
          style={{ border: '1px solid var(--editorial-border)' }}
        />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-mono text-sm"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
          />
        </div>
      </div>
      <div
        className="mt-2 h-12 rounded-lg"
        style={{ backgroundColor: value, border: '1px solid var(--editorial-border)' }}
      />
      <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
