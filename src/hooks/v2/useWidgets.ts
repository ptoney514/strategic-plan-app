import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WidgetService } from '../../lib/services/v2/widget.service';
import type { CreateWidgetPayload, UpdateWidgetPayload, ReorderWidgetPayload } from '../../lib/types/v2';

export function useWidgets(orgSlug: string) {
  return useQuery({
    queryKey: ['widgets', orgSlug],
    queryFn: () => WidgetService.list(orgSlug),
    enabled: !!orgSlug,
  });
}

export function usePublicWidgets(orgSlug: string) {
  return useQuery({
    queryKey: ['widgets', 'public', orgSlug],
    queryFn: () => WidgetService.listPublic(orgSlug),
    enabled: !!orgSlug,
  });
}

export function useCreateWidget(orgSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWidgetPayload) => WidgetService.create(orgSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useUpdateWidget(_orgSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWidgetPayload }) =>
      WidgetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useDeleteWidget(_orgSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => WidgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useReorderWidgets(_orgSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderWidgetPayload) => WidgetService.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useWidgetsByGoal(goalId: string) {
  return useQuery({
    queryKey: ['widgets', 'goal', goalId],
    queryFn: () => WidgetService.getByGoal(goalId),
    enabled: !!goalId,
  });
}

export function useWidgetsByGoals(goalIds: string[]) {
  const key = goalIds.sort().join(',');
  return useQuery({
    queryKey: ['widgets', 'goals', key],
    queryFn: () => WidgetService.getByGoals(goalIds),
    enabled: goalIds.length > 0,
  });
}
