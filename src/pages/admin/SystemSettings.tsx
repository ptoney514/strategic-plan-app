import { Settings } from 'lucide-react';

/**
 * SystemSettings - System-wide configuration and settings
 * Only accessible to system administrators
 */
export function SystemSettings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Settings Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          System-wide configuration options will be available here
        </p>
      </div>
    </div>
  );
}
