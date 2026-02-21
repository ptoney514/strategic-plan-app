import { apiGet, apiPost, apiDelete } from '../api';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string | null;
  invited_by_name?: string | null;
  invited_by_email?: string | null;
}

export interface InvitationWithOrg {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

export interface InvitationValidation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

export interface AcceptedMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string | null;
}

export interface SendInvitationData {
  email: string;
  role: string;
  message?: string;
}

export class InvitationService {
  static async getOrgInvitations(slug: string): Promise<Invitation[]> {
    return apiGet<Invitation[]>(`/organizations/${slug}/invitations`);
  }

  static async sendInvitation(slug: string, data: SendInvitationData): Promise<Invitation> {
    return apiPost<Invitation>(`/organizations/${slug}/invitations`, data);
  }

  static async revokeInvitation(slug: string, id: string): Promise<void> {
    await apiDelete(`/organizations/${slug}/invitations/${id}`);
  }

  static async resendInvitation(slug: string, id: string): Promise<Invitation> {
    return apiPost<Invitation>(`/organizations/${slug}/invitations/${id}/resend`, {});
  }

  static async validateToken(token: string): Promise<InvitationValidation> {
    return apiGet<InvitationValidation>(`/invitations/${token}`);
  }

  static async acceptInvitation(token: string): Promise<AcceptedMembership> {
    return apiPost<AcceptedMembership>(`/invitations/${token}/accept`, {});
  }

  static async declineInvitation(token: string): Promise<void> {
    await apiPost(`/invitations/${token}/decline`, {});
  }

  static async getUserInvitations(): Promise<InvitationWithOrg[]> {
    return apiGet<InvitationWithOrg[]>('/user/invitations');
  }
}
