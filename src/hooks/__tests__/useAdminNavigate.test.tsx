import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminNavigate, useAdminPath, useQueryString } from '../useAdminNavigate';

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create wrapper with router at specific path
function createWrapper(initialPath: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    );
  };
}

describe('useAdminNavigate', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('preserves query params when navigating', () => {
    const { result } = renderHook(() => useAdminNavigate(), {
      wrapper: createWrapper('/admin/objectives/123?subdomain=westside'),
    });

    act(() => {
      result.current('/admin/objectives');
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin/objectives?subdomain=westside',
      undefined
    );
  });

  it('works with empty query string (production mode)', () => {
    const { result } = renderHook(() => useAdminNavigate(), {
      wrapper: createWrapper('/admin/objectives/123'),
    });

    act(() => {
      result.current('/admin/objectives');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/objectives', undefined);
  });

  it('passes replace option to navigate', () => {
    const { result } = renderHook(() => useAdminNavigate(), {
      wrapper: createWrapper('/admin?subdomain=westside'),
    });

    act(() => {
      result.current('/admin/objectives', { replace: true });
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin/objectives?subdomain=westside',
      { replace: true }
    );
  });

  it('preserves multiple query params', () => {
    const { result } = renderHook(() => useAdminNavigate(), {
      wrapper: createWrapper('/admin?subdomain=westside&debug=true'),
    });

    act(() => {
      result.current('/admin/objectives');
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin/objectives?subdomain=westside&debug=true',
      undefined
    );
  });
});

describe('useAdminPath', () => {
  it('appends query string to path', () => {
    const { result } = renderHook(() => useAdminPath('/admin/objectives'), {
      wrapper: createWrapper('/admin?subdomain=westside'),
    });

    expect(result.current).toBe('/admin/objectives?subdomain=westside');
  });

  it('returns path unchanged when no query string (production)', () => {
    const { result } = renderHook(() => useAdminPath('/admin/objectives'), {
      wrapper: createWrapper('/admin'),
    });

    expect(result.current).toBe('/admin/objectives');
  });

  it('works with nested paths', () => {
    const { result } = renderHook(
      () => useAdminPath('/admin/objectives/create'),
      {
        wrapper: createWrapper('/admin?subdomain=westside'),
      }
    );

    expect(result.current).toBe('/admin/objectives/create?subdomain=westside');
  });
});

describe('useQueryString', () => {
  it('returns query string including ?', () => {
    const { result } = renderHook(() => useQueryString(), {
      wrapper: createWrapper('/admin?subdomain=westside'),
    });

    expect(result.current).toBe('?subdomain=westside');
  });

  it('returns empty string when no query params', () => {
    const { result } = renderHook(() => useQueryString(), {
      wrapper: createWrapper('/admin'),
    });

    expect(result.current).toBe('');
  });

  it('returns full query string with multiple params', () => {
    const { result } = renderHook(() => useQueryString(), {
      wrapper: createWrapper('/admin?subdomain=westside&foo=bar'),
    });

    expect(result.current).toBe('?subdomain=westside&foo=bar');
  });
});
