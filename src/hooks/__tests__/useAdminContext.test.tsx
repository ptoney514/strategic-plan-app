import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAdminContext, useContextDisplayName, useIsActiveSection } from '../useAdminContext';
import type { District, School } from '../../lib/types';

// Mock the hooks that useAdminContext depends on
vi.mock('../useDistricts', () => ({
  useDistrict: vi.fn(),
}));

vi.mock('../useSchools', () => ({
  useSchools: vi.fn(),
  useSchool: vi.fn(),
}));

// Import mocked modules
import { useDistrict } from '../useDistricts';
import { useSchools, useSchool } from '../useSchools';

// Mock data
const mockDistrict: District = {
  id: 'dist-1',
  name: 'Test District',
  slug: 'test-district',
  primary_color: '#D97706',
  admin_email: 'admin@test.com',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSchools: School[] = [
  {
    id: 'school-1',
    district_id: 'dist-1',
    name: 'Elementary School',
    slug: 'elementary',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockSchool: School = mockSchools[0];

// Create wrapper with router and query client
// NOTE: These tests use subdomain-based routing where the slug comes from the subdomain,
// NOT from the URL path. The routes are /admin (not /:slug/admin).
// However, the hook still relies on useParams for backwards compatibility,
// so we simulate this by using path-based routes in tests.
function createWrapper(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            {/* Subdomain-based routes - slug is NOT in URL path */}
            <Route path="/admin/*" element={children} />
            <Route path="/schools/:schoolSlug/admin/*" element={children} />
            {/* Legacy path-based routes - kept for backwards compatibility in tests */}
            <Route path="/:slug/admin/*" element={children} />
            <Route path="/:slug/schools/:schoolSlug/admin/*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAdminContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    vi.mocked(useDistrict).mockReturnValue({
      data: mockDistrict,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchools).mockReturnValue({
      data: mockSchools,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchool).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);
  });

  it('returns district context type when on district admin route', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.type).toBe('district');
  });

  it('returns school context type when on school admin route', () => {
    vi.mocked(useSchool).mockReturnValue({
      data: mockSchool,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/schools/elementary/admin'),
    });

    expect(result.current.type).toBe('school');
  });

  it('returns correct district slug', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.districtSlug).toBe('test-district');
  });

  it('returns school slug when in school context', () => {
    vi.mocked(useSchool).mockReturnValue({
      data: mockSchool,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/schools/elementary/admin'),
    });

    expect(result.current.schoolSlug).toBe('elementary');
  });

  it('returns district data', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.district).toEqual(mockDistrict);
  });

  it('returns schools array', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.schools).toEqual(mockSchools);
  });

  // SUBDOMAIN ROUTING: basePath should NOT include the district slug
  // because the slug is in the subdomain (e.g., westside.stratadash.org/admin)
  it('returns correct basePath for district context (subdomain routing)', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    // With subdomain routing, basePath should be '/admin' not '/test-district/admin'
    expect(result.current.basePath).toBe('/admin');
  });

  it('returns correct basePath for school context (subdomain routing)', () => {
    vi.mocked(useSchool).mockReturnValue({
      data: mockSchool,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/schools/elementary/admin'),
    });

    // With subdomain routing, basePath should NOT include district slug
    expect(result.current.basePath).toBe('/schools/elementary/admin');
  });

  it('returns correct publicUrl for district context (subdomain routing)', () => {
    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    // With subdomain routing, publicUrl should be '/' not '/test-district'
    expect(result.current.publicUrl).toBe('/');
  });

  it('returns correct publicUrl for school context (subdomain routing)', () => {
    vi.mocked(useSchool).mockReturnValue({
      data: mockSchool,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/schools/elementary/admin'),
    });

    // With subdomain routing, publicUrl should NOT include district slug
    expect(result.current.publicUrl).toBe('/schools/elementary');
  });

  it('returns isLoading true when district is loading', () => {
    vi.mocked(useDistrict).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns isLoading true when schools are loading', () => {
    vi.mocked(useSchools).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as any);

    const { result } = renderHook(() => useAdminContext(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useContextDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDistrict).mockReturnValue({
      data: mockDistrict,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchools).mockReturnValue({
      data: mockSchools,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchool).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);
  });

  it('returns district name in district context', () => {
    const { result } = renderHook(() => useContextDisplayName(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current).toBe('Test District');
  });

  it('returns school name in school context', () => {
    vi.mocked(useSchool).mockReturnValue({
      data: mockSchool,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { result } = renderHook(() => useContextDisplayName(), {
      wrapper: createWrapper('/test-district/schools/elementary/admin'),
    });

    expect(result.current).toBe('Elementary School');
  });

  it('returns Loading... when district data is not available', () => {
    vi.mocked(useDistrict).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as any);

    const { result } = renderHook(() => useContextDisplayName(), {
      wrapper: createWrapper('/test-district/admin'),
    });

    expect(result.current).toBe('Loading...');
  });
});

describe('useIsActiveSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDistrict).mockReturnValue({
      data: mockDistrict,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchools).mockReturnValue({
      data: mockSchools,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    vi.mocked(useSchool).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);
  });

  // With subdomain routing, basePath is '/admin', so we test with '/admin' path
  it('returns true for overview section on base admin path (subdomain routing)', () => {
    const { result } = renderHook(() => useIsActiveSection('overview'), {
      wrapper: createWrapper('/admin'),
    });

    expect(result.current).toBe(true);
  });

  it('returns true for dashboard section on base admin path (subdomain routing)', () => {
    const { result } = renderHook(() => useIsActiveSection('dashboard'), {
      wrapper: createWrapper('/admin'),
    });

    expect(result.current).toBe(true);
  });

  it('returns false for non-matching section', () => {
    const { result } = renderHook(() => useIsActiveSection('objectives'), {
      wrapper: createWrapper('/admin'),
    });

    expect(result.current).toBe(false);
  });
});
