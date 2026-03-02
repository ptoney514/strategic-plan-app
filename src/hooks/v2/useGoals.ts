import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsService } from '../../lib/services/goals.service';
import type { Goal } from '../../lib/types';

export function useGoalsByPlan(planId: string) {
  return useQuery({
    queryKey: ['goals', planId],
    queryFn: () => GoalsService.getByPlan(planId, { includeMetrics: false }),
    enabled: !!planId,
  });
}

export function useGoalsByDistrict(districtId: string) {
  return useQuery({
    queryKey: ['goals', 'district', districtId],
    queryFn: () => GoalsService.getByDistrict(districtId),
    enabled: !!districtId,
  });
}

export function useCreateGoal(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Partial<Goal>) => GoalsService.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', planId] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'district'] });
    },
  });
}

export function useUpdateGoal(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      GoalsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', planId] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'district'] });
    },
  });
}

export function useDeleteGoal(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GoalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', planId] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'district'] });
    },
  });
}
