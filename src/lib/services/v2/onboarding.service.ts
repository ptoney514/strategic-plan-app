import { apiGet, apiPost } from '../../api';
import type { DashboardTemplate } from '../../types';

export interface SlugCheckResult {
  available: boolean;
  slug: string;
  reason?: string;
  suggestion?: string;
}

export interface CreateOrgData {
  name: string;
  slug: string;
  entity_type: string;
  dashboard_template?: DashboardTemplate;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
}

export interface CreateOrgResult {
  organization: {
    id: string;
    name: string;
    slug: string;
    entity_type: string;
    primary_color: string;
    secondary_color?: string;
    logo_url?: string;
    dashboard_template: string;
    onboarding_completed: boolean;
    created_by: string;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
  };
  membership: {
    id: string;
    role: string;
  };
}

export interface CompleteOnboardingData {
  organization_id: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  dashboard_template?: DashboardTemplate;
}

export interface CompleteOnboardingResult {
  organization: {
    id: string;
    name: string;
    slug: string;
    entity_type: string;
    primary_color: string;
    secondary_color?: string;
    logo_url?: string;
    dashboard_template: string;
    onboarding_completed: boolean;
  };
}

export class OnboardingService {
  static async checkSlug(slug: string): Promise<SlugCheckResult> {
    return apiGet<SlugCheckResult>('/v2/onboarding/check-slug', { slug });
  }

  static async createOrg(data: CreateOrgData): Promise<CreateOrgResult> {
    return apiPost<CreateOrgResult>('/v2/onboarding/create-org', data);
  }

  static async completeOnboarding(
    data: CompleteOnboardingData,
  ): Promise<CompleteOnboardingResult> {
    return apiPost<CompleteOnboardingResult>('/v2/onboarding/complete', data);
  }
}
