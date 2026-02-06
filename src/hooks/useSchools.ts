import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchoolService, SchoolAdminService } from '../lib/services';
import type { School } from '../lib/types';

/**
 * Get all schools for a district
 */
export function useSchools(districtSlug: string) {
  return useQuery({
    queryKey: ['schools', districtSlug],
    queryFn: () => SchoolService.getByDistrictSlug(districtSlug),
    enabled: !!districtSlug,
  });
}

/**
 * Get a single school by district slug and school slug
 */
export function useSchool(districtSlug: string, schoolSlug: string) {
  return useQuery({
    queryKey: ['schools', districtSlug, schoolSlug],
    queryFn: () => SchoolService.getBySlug(districtSlug, schoolSlug),
    enabled: !!districtSlug && !!schoolSlug,
  });
}

/**
 * Get a school by ID
 */
export function useSchoolById(schoolId: string) {
  return useQuery({
    queryKey: ['schools', 'by-id', schoolId],
    queryFn: () => SchoolService.getById(schoolId),
    enabled: !!schoolId,
  });
}

/**
 * Get all public schools
 */
export function usePublicSchools() {
  return useQuery({
    queryKey: ['schools', 'public'],
    queryFn: () => SchoolService.getPublicSchools(),
  });
}

/**
 * Create a new school
 */
export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ school, districtSlug }: { school: Omit<School, 'id' | 'created_at' | 'updated_at'>; districtSlug: string }) =>
      SchoolService.create(school, districtSlug),
    onSuccess: (_data) => {
      // Invalidate the schools list for the district
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

/**
 * Update a school
 */
export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, updates }: { schoolId: string; updates: Partial<School> }) =>
      SchoolService.update(schoolId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'by-id', data.id] });
    },
  });
}

/**
 * Delete a school
 */
export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) => SchoolService.delete(schoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

/**
 * Get school summary statistics
 */
export function useSchoolSummary(schoolId: string) {
  return useQuery({
    queryKey: ['schools', schoolId, 'summary'],
    queryFn: () => SchoolService.getSchoolSummary(schoolId),
    enabled: !!schoolId,
  });
}

/**
 * Get schools for current user (if they are a school admin)
 */
export function useMySchools() {
  return useQuery({
    queryKey: ['schools', 'my-schools'],
    queryFn: () => SchoolAdminService.getMySchoolAssignments(),
  });
}

/**
 * Check if current user can access a school
 */
export function useCanAccessSchool(districtSlug: string, schoolSlug: string) {
  return useQuery({
    queryKey: ['schools', 'access', districtSlug, schoolSlug],
    queryFn: () => SchoolAdminService.canAccessSchool(districtSlug, schoolSlug),
    enabled: !!districtSlug && !!schoolSlug,
  });
}

/**
 * Get school admins for a school
 */
export function useSchoolAdmins(schoolId: string) {
  return useQuery({
    queryKey: ['school-admins', schoolId],
    queryFn: () => SchoolAdminService.getAdminsForSchool(schoolId),
    enabled: !!schoolId,
  });
}

/**
 * Assign a school admin
 */
export function useAssignSchoolAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, userId, schoolSlug, districtSlug, createdBy }: { schoolId: string; userId: string; schoolSlug?: string; districtSlug?: string; createdBy?: string }) =>
      SchoolAdminService.assignAdmin(schoolId, userId, { schoolSlug, districtSlug, createdBy }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school-admins', data.school_id] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'my-schools'] });
    },
  });
}

/**
 * Remove a school admin
 */
export function useRemoveSchoolAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, userId }: { schoolId: string; userId: string }) =>
      SchoolAdminService.removeAdmin(schoolId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-admins', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'my-schools'] });
    },
  });
}
