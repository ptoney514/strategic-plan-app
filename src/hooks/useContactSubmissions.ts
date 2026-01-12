import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactService } from '../lib/services/contact.service';

export function useContactSubmissions() {
  return useQuery({
    queryKey: ['contactSubmissions'],
    queryFn: () => ContactService.getAll(),
  });
}

export function useUpdateContactSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ContactService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
    },
  });
}

export function useDeleteContactSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ContactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
    },
  });
}
