import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OnboardingService } from '../onboarding.service';

describe('OnboardingService', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;

    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe('checkSlug', () => {
    it('should call the correct URL with slug query param', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ available: true, slug: 'westside' }),
      });

      await OnboardingService.checkSlug('westside');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/onboarding/check-slug?slug=westside',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should return available: true for a valid slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ available: true, slug: 'newdistrict' }),
      });

      const result = await OnboardingService.checkSlug('newdistrict');

      expect(result.available).toBe(true);
      expect(result.slug).toBe('newdistrict');
    });

    it('should return available: false with reason for taken slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            available: false,
            slug: 'westside',
            reason: 'This URL is already taken',
            suggestion: 'westside-123',
          }),
      });

      const result = await OnboardingService.checkSlug('westside');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('This URL is already taken');
      expect(result.suggestion).toBe('westside-123');
    });

    it('should return available: false for reserved slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            available: false,
            slug: 'admin',
            reason: 'This URL is reserved',
            suggestion: 'admin-org',
          }),
      });

      const result = await OnboardingService.checkSlug('admin');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('This URL is reserved');
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(OnboardingService.checkSlug('test')).rejects.toThrow();
    });
  });

  describe('createOrg', () => {
    const orgData = {
      name: 'Westside District',
      slug: 'westside',
      entity_type: 'school_district',
    };

    it('should call the correct URL with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            organization: { id: 'org-1', name: 'Westside District', slug: 'westside' },
            plan: { id: 'plan-1', name: 'Strategic Plan', slug: 'strategic-plan' },
            membership: { id: 'mem-1', role: 'owner' },
          }),
      });

      await OnboardingService.createOrg(orgData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/onboarding/create-org',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orgData),
        }),
      );
    });

    it('should return organization, plan, and membership on success', async () => {
      const response = {
        organization: {
          id: 'org-1',
          name: 'Westside District',
          slug: 'westside',
          entity_type: 'school_district',
          primary_color: '#0099CC',
          dashboard_template: 'hierarchical',
          onboarding_completed: false,
          created_by: 'user-1',
        },
        plan: { id: 'plan-1', name: 'Strategic Plan', slug: 'strategic-plan' },
        membership: { id: 'mem-1', role: 'owner' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(response),
      });

      const result = await OnboardingService.createOrg(orgData);

      expect(result.organization.id).toBe('org-1');
      expect(result.plan.id).toBe('plan-1');
      expect(result.membership.role).toBe('owner');
    });

    it('should include optional branding fields in request body', async () => {
      const dataWithBranding = {
        ...orgData,
        primary_color: '#FF0000',
        secondary_color: '#00FF00',
        logo_url: 'https://example.com/logo.png',
        dashboard_template: 'hierarchical' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            organization: { id: 'org-1' },
            plan: { id: 'plan-1' },
            membership: { id: 'mem-1' },
          }),
      });

      await OnboardingService.createOrg(dataWithBranding);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(dataWithBranding),
        }),
      );
    });

    it('should throw on 409 conflict (duplicate slug)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: () =>
          Promise.resolve({ error: 'An organization with slug "westside" already exists' }),
      });

      await expect(OnboardingService.createOrg(orgData)).rejects.toThrow();
    });

    it('should throw on 400 validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'name is required' }),
      });

      await expect(
        OnboardingService.createOrg({ ...orgData, name: '' }),
      ).rejects.toThrow();
    });
  });

  describe('completeOnboarding', () => {
    const completeData = {
      organization_id: 'org-1',
    };

    it('should call the correct URL with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            organization: {
              id: 'org-1',
              onboarding_completed: true,
            },
          }),
      });

      await OnboardingService.completeOnboarding(completeData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/onboarding/complete',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeData),
        }),
      );
    });

    it('should return updated organization on success', async () => {
      const response = {
        organization: {
          id: 'org-1',
          name: 'Westside District',
          slug: 'westside',
          entity_type: 'school_district',
          primary_color: '#0099CC',
          dashboard_template: 'hierarchical',
          onboarding_completed: true,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
      });

      const result = await OnboardingService.completeOnboarding(completeData);

      expect(result.organization.onboarding_completed).toBe(true);
      expect(result.organization.id).toBe('org-1');
    });

    it('should include optional branding fields', async () => {
      const dataWithBranding = {
        organization_id: 'org-1',
        primary_color: '#FF0000',
        secondary_color: '#00FF00',
        logo_url: 'https://example.com/logo.png',
        dashboard_template: 'hierarchical' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            organization: { id: 'org-1', onboarding_completed: true },
          }),
      });

      await OnboardingService.completeOnboarding(dataWithBranding);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(dataWithBranding),
        }),
      );
    });

    it('should throw on 403 forbidden (non-owner)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () =>
          Promise.resolve({ error: 'You must be the owner of this organization' }),
      });

      await expect(
        OnboardingService.completeOnboarding(completeData),
      ).rejects.toThrow();
    });

    it('should throw on 401 unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(
        OnboardingService.completeOnboarding(completeData),
      ).rejects.toThrow();
    });
  });
});
