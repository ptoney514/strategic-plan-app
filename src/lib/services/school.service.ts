import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api';
import type { School, SchoolWithSummary } from '../types';

export class SchoolService {
  /**
   * Get all schools for a district by district slug
   */
  static async getByDistrictSlug(districtSlug: string): Promise<School[]> {
    return apiGet<School[]>(`/organizations/${districtSlug}/schools`);
  }

  /**
   * Get a single school by district slug and school slug
   */
  static async getBySlug(districtSlug: string, schoolSlug: string): Promise<SchoolWithSummary | null> {
    try {
      return await apiGet<SchoolWithSummary>(`/schools/${districtSlug}/${schoolSlug}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching school:', error);
      return null;
    }
  }

  /**
   * Get a school by ID
   */
  static async getById(schoolId: string): Promise<School | null> {
    try {
      return await apiGet<School>(`/schools/${schoolId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching school by ID:', error);
      return null;
    }
  }

  /**
   * Create a new school
   */
  static async create(school: Omit<School, 'id' | 'created_at' | 'updated_at'>, districtSlug: string): Promise<School> {
    return apiPost<School>(`/organizations/${districtSlug}/schools`, school);
  }

  /**
   * Update a school
   */
  static async update(schoolId: string, updates: Partial<School>): Promise<School> {
    return apiPut<School>(`/schools/${schoolId}`, updates);
  }

  /**
   * Delete a school
   */
  static async delete(schoolId: string): Promise<void> {
    await apiDelete(`/schools/${schoolId}`);
  }

  /**
   * Get school summary statistics
   */
  static async getSchoolSummary(schoolId: string): Promise<{
    goalCount: number;
    strategyCount: number;
    subGoalCount: number;
    metricCount: number;
  }> {
    return apiGet(`/schools/${schoolId}/summary`);
  }

  /**
   * Get all public schools (for homepage/directory)
   */
  static async getPublicSchools(): Promise<School[]> {
    return apiGet<School[]>('/schools', { public: 'true' });
  }
}
