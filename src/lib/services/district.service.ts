import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api';
import type { District } from '../types';

export class DistrictService {
  static async getAll(): Promise<District[]> {
    console.log('[DistrictService] Fetching all districts with counts...');

    const districts = await apiGet<District[]>('/organizations');

    console.log(`[DistrictService] Loaded ${districts?.length || 0} districts with counts`);
    return districts || [];
  }

  static async getBySlug(slug: string): Promise<District | null> {
    try {
      return await apiGet<District>(`/organizations/${slug}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching district:', error);
      return null;
    }
  }

  static async getById(id: string): Promise<District> {
    const district = await apiGet<District>('/organizations', { id });
    return district;
  }

  static async create(district: Partial<District>): Promise<District> {
    return apiPost<District>('/organizations', {
      name: district.name,
      slug: district.slug,
      entity_type: district.entity_type || 'district',
      entity_label: district.entity_label,
      logo_url: district.logo_url,
      primary_color: district.primary_color,
      secondary_color: district.secondary_color,
      admin_email: district.admin_email,
      tagline: district.tagline,
      is_public: district.is_public,
      settings: district.settings,
    });
  }

  static async update(id: string, updates: Partial<District>): Promise<District> {
    // Need slug for the API route; look up by ID first
    const existing = await this.getById(id);
    return apiPut<District>(`/organizations/${existing.slug}`, updates);
  }

  static async delete(id: string): Promise<void> {
    // Need slug for the API route; look up by ID first
    const existing = await this.getById(id);
    await apiDelete(`/organizations/${existing.slug}`);
  }
}
