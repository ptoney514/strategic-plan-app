import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberService } from '../../lib/services/member.service';

export function useOrgMembers(slug: string) {
  return useQuery({
    queryKey: ['members', slug],
    queryFn: () => MemberService.getOrgMembers(slug),
    enabled: !!slug,
  });
}

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      MemberService.updateMemberRole(slug, id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', slug] });
    },
  });
}

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MemberService.removeMember(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', slug] });
    },
  });
}
