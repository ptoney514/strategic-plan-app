import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubdomainProvider } from '../contexts/SubdomainContext';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for Recharts ResponsiveContainer (browser-only)
if (typeof global !== 'undefined' && !global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock window.location for subdomain detection (browser-only)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      hostname: 'localhost',
      port: '5173',
      protocol: 'http:',
      search: '',
      pathname: '/',
      href: 'http://localhost:5173/',
    },
    writable: true,
  });
}

// Create a query client for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// All-in-one provider wrapper for tests
interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </SubdomainProvider>
    </QueryClientProvider>
  );
}

// Custom render function that wraps with all providers
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Export everything from testing-library plus custom render
export * from '@testing-library/react';
export { customRender as render, vi };
