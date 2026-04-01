import type { ReactNode } from 'react';
import EnvironmentBadge from '../components/EnvironmentBadge';

/**
 * RootLayout - Base layout for entire application
 * Provides common wrapper for all routes
 */
export function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <EnvironmentBadge />
    </div>
  );
}
