import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getSubdomainInfo, type SubdomainInfo } from '../lib/subdomain';

const SubdomainContext = createContext<SubdomainInfo | null>(null);

interface SubdomainProviderProps {
  children: ReactNode;
}

/**
 * Provider that detects and provides subdomain information to the app.
 * Must be placed high in the component tree (before Router).
 */
export function SubdomainProvider({ children }: SubdomainProviderProps) {
  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);

  return (
    <SubdomainContext.Provider value={subdomainInfo}>
      {children}
    </SubdomainContext.Provider>
  );
}

/**
 * Hook to access subdomain information.
 * Returns the subdomain type (root/admin/district) and slug if applicable.
 */
export function useSubdomain(): SubdomainInfo {
  const context = useContext(SubdomainContext);
  if (!context) {
    throw new Error('useSubdomain must be used within SubdomainProvider');
  }
  return context;
}
