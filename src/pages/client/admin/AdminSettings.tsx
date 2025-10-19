import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Palette,
  Upload,
  Eye,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';

export function AdminSettings() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);

  // Local state for settings (will be saved to database)
  const [settings, setSettings] = useState({
    primaryColor: district?.primary_color || '#3b82f6',
    secondaryColor: district?.secondary_color || '#1e293b',
    logoUrl: district?.logo_url || '',
    headerColor: '#1e40af',
    accentColor: '#60a5fa',
  });

  const [previewLogo, setPreviewLogo] = useState(settings.logoUrl);

  const handleSave = () => {
    // TODO: Save to database
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">District Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your district's branding and appearance
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Upload */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">District Logo</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => {
                    setSettings({ ...settings, logoUrl: e.target.value });
                    setPreviewLogo(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the URL of your district logo (recommended: 200x60px PNG with transparent background)
                </p>
              </div>

              {previewLogo && (
                <div className="border border-border rounded-md p-4 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
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

          {/* Theme Colors */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Theme Colors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="h-12 w-20 border border-border rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
                <div
                  className="mt-2 h-12 rounded-md border border-border"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for buttons, links, and highlights
                </p>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="h-12 w-20 border border-border rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
                <div
                  className="mt-2 h-12 rounded-md border border-border"
                  style={{ backgroundColor: settings.secondaryColor }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for headers and accents
                </p>
              </div>

              {/* Header Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Header Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.headerColor}
                    onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                    className="h-12 w-20 border border-border rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.headerColor}
                      onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
                <div
                  className="mt-2 h-12 rounded-md border border-border"
                  style={{ backgroundColor: settings.headerColor }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for objective card headers
                </p>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="h-12 w-20 border border-border rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
                <div
                  className="mt-2 h-12 rounded-md border border-border"
                  style={{ backgroundColor: settings.accentColor }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for progress bars and indicators
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Preview</h3>
            </div>

            {/* Logo Preview */}
            <div className="mb-4 p-4 bg-muted/20 rounded-md">
              {previewLogo ? (
                <img src={previewLogo} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="h-12 flex items-center justify-center text-muted-foreground text-sm">
                  No logo set
                </div>
              )}
            </div>

            {/* Color Palette Preview */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Primary</div>
                <div
                  className="h-10 rounded-md border border-border"
                  style={{ backgroundColor: settings.primaryColor }}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Secondary</div>
                <div
                  className="h-10 rounded-md border border-border"
                  style={{ backgroundColor: settings.secondaryColor }}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Header</div>
                <div
                  className="h-10 rounded-md border border-border"
                  style={{ backgroundColor: settings.headerColor }}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Accent</div>
                <div
                  className="h-10 rounded-md border border-border"
                  style={{ backgroundColor: settings.accentColor }}
                />
              </div>
            </div>

            {/* Sample Button */}
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sample Button:</p>
              <button
                className="w-full px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Primary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
