import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const USERJOT_PROJECT_ID = 'cmkibn7as04nk14q5ogovt4wy';

export function UserjotWidget() {
  const { user, isAuthenticated } = useAuth();

  // Load SDK script
  useEffect(() => {
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

    return () => {
      script.remove();
    };
  }, []);

  // Identify user when authenticated
  useEffect(() => {
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
