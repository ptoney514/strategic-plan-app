import { apiGet, apiPost, apiDelete } from '../api';
import type { School, SchoolAdmin } from '../types';

export class SchoolAdminService {
  /**
   * Get all schools that a user is admin for
   */
  static async getSchoolsForUser(userId: string): Promise<School[]> {
    return apiGet<School[]>('/school-admins', { userId });
  }

  /**
   * Check if current user can access a specific school
   */
  static async canAccessSchool(districtSlug: string, schoolSlug: string): Promise<boolean> {
    try {
      const result = await apiGet<{ allowed: boolean }>('/school-admins/check', {
        district: districtSlug,
        school: schoolSlug,
      });
      return result.allowed;
    } catch {
      return false;
    }
  }

  /**
   * Assign a user as admin for a school
   */
  static async assignAdmin(
    schoolId: string,
    userId: string,
    options?: { schoolSlug?: string; districtSlug?: string; createdBy?: string }
  ): Promise<SchoolAdmin> {
    return apiPost<SchoolAdmin>('/school-admins', {
      school_id: schoolId,
      user_id: userId,
      school_slug: options?.schoolSlug,
      district_slug: options?.districtSlug,
      created_by: options?.createdBy,
    });
  }

  /**
   * Remove a user as admin from a school
   */
  static async removeAdmin(schoolId: string, userId: string): Promise<void> {
    await apiDelete(`/school-admins/${schoolId}?userId=${userId}`);
  }

  /**
   * Get all admins for a school
   */
  static async getAdminsForSchool(schoolId: string): Promise<SchoolAdmin[]> {
    return apiGet<SchoolAdmin[]>(`/school-admins/${schoolId}`);
  }

  /**
   * Check if a user is school admin (without district admin check)
   */
  static async isSchoolAdmin(schoolSlug: string): Promise<boolean> {
    try {
      const result = await apiGet<{ allowed: boolean }>('/school-admins/check', {
        school: schoolSlug,
      });
      return result.allowed;
    } catch {
      return false;
    }
  }

  /**
   * Get school admin assignments for current user
   */
  static async getMySchoolAssignments(): Promise<SchoolAdmin[]> {
    return apiGet<SchoolAdmin[]>('/school-admins');
  }
}
