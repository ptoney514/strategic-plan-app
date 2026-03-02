import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlansService } from '../../lib/services/plans.service';
import type { Plan } from '../../lib/types';

export function usePlansBySlug(slug: string) {
  return useQuery({
    queryKey: ['plans', slug],
    queryFn: () => PlansService.getByDistrictSlug(slug),
    enabled: !!slug,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: Partial<Plan>) => PlansService.create(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Plan> }) =>
      PlansService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PlansService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
