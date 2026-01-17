import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const USERJOT_PROJECT_ID = import.meta.env.VITE_USERJOT_PROJECT_ID;

// Guard against double-initialization in StrictMode/Fast Refresh
declare global {
  interface Window {
    __userjotInitialized?: boolean;
  }
}

export function UserjotWidget() {
  const { user, isAuthenticated } = useAuth();

  // Load SDK script (only in environments with project ID configured)
  useEffect(() => {
    // Skip if no project ID configured (local/staging without env var)
    if (!USERJOT_PROJECT_ID) {
      return;
    }

    // Prevent double-initialization in StrictMode/Fast Refresh
    if (window.__userjotInitialized) {
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="userjot.com"]')) {
      return;
    }

    window.__userjotInitialized = true;

    // Initialize queue
    window.$ujq = window.$ujq || [];
    window.uj = window.uj || new Proxy({}, {
      get: (_, p: string) => (...a: unknown[]) => window.$ujq.push([p, ...a])
    }) as typeof window.uj;

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://cdn.userjot.com/sdk/v2/uj.js';
    script.type = 'module';
    script.async = true;
    document.head.appendChild(script);

    // Initialize widget
    window.uj.init(USERJOT_PROJECT_ID, {
      widget: true,
      position: 'right',
      theme: 'auto'
    });

    // No cleanup - widget should persist across navigation
  }, []);

  // Identify user when authenticated
  useEffect(() => {
    if (!USERJOT_PROJECT_ID) {
      return;
    }

    if (isAuthenticated && user) {
      window.uj.identify({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || ''
      });
    }
  }, [isAuthenticated, user]);

  return null; // Widget renders via SDK
}
