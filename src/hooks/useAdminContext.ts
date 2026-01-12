import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDistrict } from './useDistricts';
import { useSchools, useSchool } from './useSchools';

export type AdminContextType = 'district' | 'school';

export interface AdminContext {
  type: AdminContextType;
  districtSlug: string;
  schoolSlug?: string;
  district: ReturnType<typeof useDistrict>['data'];
  school: ReturnType<typeof useSchool>['data'];
  schools: ReturnType<typeof useSchools>['data'];
  isLoading: boolean;
  basePath: string;
  publicUrl: string;
}

/**
 * Hook to determine the current admin context (district or school)
 * and provide relevant data for navigation and routing
 */
export function useAdminContext(): AdminContext {
  const { slug: districtSlug = '', schoolSlug } = useParams<{ slug: string; schoolSlug?: string }>();
  const location = useLocation();

  // Fetch district data
  const { data: district, isLoading: districtLoading } = useDistrict(districtSlug);

  // Fetch all schools for the district (for navigation)
  const { data: schools = [], isLoading: schoolsLoading } = useSchools(districtSlug);

  // Fetch specific school if in school context
  const { data: school, isLoading: schoolLoading } = useSchool(districtSlug, schoolSlug || '');

  // Determine context type based on URL
  const type: AdminContextType = schoolSlug ? 'school' : 'district';

  // Compute base path for navigation
  const basePath = useMemo(() => {
    if (schoolSlug) {
      return `/${districtSlug}/schools/${schoolSlug}/admin`;
    }
    return `/${districtSlug}/admin`;
  }, [districtSlug, schoolSlug]);

  // Compute public URL
  const publicUrl = useMemo(() => {
    if (schoolSlug) {
      return `/${districtSlug}/schools/${schoolSlug}`;
    }
    return `/${districtSlug}`;
  }, [districtSlug, schoolSlug]);

  const isLoading = districtLoading || schoolsLoading || (schoolSlug ? schoolLoading : false);

  return {
    type,
    districtSlug,
    schoolSlug,
    district,
    school,
    schools,
    isLoading,
    basePath,
    publicUrl,
  };
}

/**
 * Get the display name for the current context
 */
export function useContextDisplayName(): string {
  const { type, district, school } = useAdminContext();

  if (type === 'school' && school) {
    return school.name;
  }

  return district?.name || 'Loading...';
}

/**
 * Check if we're currently viewing a specific section
 */
export function useIsActiveSection(section: string): boolean {
  const location = useLocation();
  const { basePath } = useAdminContext();

  if (section === 'overview' || section === 'dashboard') {
    return location.pathname === basePath;
  }

  return location.pathname.includes(`${basePath}/${section}`);
}
