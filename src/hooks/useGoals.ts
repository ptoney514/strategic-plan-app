import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsService } from '../lib/services';
import type { Goal } from '../lib/types';

export function useGoals(districtId: string) {
  return useQuery({
    queryKey: ['goals', 'district', districtId],
    queryFn: () => GoalsService.getByDistrict(districtId),
    enabled: !!districtId && districtId.length > 0,
    retry: false, // Don't retry on failure
  });
}

/**
 * Hook to fetch goals (objectives) for a specific plan
 * @param planId - The plan ID to fetch objectives for
 */
export function usePlanGoals(planId: string) {
  return useQuery({
    queryKey: ['goals', 'plan', planId],
    queryFn: () => GoalsService.getByPlan(planId),
    enabled: !!planId && planId.length > 0,
    retry: false,
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', 'single', id],
    queryFn: () => GoalsService.getById(id),
    enabled: !!id,
  });
}

export function useChildGoals(parentId: string) {
  return useQuery({
    queryKey: ['goals', 'children', parentId],
    queryFn: () => GoalsService.getChildren(parentId),
    enabled: !!parentId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Partial<Goal>) => GoalsService.create(goal),
    onSuccess: (data) => {
      // Invalidate the district goals list
      if (data.district_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', 'district', data.district_id] });
      }
      if (data.parent_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', 'children', data.parent_id] });
      }
      // Invalidate plan goals if this goal belongs to a plan
      if (data.plan_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', 'plan', data.plan_id] });
        // Also invalidate plan summaries (objective counts)
        queryClient.invalidateQueries({ queryKey: ['plans'] });
      }
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => 
      GoalsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'single', data.id] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => GoalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useReorderGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goals: { id: string; order_position: number }[]) =>
      GoalsService.reorder(goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

/**
 * Hook to reorder and renumber goals
 */
export function useReorderAndRenumberGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      districtId,
      parentId,
      reorderedGoals,
    }: {
      districtId?: string;
      parentId: string | null;
      reorderedGoals: { id: string; order_position: number }[];
    }) => GoalsService.reorderAndRenumber({ districtId }, parentId, reorderedGoals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
