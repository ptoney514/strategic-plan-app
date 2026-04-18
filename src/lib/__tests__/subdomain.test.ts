import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isLocalDev,
  isVercelPreview,
  getSubdomainInfo,
  getSubdomainUrl,
  buildSubdomainUrlWithPath,
  buildDistrictPath,
  buildDistrictPathWithQueryParam,
} from '../subdomain';

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

describe('isLocalDev', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  it('returns true for localhost', () => {
    cleanup = mockWindowLocation({ hostname: 'localhost' });
    expect(isLocalDev()).toBe(true);
  });

  it('returns true for 127.0.0.1', () => {
    cleanup = mockWindowLocation({ hostname: '127.0.0.1' });
    expect(isLocalDev()).toBe(true);
  });

  it('returns true for lvh.me', () => {
    cleanup = mockWindowLocation({ hostname: 'lvh.me' });
    expect(isLocalDev()).toBe(true);
  });

  it('returns true for subdomain.lvh.me', () => {
    cleanup = mockWindowLocation({ hostname: 'westside.lvh.me' });
    expect(isLocalDev()).toBe(true);
  });

  it('returns false for production domain', () => {
    cleanup = mockWindowLocation({ hostname: 'stratadash.org' });
    expect(isLocalDev()).toBe(false);
  });

  it('returns false for Vercel preview', () => {
    cleanup = mockWindowLocation({ hostname: 'strategic-plan-xyz123.vercel.app' });
    expect(isLocalDev()).toBe(false);
  });
});

