import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationService } from '../lib/services/invitation.service';
import type { SendInvitationData } from '../lib/services/invitation.service';

export function useOrgInvitations(slug: string) {
  return useQuery({
    queryKey: ['invitations', slug],
    queryFn: () => InvitationService.getOrgInvitations(slug),
    enabled: !!slug,
  });
}

export function useSendInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendInvitationData) =>
      InvitationService.sendInvitation(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', slug] });
    },
  });
}

export function useRevokeInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvitationService.revokeInvitation(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', slug] });
    },
  });
}

export function useResendInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvitationService.resendInvitation(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', slug] });
    },
  });
}

export function useValidateInvitation(token: string) {
  return useQuery({
    queryKey: ['invitation-validation', token],
    queryFn: () => InvitationService.validateToken(token),
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => InvitationService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => InvitationService.declineInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
}

export function useUserInvitations() {
  return useQuery({
    queryKey: ['user-invitations'],
    queryFn: () => InvitationService.getUserInvitations(),
  });
}
