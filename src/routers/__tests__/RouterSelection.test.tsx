import { describe, it, expect, vi, afterEach } from 'vitest';

// We'll test the router selection logic by mocking the subdomain context
// and verifying the correct router component is used

/**
 * Mock window.location for testing different environments
 */
function mockWindowLocation(overrides: Partial<Location>) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

  const mockLocation = {
    hostname: 'localhost',
    protocol: 'http:',
    port: '5174',
    origin: 'http://localhost:5174',
    search: '',
    hash: '',
    pathname: '/',
    href: 'http://localhost:5174/',
    host: 'localhost:5174',
    ancestorOrigins: {} as DOMStringList,
    assign: () => {},
    reload: () => {},
    replace: () => {},
    toString: () => 'http://localhost:5174/',
    ...overrides,
  };

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'location', originalDescriptor);
    }
  };
}

// Mock the routers to identify which one is rendered
vi.mock('../../routers/RootRouter', () => ({
  RootRouter: () => <div data-testid="root-router">Root Router</div>,
}));

vi.mock('../../routers/AdminRouter', () => ({
  AdminRouter: () => <div data-testid="admin-router">Admin Router</div>,
}));

vi.mock('../../routers/DistrictRouter', () => ({
  DistrictRouter: () => <div data-testid="district-router">District Router</div>,
}));

// Mock ErrorBoundary to pass through children
vi.mock('../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// We need to test getSubdomainInfo directly since the SubdomainContext
// is initialized at module load time
import { getSubdomainInfo } from '../../lib/subdomain';

describe('Router Selection Logic', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
    vi.clearAllMocks();
  });

  describe('getSubdomainInfo determines router selection', () => {
    describe('localhost environment', () => {
      it('returns root type without subdomain param', () => {
        cleanup = mockWindowLocation({
          hostname: 'localhost',
          search: '',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('root');
        // RootRouter would be selected
      });

      it('returns admin type with ?subdomain=admin', () => {
        cleanup = mockWindowLocation({
          hostname: 'localhost',
          search: '?subdomain=admin',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('admin');
        // AdminRouter would be selected
      });

      it('returns district type with ?subdomain=westside', () => {
        cleanup = mockWindowLocation({
          hostname: 'localhost',
          search: '?subdomain=westside',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('district');
        expect(info.slug).toBe('westside');
        // DistrictRouter would be selected
      });
    });

    describe('Vercel preview environment', () => {
      it('returns root type without subdomain param', () => {
        cleanup = mockWindowLocation({
          hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
          search: '',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('root');
        // RootRouter would be selected
      });

      it('returns admin type with ?subdomain=admin', () => {
        cleanup = mockWindowLocation({
          hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
          search: '?subdomain=admin',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('admin');
        // AdminRouter would be selected
      });

      it('returns district type with ?subdomain=westside', () => {
        cleanup = mockWindowLocation({
          hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
          search: '?subdomain=westside',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('district');
        expect(info.slug).toBe('westside');
        // DistrictRouter would be selected
      });
    });

    describe('production environment', () => {
      it('returns root type for stratadash.org', () => {
        cleanup = mockWindowLocation({
          hostname: 'stratadash.org',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('root');
      });

      it('returns admin type for admin.stratadash.org', () => {
        cleanup = mockWindowLocation({
          hostname: 'admin.stratadash.org',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('admin');
      });

      it('returns district type for westside.stratadash.org', () => {
        cleanup = mockWindowLocation({
          hostname: 'westside.stratadash.org',
        });

        const info = getSubdomainInfo();
        expect(info.type).toBe('district');
        expect(info.slug).toBe('westside');
      });
    });
  });

  describe('query param consistency across environments', () => {
    it('localhost and Vercel preview use same query param pattern', () => {
      // Test localhost
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=eastside',
      });
      const localhostInfo = getSubdomainInfo();
      cleanup();

      // Test Vercel preview
      cleanup = mockWindowLocation({
        hostname: 'my-app-abc123.vercel.app',
        search: '?subdomain=eastside',
      });
      const vercelInfo = getSubdomainInfo();

      // Both should parse identically
      expect(localhostInfo.type).toBe(vercelInfo.type);
      expect(localhostInfo.slug).toBe(vercelInfo.slug);
      expect(localhostInfo.type).toBe('district');
      expect(localhostInfo.slug).toBe('eastside');
    });

    it('admin subdomain detection is consistent', () => {
      // Test localhost
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=admin',
      });
      const localhostInfo = getSubdomainInfo();
      cleanup();

      // Test Vercel preview
      cleanup = mockWindowLocation({
        hostname: 'preview-123.vercel.app',
        search: '?subdomain=admin',
      });
      const vercelInfo = getSubdomainInfo();

      expect(localhostInfo.type).toBe('admin');
      expect(vercelInfo.type).toBe('admin');
    });
  });

  describe('edge cases', () => {
    it('handles empty subdomain param as root', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=',
      });

      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
    });

    it('handles subdomain param with extra query params', () => {
      cleanup = mockWindowLocation({
        hostname: 'preview-123.vercel.app',
        search: '?subdomain=westside&debug=true',
      });

      const info = getSubdomainInfo();
      expect(info.type).toBe('district');
      expect(info.slug).toBe('westside');
    });

    it('handles production Vercel URL as root (not preview)', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-app.vercel.app',
        search: '',
      });

      const info = getSubdomainInfo();
      // This is in ROOT_DOMAINS, should be treated as root
      expect(info.type).toBe('root');
    });
  });
});
