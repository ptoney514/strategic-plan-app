import { Outlet } from 'react-router-dom';

/**
 * RootLayout - Base layout for entire application
 * Provides common wrapper for all routes
 */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
