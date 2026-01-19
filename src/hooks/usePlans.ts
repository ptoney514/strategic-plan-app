import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlansService } from '../lib/services';
import type { Plan } from '../lib/types';

/**
 * Get all plans for a district by district ID
 */
export function usePlans(districtId: string) {
  return useQuery({
    queryKey: ['plans', 'district', districtId],
    queryFn: () => PlansService.getByDistrictId(districtId),
    enabled: !!districtId && districtId.length > 0,
  });
}

/**
 * Get all plans for a district by district slug
 */
export function usePlansBySlug(districtSlug: string) {
  return useQuery({
    queryKey: ['plans', 'district-slug', districtSlug],
    queryFn: () => PlansService.getByDistrictSlug(districtSlug),
    enabled: !!districtSlug && districtSlug.length > 0,
  });
}

/**
 * Get plans with objective counts for list view
 */
export function usePlansWithCounts(districtId: string) {
  return useQuery({
    queryKey: ['plans', 'with-counts', districtId],
    queryFn: () => PlansService.getPlansWithCounts(districtId),
    enabled: !!districtId && districtId.length > 0,
  });
}

/**
 * Get all plans for a school by school ID
 */
export function useSchoolPlans(schoolId: string) {
  return useQuery({
    queryKey: ['plans', 'school', schoolId],
    queryFn: () => PlansService.getBySchoolId(schoolId),
    enabled: !!schoolId && schoolId.length > 0,
  });
}

/**
 * Get a single plan by ID
 */
export function usePlan(planId: string) {
  return useQuery({
    queryKey: ['plans', 'single', planId],
    queryFn: () => PlansService.getById(planId),
    enabled: !!planId,
  });
}

/**
 * Get a plan by slug within a district
 */
export function usePlanBySlug(districtId: string, slug: string) {
  return useQuery({
    queryKey: ['plans', 'slug', districtId, slug],
    queryFn: () => PlansService.getBySlug(districtId, slug),
    enabled: !!districtId && !!slug,
  });
}

/**
 * Get plan with summary statistics
 */
export function usePlanWithSummary(planId: string) {
  return useQuery({
    queryKey: ['plans', 'summary', planId],
    queryFn: () => PlansService.getWithSummary(planId),
    enabled: !!planId,
  });
}

/**
 * Get active public plans for a district
 */
export function useActivePlans(districtId: string) {
  return useQuery({
    queryKey: ['plans', 'active', districtId],
    queryFn: () => PlansService.getActiveByDistrictId(districtId),
    enabled: !!districtId,
  });
}

/**
 * Get active public plans for a district by slug
 */
export function useActivePlansBySlug(districtSlug: string) {
  return useQuery({
    queryKey: ['plans', 'active-slug', districtSlug],
    queryFn: () => PlansService.getActiveByDistrictSlug(districtSlug),
    enabled: !!districtSlug,
  });
}

/**
 * Create a new plan
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: Partial<Plan>) => PlansService.create(plan),
    onSuccess: (data) => {
      // Invalidate relevant queries
      if (data.school_id) {
        queryClient.invalidateQueries({ queryKey: ['plans', 'school', data.school_id] });
      }
      if (data.district_id) {
        queryClient.invalidateQueries({ queryKey: ['plans', 'district', data.district_id] });
        queryClient.invalidateQueries({ queryKey: ['plans', 'with-counts', data.district_id] });
        queryClient.invalidateQueries({ queryKey: ['plans', 'active', data.district_id] });
      }
      // Also invalidate slug-based queries
      queryClient.invalidateQueries({ queryKey: ['plans', 'district-slug'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'active-slug'] });
    },
  });
}

/**
 * Update a plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Plan> }) =>
      PlansService.update(id, updates),
    onSuccess: (data) => {
      // Invalidate all plan-related queries
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'single', data.id] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'summary', data.id] });
    },
  });
}

/**
 * Delete a plan
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PlansService.delete(id),
    onSuccess: () => {
      // Invalidate all plan-related queries
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      // Also invalidate goals since deleting a plan cascades to objectives
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

/**
 * Reorder plans
 */
export function useReorderPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plans: { id: string; order_position: number }[]) =>
      PlansService.reorder(plans),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
