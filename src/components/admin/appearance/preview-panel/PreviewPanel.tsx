import { useState } from 'react';
import { PreviewToolbar, type DeviceMode } from './PreviewToolbar';
import { PreviewViewport } from './PreviewViewport';

export function PreviewPanel() {
  const [device, setDevice] = useState<DeviceMode>('desktop');

  return (
    <div className="flex flex-col w-full h-full min-w-0">
      <PreviewToolbar device={device} onDeviceChange={setDevice} />
      <PreviewViewport device={device} />
    </div>
  );
}
