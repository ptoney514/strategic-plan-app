import { LogoUpload } from '../LogoUpload';

const PRESET_COLORS = [
  '#0099CC',
  '#1E40AF',
  '#7C3AED',
  '#059669',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#0F766E',
  '#4F46E5',
  '#BE185D',
  '#1D4ED8',
  '#15803D',
];

interface BrandStepProps {
  primaryColor: string;
  logoUrl: string;
  onColorChange: (color: string) => void;
  onLogoChange: (url: string) => void;
  onLogoRemove: () => void;
}

export function BrandStep({
  primaryColor,
  logoUrl,
  onColorChange,
  onLogoChange,
  onLogoRemove,
}: BrandStepProps) {
  return (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Brand your dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add your colors and logo. You can customize more later.
        </p>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                onColorChange(val);
              }
            }}
            placeholder="#0099CC"
            className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          {/* Preview swatch */}
          <div
            className="w-10 h-10 rounded-lg border border-gray-200"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* Preset swatches */}
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                primaryColor === color
                  ? 'border-gray-900 scale-110 shadow-xs'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Logo Upload */}
      <LogoUpload
        currentUrl={logoUrl || undefined}
        onUpload={onLogoChange}
        onRemove={onLogoRemove}
        folder="district-logos"
        label="Organization Logo"
        helpText="PNG, JPG, SVG or WebP. Max 5MB. Optional — you can add this later."
      />
    </div>
  );
}
