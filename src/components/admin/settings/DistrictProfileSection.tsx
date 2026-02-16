import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface DistrictProfileSectionProps {
  name: string;
  slug: string;
  logoUrl: string;
  tagline: string;
  onChange: (updates: Partial<{ name: string; logoUrl: string; tagline: string }>) => void;
}

export function DistrictProfileSection({ name, slug, logoUrl, tagline, onChange }: DistrictProfileSectionProps) {
  const [previewLogo, setPreviewLogo] = useState(logoUrl);

  const handleLogoChange = (value: string) => {
    onChange({ logoUrl: value });
    setPreviewLogo(value);
  };

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5" style={{ color: 'var(--editorial-text-muted)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>District Profile</h2>
      </div>

      <div className="space-y-4">
        {/* District Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>District Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg focus:outline-none"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
          />
        </div>

        {/* Slug (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>Slug</label>
          <input
            type="text"
            value={slug}
            readOnly
            className="w-full px-3 py-2 rounded-lg bg-gray-50 cursor-not-allowed"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-muted)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            The slug cannot be changed after creation
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="A short description of your district"
            className="w-full px-3 py-2 rounded-lg focus:outline-none"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>Logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => handleLogoChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 rounded-lg focus:outline-none"
            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-primary)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            Enter the URL of your district logo (recommended: 200x60px PNG with transparent background)
          </p>
        </div>

        {previewLogo && (
          <div className="rounded-lg p-4" style={{ border: '1px solid var(--editorial-border)', backgroundColor: 'var(--editorial-surface-alt)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--editorial-text-muted)' }}>Logo Preview:</p>
            <img
              src={previewLogo}
              alt="Logo preview"
              className="h-16 object-contain"
              onError={() => setPreviewLogo('')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
