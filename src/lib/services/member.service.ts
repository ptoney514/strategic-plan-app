import { apiGet, apiPut, apiDelete } from '../api';

export interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
  user_name: string | null;
  user_email: string;
  user_image: string | null;
}

export interface UpdatedMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export class MemberService {
  static async getOrgMembers(slug: string): Promise<Member[]> {
    return apiGet<Member[]>(`/organizations/${slug}/members`);
  }

  static async updateMemberRole(slug: string, id: string, role: string): Promise<UpdatedMember> {
    return apiPut<UpdatedMember>(`/organizations/${slug}/members/${id}`, { role });
  }

  static async removeMember(slug: string, id: string): Promise<void> {
    await apiDelete(`/organizations/${slug}/members/${id}`);
  }
}
