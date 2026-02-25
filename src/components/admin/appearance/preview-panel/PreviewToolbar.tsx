import { Monitor, Smartphone } from 'lucide-react';
import { useAppearance } from '../AppearanceContext';

export type DeviceMode = 'desktop' | 'mobile';

interface PreviewToolbarProps {
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
}

export function PreviewToolbar({ device, onDeviceChange }: PreviewToolbarProps) {
  const { districtSlug } = useAppearance();

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        borderColor: 'var(--editorial-border)',
      }}
    >
      {/* Browser chrome dots */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div
          className="px-3 py-1 rounded text-xs font-mono truncate max-w-[240px]"
          style={{
            backgroundColor: 'var(--editorial-surface-alt)',
            color: 'var(--editorial-text-muted)',
          }}
        >
          https://{districtSlug}.stratadash.com
        </div>
      </div>

      {/* Device toggle + Live label */}
      <div className="flex items-center gap-3">
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--editorial-accent-success)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Live Preview
        </span>
        <div
          className="flex rounded-lg p-0.5"
          style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
        >
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-white shadow-sm' : ''
            }`}
            title="Desktop preview"
          >
            <Monitor
              className="w-4 h-4"
              style={{ color: device === 'desktop' ? 'var(--editorial-text-primary)' : 'var(--editorial-text-muted)' }}
            />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-white shadow-sm' : ''
            }`}
            title="Mobile preview"
          >
            <Smartphone
              className="w-4 h-4"
              style={{ color: device === 'mobile' ? 'var(--editorial-text-primary)' : 'var(--editorial-text-muted)' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
