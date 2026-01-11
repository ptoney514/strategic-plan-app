import { supabase } from '../supabase';

export interface SystemAdminStats {
  totalDistricts: number;
  totalGoals: number;
  totalUsers: number;
  totalSchools: number;
}

export interface DistrictWithStats {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logo_url?: string;
  primary_color?: string;
  is_public: boolean;
  goals_count: number;
  schools_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'system_admin' | 'district_admin' | 'school_admin' | 'editor';

export interface UserWithRole {
  id: string;
  user_id: string;
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
    const [districtsResult, goalsResult, districtAdminsResult, schoolAdminsResult, schoolsResult] =
      await Promise.all([
        supabase.from('spb_districts').select('id', { count: 'exact', head: true }),
        supabase.from('spb_goals').select('id', { count: 'exact', head: true }),
        supabase.from('spb_district_admins').select('user_id', { count: 'exact', head: true }),
        supabase.from('spb_school_admins').select('user_id', { count: 'exact', head: true }),
        supabase.from('spb_schools').select('id', { count: 'exact', head: true }),
      ]);

    // Total users = district admins + school admins (may have overlap)
    const totalUsers = (districtAdminsResult.count || 0) + (schoolAdminsResult.count || 0);

    return {
      totalDistricts: districtsResult.count || 0,
      totalGoals: goalsResult.count || 0,
      totalUsers,
      totalSchools: schoolsResult.count || 0,
    };
  }

  /**
   * Get all districts with goals, schools, and users counts
   */
  static async getDistrictsWithStats(): Promise<DistrictWithStats[]> {
    const { data: districts, error } = await supabase
      .from('spb_districts')
      .select('*')
      .order('name');

    if (error) {
      console.error('[SystemAdminService] Error fetching districts:', error);
      throw error;
    }

    if (!districts) return [];

    const districtsWithStats = await Promise.all(
      districts.map(async (district) => {
        const [goalsResult, schoolsResult, districtAdminsResult] = await Promise.all([
          supabase
            .from('spb_goals')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),
          supabase
            .from('spb_schools')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),
          supabase
            .from('spb_district_admins')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),
        ]);

        // Get school admin count for schools in this district
        let schoolAdminCount = 0;
        if (schoolsResult.count && schoolsResult.count > 0) {
          const { data: schools } = await supabase
            .from('spb_schools')
            .select('id')
            .eq('district_id', district.id);

          if (schools && schools.length > 0) {
            const schoolIds = schools.map((s) => s.id);
            const { count } = await supabase
              .from('spb_school_admins')
              .select('id', { count: 'exact', head: true })
              .in('school_id', schoolIds);
            schoolAdminCount = count || 0;
          }
        }

        return {
          id: district.id,
          name: district.name,
          slug: district.slug,
          tagline: district.tagline,
          logo_url: district.logo_url,
          primary_color: district.primary_color,
          is_public: district.is_public,
          goals_count: goalsResult.count || 0,
          schools_count: schoolsResult.count || 0,
          users_count: (districtAdminsResult.count || 0) + schoolAdminCount,
          created_at: district.created_at,
          updated_at: district.updated_at,
        };
      })
    );

    return districtsWithStats;
  }

  /**
   * Get recent users (district admins and school admins)
   */
  static async getRecentUsers(limit = 5): Promise<UserWithRole[]> {
    // Fetch recent district admins with district info
    const { data: districtAdmins } = await supabase
      .from('spb_district_admins')
      .select(
        `
        id,
        user_id,
        district_slug,
        created_at,
        spb_districts!inner(name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Fetch recent school admins with school info
    const { data: schoolAdmins } = await supabase
      .from('spb_school_admins')
      .select(
        `
        id,
        user_id,
        school_slug,
        district_slug,
        created_at,
        spb_schools!inner(name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Combine and format
    const combined: UserWithRole[] = [
      ...(districtAdmins || []).map((da) => ({
        id: da.id,
        user_id: da.user_id,
        role: 'district_admin' as const,
        district_name: (da.spb_districts as { name: string } | null)?.name,
        district_slug: da.district_slug,
        created_at: da.created_at,
      })),
      ...(schoolAdmins || []).map((sa) => ({
        id: sa.id,
        user_id: sa.user_id,
        role: 'school_admin' as const,
        school_name: (sa.spb_schools as { name: string } | null)?.name,
        district_slug: sa.district_slug,
        created_at: sa.created_at,
      })),
    ];

    // Sort by created_at descending and take limit
    return combined
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}
