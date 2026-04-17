import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  SubdomainOverrideProvider,
  SubdomainProvider,
  useDistrictLink,
} from '../SubdomainContext';

describe('useDistrictLink', () => {
  it('returns query-param form on a district subdomain context (jsdom host = localhost)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SubdomainOverrideProvider slug="westside">
        {children}
      </SubdomainOverrideProvider>
    );

    const { result } = renderHook(() => useDistrictLink(), { wrapper });
    // In jsdom, window.location.hostname is 'localhost' which is treated
    // as a query-param subdomain host — so the query-param gets appended
    // even though isSubdomain is true from the provider.
    expect(result.current('/goals/abc')).toBe('/goals/abc?subdomain=westside');
  });

  it('returns /district/<slug><basePath> when an explicit slug is passed and no provider wraps', () => {
    // SubdomainProvider calls getSubdomainInfo() which returns {type: 'root', slug: null}
    // in jsdom (hostname = 'localhost', no subdomain detected).
    // Passing an explicit districtSlug makes isSubdomain=false (context type is 'root'),
    // so the root-domain branch of buildDistrictPathWithQueryParam fires — the
    // exact branch Task 1 fixed.
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SubdomainProvider>{children}</SubdomainProvider>
    );

    const { result } = renderHook(() => useDistrictLink('westside'), { wrapper });
    expect(result.current('/goals/abc')).toBe('/district/westside/goals/abc');
  });
});
