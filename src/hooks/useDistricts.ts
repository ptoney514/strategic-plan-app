import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DistrictService } from '../lib/services';
import type { District, DistrictWithSummary } from '../lib/types';

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: () => DistrictService.getAll(),
  });
}

export function useDistrict(slug: string) {
  return useQuery({
    queryKey: ['districts', slug],
    queryFn: () => DistrictService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateDistrict() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (district: Partial<District>) => DistrictService.create(district),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });
}

export function useUpdateDistrict() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<District> }) => 
      DistrictService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
      queryClient.invalidateQueries({ queryKey: ['districts', data.slug] });
    },
  });
}

export function useDeleteDistrict() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => DistrictService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });
}