import { describe, it, expect, afterEach } from 'vitest';
import { getCookieDomain } from '../cookie-domain';

/**
 * Mock window.location for testing different environments
 */
function mockWindowLocation(overrides: Partial<Location>) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

  const mockLocation = {
    hostname: 'localhost',
    protocol: 'http:',
    port: '5173',
    origin: 'http://localhost:5173',
    search: '',
    hash: '',
    pathname: '/',
    href: 'http://localhost:5173/',
    host: 'localhost:5173',
    ancestorOrigins: {} as DOMStringList,
    assign: () => {},
    reload: () => {},
    replace: () => {},
    toString: () => 'http://localhost:5173/',
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

describe('getCookieDomain', () => {
  let cleanup: () => void;

  afterEach(() => {
    cleanup?.();
  });

  describe('production domains', () => {
    it('returns .stratadash.org for stratadash.org', () => {
      cleanup = mockWindowLocation({ hostname: 'stratadash.org' });
      expect(getCookieDomain()).toBe('.stratadash.org');
    });

    it('returns .stratadash.org for www.stratadash.org', () => {
      cleanup = mockWindowLocation({ hostname: 'www.stratadash.org' });
      expect(getCookieDomain()).toBe('.stratadash.org');
    });

    it('returns .stratadash.org for district subdomains (westside.stratadash.org)', () => {
      cleanup = mockWindowLocation({ hostname: 'westside.stratadash.org' });
      expect(getCookieDomain()).toBe('.stratadash.org');
    });

    it('returns .stratadash.org for admin.stratadash.org', () => {
      cleanup = mockWindowLocation({ hostname: 'admin.stratadash.org' });
      expect(getCookieDomain()).toBe('.stratadash.org');
    });
  });

  describe('local development with lvh.me', () => {
    it('returns .lvh.me for lvh.me', () => {
      cleanup = mockWindowLocation({ hostname: 'lvh.me' });
      expect(getCookieDomain()).toBe('.lvh.me');
    });

    it('returns .lvh.me for westside.lvh.me', () => {
      cleanup = mockWindowLocation({ hostname: 'westside.lvh.me' });
      expect(getCookieDomain()).toBe('.lvh.me');
    });

    it('returns .lvh.me for admin.lvh.me', () => {
      cleanup = mockWindowLocation({ hostname: 'admin.lvh.me' });
      expect(getCookieDomain()).toBe('.lvh.me');
    });
  });

  describe('localhost (cannot share cookies)', () => {
    it('returns undefined for localhost', () => {
      cleanup = mockWindowLocation({ hostname: 'localhost' });
      expect(getCookieDomain()).toBeUndefined();
    });

    it('returns undefined for 127.0.0.1', () => {
      cleanup = mockWindowLocation({ hostname: '127.0.0.1' });
      expect(getCookieDomain()).toBeUndefined();
    });
  });

  describe('other domains', () => {
    it('returns undefined for vercel.app preview deployments', () => {
      cleanup = mockWindowLocation({ hostname: 'my-app-xyz123.vercel.app' });
      expect(getCookieDomain()).toBeUndefined();
    });

    it('returns undefined for arbitrary domains', () => {
      cleanup = mockWindowLocation({ hostname: 'example.com' });
      expect(getCookieDomain()).toBeUndefined();
    });
  });

  describe('explicit hostname (server-side callers)', () => {
    it('resolves production hosts', () => {
      expect(getCookieDomain('westside.stratadash.org')).toBe('.stratadash.org');
      expect(getCookieDomain('www.stratadash.org')).toBe('.stratadash.org');
    });

    it('resolves lvh.me hosts', () => {
      expect(getCookieDomain('admin.lvh.me')).toBe('.lvh.me');
    });

    it('strips a port from the host header before matching', () => {
      expect(getCookieDomain('westside.stratadash.org:443')).toBe('.stratadash.org');
      expect(getCookieDomain('lvh.me:5174')).toBe('.lvh.me');
    });

    it('returns undefined for localhost and vercel preview hosts', () => {
      expect(getCookieDomain('localhost')).toBeUndefined();
      expect(getCookieDomain('localhost:5174')).toBeUndefined();
      expect(getCookieDomain('my-app.vercel.app')).toBeUndefined();
    });
  });
});