describe('isVercelPreview', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  it('returns true for preview deployment URLs', () => {
    cleanup = mockWindowLocation({ hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app' });
    expect(isVercelPreview()).toBe(true);
  });

  it('returns true for simple preview URLs', () => {
    cleanup = mockWindowLocation({ hostname: 'my-app-abc123.vercel.app' });
    expect(isVercelPreview()).toBe(true);
  });

  it('returns false for production Vercel URL', () => {
    cleanup = mockWindowLocation({ hostname: 'strategic-plan-app.vercel.app' });
    expect(isVercelPreview()).toBe(false);
  });

  it('returns false for stratadash.org', () => {
    cleanup = mockWindowLocation({ hostname: 'stratadash.org' });
    expect(isVercelPreview()).toBe(false);
  });

  it('returns false for localhost', () => {
    cleanup = mockWindowLocation({ hostname: 'localhost' });
    expect(isVercelPreview()).toBe(false);
  });
});

describe('getSubdomainInfo', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  describe('localhost environment', () => {
    it('returns root type when no subdomain param', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
      expect(info.slug).toBeNull();
    });

    it('returns admin type with subdomain=admin', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=admin',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('admin');
      expect(info.slug).toBeNull();
    });

    it('returns district type with subdomain=westside', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=westside',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('district');
      expect(info.slug).toBe('westside');
    });

    it('trims whitespace from subdomain param', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=%20westside%20',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('district');
      expect(info.slug).toBe('westside');
    });

    it('removes trailing slashes from subdomain param', () => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        search: '?subdomain=westside/',
      });
      const info = getSubdomainInfo();
      expect(info.slug).toBe('westside');
    });
  });

  describe('Vercel preview environment', () => {
    it('returns root type when no subdomain param', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        search: '',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
      expect(info.slug).toBeNull();
    });

    it('returns admin type with subdomain=admin', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        search: '?subdomain=admin',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('admin');
      expect(info.slug).toBeNull();
    });

    it('returns district type with subdomain=westside', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        search: '?subdomain=westside',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('district');
      expect(info.slug).toBe('westside');
    });

    it('trims whitespace from subdomain param', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123.vercel.app',
        search: '?subdomain=%20eastside%20',
      });
      const info = getSubdomainInfo();
      expect(info.slug).toBe('eastside');
    });
  });

  describe('production Vercel URL (strategic-plan-app.vercel.app)', () => {
    it('returns root type (treated as root domain)', () => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-app.vercel.app',
        search: '',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
    });
  });

  describe('production environment', () => {
    it('returns root type for stratadash.org', () => {
      cleanup = mockWindowLocation({
        hostname: 'stratadash.org',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
      expect(info.slug).toBeNull();
    });

    it('returns root type for www.stratadash.org', () => {
      cleanup = mockWindowLocation({
        hostname: 'www.stratadash.org',
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
      expect(info.slug).toBeNull();
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

  describe('lvh.me environment', () => {
    it('returns root type for plain lvh.me', () => {
      cleanup = mockWindowLocation({
        hostname: 'lvh.me',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('root');
      expect(info.slug).toBeNull();
    });

    it('returns admin type for admin.lvh.me', () => {
      cleanup = mockWindowLocation({
        hostname: 'admin.lvh.me',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('admin');
    });

    it('returns district type for westside.lvh.me', () => {
      cleanup = mockWindowLocation({
        hostname: 'westside.lvh.me',
      });
      const info = getSubdomainInfo();
      expect(info.type).toBe('district');
      expect(info.slug).toBe('westside');
    });
  });
});

describe('getSubdomainUrl', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  describe('localhost environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        port: '5174',
        protocol: 'http:',
      });
    });

    it('returns localhost URL for root type', () => {
      expect(getSubdomainUrl('root')).toBe('http://localhost:5174');
    });

    it('returns localhost URL with subdomain=admin for admin type', () => {
      expect(getSubdomainUrl('admin')).toBe('http://localhost:5174?subdomain=admin');
    });

    it('returns localhost URL with subdomain=slug for district type', () => {
      expect(getSubdomainUrl('district', 'westside')).toBe('http://localhost:5174?subdomain=westside');
    });
  });

  describe('Vercel preview environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        origin: 'https://strategic-plan-xyz123-pernells-projects.vercel.app',
        protocol: 'https:',
        port: '',
      });
    });

    it('returns origin for root type', () => {
      expect(getSubdomainUrl('root')).toBe('https://strategic-plan-xyz123-pernells-projects.vercel.app');
    });

    it('returns origin with subdomain=admin for admin type', () => {
      expect(getSubdomainUrl('admin')).toBe('https://strategic-plan-xyz123-pernells-projects.vercel.app?subdomain=admin');
    });

    it('returns origin with subdomain=slug for district type', () => {
      expect(getSubdomainUrl('district', 'westside')).toBe('https://strategic-plan-xyz123-pernells-projects.vercel.app?subdomain=westside');
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'stratadash.org',
        protocol: 'https:',
        port: '',
      });
    });

    it('returns stratadash.org for root type', () => {
      expect(getSubdomainUrl('root')).toBe('https://stratadash.org');
    });

    it('returns admin.stratadash.org for admin type', () => {
      expect(getSubdomainUrl('admin')).toBe('https://admin.stratadash.org');
    });

    it('returns slug.stratadash.org for district type', () => {
      expect(getSubdomainUrl('district', 'westside')).toBe('https://westside.stratadash.org');
    });
  });

  describe('lvh.me environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'lvh.me',
        port: '5174',
        protocol: 'http:',
      });
    });

    it('returns lvh.me for root type', () => {
      expect(getSubdomainUrl('root')).toBe('http://lvh.me:5174');
    });

    it('returns admin.lvh.me for admin type', () => {
      expect(getSubdomainUrl('admin')).toBe('http://admin.lvh.me:5174');
    });

    it('returns slug.lvh.me for district type', () => {
      expect(getSubdomainUrl('district', 'westside')).toBe('http://westside.lvh.me:5174');
    });
  });
});

