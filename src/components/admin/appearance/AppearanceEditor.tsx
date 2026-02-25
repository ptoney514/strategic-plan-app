import { useState } from 'react';
import { PanelLeft, Eye } from 'lucide-react';
import { ConfigPanel } from './config-panel/ConfigPanel';
import { PreviewPanel } from './preview-panel/PreviewPanel';

/**
 * AppearanceEditor — Full-height split-view: config panel (left) + live preview (right).
 * On narrow screens, stacks vertically with a tab toggle.
 */
export function AppearanceEditor() {
  const [mobileTab, setMobileTab] = useState<'config' | 'preview'>('config');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Mobile tab toggle (< lg) */}
      <div className="flex lg:hidden border-b" style={{ borderColor: 'var(--editorial-border)' }}>
        <button
          onClick={() => setMobileTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'config'
              ? 'border-b-2'
              : ''
          }`}
          style={{
            color: mobileTab === 'config' ? 'var(--editorial-accent-primary)' : 'var(--editorial-text-muted)',
            borderBottomColor: mobileTab === 'config' ? 'var(--editorial-accent-primary)' : 'transparent',
          }}
        >
          <PanelLeft className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'border-b-2'
              : ''
          }`}
          style={{
            color: mobileTab === 'preview' ? 'var(--editorial-accent-primary)' : 'var(--editorial-text-muted)',
            borderBottomColor: mobileTab === 'preview' ? 'var(--editorial-accent-primary)' : 'transparent',
          }}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Split view */}
      <div className="flex flex-1 min-h-0">
        {/* Config panel — always visible on lg, toggled on mobile */}
        <div
          className={`${
            mobileTab === 'config' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-[400px] flex-shrink-0`}
        >
          <ConfigPanel />
        </div>

        {/* Preview panel — always visible on lg, toggled on mobile */}
        <div
          className={`${
            mobileTab === 'preview' ? 'flex' : 'hidden'
          } lg:flex flex-1 min-w-0`}
        >
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
