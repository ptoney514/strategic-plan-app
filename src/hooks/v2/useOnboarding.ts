import { useQuery, useMutation } from '@tanstack/react-query';
import {
  OnboardingService,
  type CreateOrgData,
  type CompleteOnboardingData,
} from '../../lib/services/v2/onboarding.service';

/**
 * Check slug availability with debounced query.
 * Enable only when slug is at least 3 characters.
 */
export function useCheckSlug(slug: string) {
  return useQuery({
    queryKey: ['onboarding', 'check-slug', slug],
    queryFn: () => OnboardingService.checkSlug(slug),
    enabled: slug.length >= 3,
    staleTime: 10_000, // Cache for 10s to reduce API calls during typing
    retry: false,
  });
}

/**
 * Mutation to create a new organization during onboarding.
 */
export function useCreateOrg() {
  return useMutation({
    mutationFn: (data: CreateOrgData) => OnboardingService.createOrg(data),
  });
}

/**
 * Mutation to complete the onboarding process.
 */
export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: (data: CompleteOnboardingData) =>
      OnboardingService.completeOnboarding(data),
  });
}