describe('buildSubdomainUrlWithPath', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  describe('localhost environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'localhost',
        port: '5174',
        protocol: 'http:',
      });
    });

    it('builds URL with path before query param for admin', () => {
      expect(buildSubdomainUrlWithPath('admin', '/districts')).toBe(
        'http://localhost:5174/districts?subdomain=admin'
      );
    });

    it('builds URL with path before query param for district', () => {
      expect(buildSubdomainUrlWithPath('district', '/goals', 'westside')).toBe(
        'http://localhost:5174/goals?subdomain=westside'
      );
    });

    it('builds URL without query param for root', () => {
      expect(buildSubdomainUrlWithPath('root', '/about')).toBe(
        'http://localhost:5174/about'
      );
    });

    it('normalizes path to start with slash', () => {
      expect(buildSubdomainUrlWithPath('admin', 'districts')).toBe(
        'http://localhost:5174/districts?subdomain=admin'
      );
    });

    it('handles empty path', () => {
      expect(buildSubdomainUrlWithPath('admin', '')).toBe(
        'http://localhost:5174?subdomain=admin'
      );
    });
  });

  describe('Vercel preview environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        origin: 'https://strategic-plan-xyz123-pernells-projects.vercel.app',
        protocol: 'https:',
        port: '',
      });
    });

    it('builds URL with path before query param for admin', () => {
      expect(buildSubdomainUrlWithPath('admin', '/districts')).toBe(
        'https://strategic-plan-xyz123-pernells-projects.vercel.app/districts?subdomain=admin'
      );
    });

    it('builds URL with path before query param for district', () => {
      expect(buildSubdomainUrlWithPath('district', '/goals', 'westside')).toBe(
        'https://strategic-plan-xyz123-pernells-projects.vercel.app/goals?subdomain=westside'
      );
    });

    it('builds URL without query param for root', () => {
      expect(buildSubdomainUrlWithPath('root', '/about')).toBe(
        'https://strategic-plan-xyz123-pernells-projects.vercel.app/about'
      );
    });

    it('handles admin path with nested routes', () => {
      expect(buildSubdomainUrlWithPath('admin', '/districts/123/edit')).toBe(
        'https://strategic-plan-xyz123-pernells-projects.vercel.app/districts/123/edit?subdomain=admin'
      );
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      cleanup = mockWindowLocation({
        hostname: 'stratadash.org',
        protocol: 'https:',
        port: '',
      });
    });

    it('builds production admin URL with path', () => {
      expect(buildSubdomainUrlWithPath('admin', '/districts')).toBe(
        'https://admin.stratadash.org/districts'
      );
    });

    it('builds production district URL with path', () => {
      expect(buildSubdomainUrlWithPath('district', '/goals', 'westside')).toBe(
        'https://westside.stratadash.org/goals'
      );
    });

    it('builds production root URL with path', () => {
      expect(buildSubdomainUrlWithPath('root', '/about')).toBe(
        'https://stratadash.org/about'
      );
    });
  });
});

describe('buildDistrictPath', () => {
  it('returns base path when on subdomain', () => {
    expect(buildDistrictPath('/objective/123', 'westside', true)).toBe('/objective/123');
  });

  it('prepends slug when on root domain', () => {
    expect(buildDistrictPath('/objective/123', 'westside', false)).toBe('/district/westside/objective/123');
  });

  it('handles path without leading slash for subdomain', () => {
    expect(buildDistrictPath('objective/123', 'westside', true)).toBe('objective/123');
  });

  it('handles root path for subdomain', () => {
    expect(buildDistrictPath('/', 'westside', true)).toBe('/');
  });

  it('handles root path for path-based routing', () => {
    expect(buildDistrictPath('/', 'westside', false)).toBe('/district/westside/');
  });
});

describe('buildDistrictPathWithQueryParam — root-domain branch', () => {
  it('returns /district/<slug><basePath> when isSubdomain=false', () => {
    expect(buildDistrictPathWithQueryParam('/goals', 'westside', false))
      .toBe('/district/westside/goals');
  });

  it('returns /district/<slug><basePath> when isSubdomain=false and basePath has deep segments', () => {
    expect(buildDistrictPathWithQueryParam('/goals/abc-123', 'westside', false))
      .toBe('/district/westside/goals/abc-123');
  });

  it('returns query-param form on a subdomain in jsdom', () => {
    // In jsdom, window.location.hostname is 'localhost' which is treated as
    // a query-param subdomain host — so the query-param gets appended even
    // when isSubdomain=true.
    expect(buildDistrictPathWithQueryParam('/goals', 'westside', true))
      .toBe('/goals?subdomain=westside');
  });
});

describe('buildDistrictPath — root-domain branch', () => {
  it('returns /district/<slug><basePath> when isSubdomain=false', () => {
    expect(buildDistrictPath('/goals', 'westside', false))
      .toBe('/district/westside/goals');
  });

  it('returns basePath unchanged when isSubdomain=true', () => {
    expect(buildDistrictPath('/goals', 'westside', true)).toBe('/goals');
  });
});
