interface AppearancePreviewProps {
  districtName: string;
  tagline?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function AppearancePreview({
  districtName,
  tagline,
  logoUrl,
  primaryColor,
  secondaryColor,
}: AppearancePreviewProps) {
  const initials = districtName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-xs" data-testid="appearance-preview">
      {/* Header bar */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        data-testid="preview-header"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${districtName} logo`}
            data-testid="preview-logo"
            className="h-8 w-8 rounded-full object-cover bg-white"
          />
        ) : (
          <div
            data-testid="preview-initials"
            className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold"
          >
            {initials}
          </div>
        )}

        <div className="text-white">
          <div className="font-semibold text-sm leading-tight" data-testid="preview-name">
            {districtName}
          </div>
          {tagline && (
            <div className="text-white/80 text-xs" data-testid="preview-tagline">
              {tagline}
            </div>
          )}
        </div>
      </div>

      {/* Accent line */}
      <div
        className="h-1"
        data-testid="preview-accent"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Body placeholder */}
      <div className="px-4 py-6 bg-slate-50">
        <div className="h-2 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-2 w-1/2 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
