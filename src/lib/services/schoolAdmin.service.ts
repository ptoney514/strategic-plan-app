import { supabase } from '../supabase';
import type { School, SchoolAdmin } from '../types';

export class SchoolAdminService {
  /**
   * Get all schools that a user is admin for
   */
  static async getSchoolsForUser(userId: string): Promise<School[]> {
    const { data: adminAssignments, error: adminError } = await supabase
      .from('spb_school_admins')
      .select('school_id')
      .eq('user_id', userId);

    if (adminError || !adminAssignments || adminAssignments.length === 0) {
      return [];
    }

    const schoolIds = adminAssignments.map(a => a.school_id);

    const { data: schools, error: schoolsError } = await supabase
      .from('spb_schools')
      .select('*')
      .in('id', schoolIds)
      .order('name');

    if (schoolsError) {
      console.error('Error fetching schools for user:', schoolsError);
      return [];
    }

    return schools || [];
  }

  /**
   * Check if current user can access a specific school
   * Returns true if user is:
   * - System admin
   * - District admin for the school's district
   * - School admin for the specific school
   */
  static async canAccessSchool(districtSlug: string, schoolSlug: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Check if system admin
    const isSystemAdmin = user.user_metadata?.role === 'system_admin' ||
                          user.app_metadata?.role === 'system_admin';

    if (isSystemAdmin) {
      return true;
    }

    // Check if district admin
    const { data: districtAdminCheck } = await supabase
      .from('spb_district_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('district_slug', districtSlug)
      .single();

    if (districtAdminCheck) {
      return true;
    }

    // Check if school admin
    const { data: schoolAdminCheck } = await supabase
      .from('spb_school_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('district_slug', districtSlug)
      .eq('school_slug', schoolSlug)
      .single();

    return !!schoolAdminCheck;
  }

  /**
   * Assign a user as admin for a school
   */
  static async assignAdmin(
    schoolId: string,
    userId: string,
    createdBy?: string
  ): Promise<SchoolAdmin> {
    // Get school details to populate denormalized fields
    const { data: school, error: schoolError } = await supabase
      .from('spb_schools')
      .select('slug, district_id')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      throw new Error('School not found');
    }

    // Get district slug
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('slug')
      .eq('id', school.district_id)
      .single();

    if (districtError || !district) {
      throw new Error('District not found');
    }

    const { data, error } = await supabase
      .from('spb_school_admins')
      .insert({
        user_id: userId,
        school_id: schoolId,
        school_slug: school.slug,
        district_slug: district.slug,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning school admin:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a user as admin from a school
   */
  static async removeAdmin(schoolId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('spb_school_admins')
      .delete()
      .eq('school_id', schoolId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing school admin:', error);
      throw error;
    }
  }

  /**
   * Get all admins for a school
   */
  static async getAdminsForSchool(schoolId: string): Promise<SchoolAdmin[]> {
    const { data, error } = await supabase
      .from('spb_school_admins')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      console.error('Error fetching school admins:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if a user is school admin (without district admin check)
   */
  static async isSchoolAdmin(schoolSlug: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from('spb_school_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_slug', schoolSlug)
      .single();

    return !!data;
  }

  /**
   * Get school admin assignments for current user
   */
  static async getMySchoolAssignments(): Promise<SchoolAdmin[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('spb_school_admins')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching my school assignments:', error);
      return [];
    }

    return data || [];
  }
}
