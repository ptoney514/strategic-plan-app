import { apiGet } from '../api';

export interface SystemAdminStats {
  totalDistricts: number;
  totalGoals: number;
  totalUsers: number;
}

export interface DistrictWithStats {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logo_url?: string;
  primary_color?: string;
  is_public: boolean;
  plan_count: number;
  goals_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'system_admin' | 'district_admin' | 'school_admin' | 'editor' | 'viewer';

export interface UserWithRole {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  role: UserRole;
  district_name?: string;
  district_slug?: string;
  school_name?: string;
  created_at: string;
}

export class SystemAdminService {
  /**
   * Get aggregated statistics for the system admin dashboard
   */
  static async getStats(): Promise<SystemAdminStats> {
    return apiGet<SystemAdminStats>('/admin/stats');
  }

  /**
   * Get all districts with goals, schools, and users counts
   */
  static async getDistrictsWithStats(): Promise<DistrictWithStats[]> {
    return apiGet<DistrictWithStats[]>('/admin/districts');
  }

  /**
   * Get recent users (district admins and school admins)
   */
  static async getRecentUsers(limit = 5): Promise<UserWithRole[]> {
    return apiGet<UserWithRole[]>('/admin/recent-users', { limit: String(limit) });
  }
}
