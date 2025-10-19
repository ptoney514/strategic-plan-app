import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsService } from '../lib/services';
import type { Goal, HierarchicalGoal } from '../lib/types';

export function useGoals(districtId: string) {
  return useQuery({
    queryKey: ['goals', districtId],
    queryFn: () => GoalsService.getByDistrict(districtId),
    enabled: !!districtId && districtId.length > 0,
    retry: false, // Don't retry on failure
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
      queryClient.invalidateQueries({ queryKey: ['goals', data.district_id] });
      if (data.parent_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', 'children', data.parent_id] });
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