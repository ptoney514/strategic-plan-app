import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PlansService } from '../plans.service';

describe('PlansService', () => {
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

  describe('getByDistrictSlug', () => {
    it('should fetch plans for a district by slug', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          district_id: 'district-123',
          name: 'Strategic Plan 2025',
          slug: 'strategic-plan-2025',
          is_public: true,
          is_active: true,
          order_position: 0,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlans),
      });

      const result = await PlansService.getByDistrictSlug('westside');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations/westside/plans',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Strategic Plan 2025');
    });

    it('should return empty array when district has no plans', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const result = await PlansService.getByDistrictSlug('empty-district');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database error' }),
      });

      await expect(PlansService.getByDistrictSlug('westside')).rejects.toThrow();
    });
  });

  describe('getByDistrictId', () => {
    it('should look up district slug then fetch plans', async () => {
      const mockDistrict = {
        id: 'district-123',
        slug: 'westside',
        name: 'Westside District',
      };
      const mockPlans = [
        {
          id: 'plan-1',
          district_id: 'district-123',
          name: 'Westside Plan',
          slug: 'westside-plan',
          is_public: true,
          is_active: true,
          order_position: 0,
        },
      ];

      // First call: district lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Second call: plans fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlans),
      });

      const result = await PlansService.getByDistrictId('district-123');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost/api/organizations?id=district-123',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/organizations/westside/plans',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('plan-1');
    });
  });

  describe('getById', () => {
    it('should fetch a single plan by ID', async () => {
      const mockPlan = {
        id: 'plan-123',
        district_id: 'district-123',
        name: 'Test Plan',
        slug: 'test-plan',
        is_public: true,
        is_active: true,
        order_position: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlan),
      });

      const result = await PlansService.getById('plan-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/plans/plan-123',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result?.id).toBe('plan-123');
    });

    it('should return null for 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Plan not found' }),
      });

      const result = await PlansService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a plan for a district', async () => {
      const mockDistrict = {
        id: 'district-123',
        slug: 'westside',
        name: 'Westside District',
      };
      const newPlan = {
        district_id: 'district-123',
        name: 'New Strategic Plan',
        is_public: true,
        is_active: true,
      };
      const createdPlan = {
        id: 'plan-new',
        organization_id: 'district-123',
        ...newPlan,
        slug: 'new-strategic-plan',
        order_position: 0,
      };

      // District lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Create plan
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdPlan),
      });

      const result = await PlansService.create(newPlan);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/organizations/westside/plans',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('New Strategic Plan'),
        })
      );
      expect(result.id).toBe('plan-new');
    });

    it('should throw error when district_id is not provided', async () => {
      const plan = {
        name: 'Invalid Plan',
      };

      await expect(PlansService.create(plan)).rejects.toThrow(
        'Plan must belong to a district'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a plan with PUT request', async () => {
      const updatedPlan = {
        id: 'plan-123',
        name: 'Updated Plan Name',
        is_public: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updatedPlan),
      });

      const result = await PlansService.update('plan-123', { name: 'Updated Plan Name', is_public: false });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/plans/plan-123',
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Updated Plan Name', is_public: false }),
        })
      );
      expect(result.name).toBe('Updated Plan Name');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database error' }),
      });

      await expect(
        PlansService.update('plan-123', { name: 'Fail' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a plan with DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await PlansService.delete('plan-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/plans/plan-123',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Plan not found' }),
      });

      await expect(PlansService.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('getActiveByDistrictSlug', () => {
    it('should fetch active plans by district slug', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          district_id: 'district-123',
          name: 'Active Plan',
          slug: 'active-plan',
          is_public: true,
          is_active: true,
          order_position: 0,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlans),
      });

      const result = await PlansService.getActiveByDistrictSlug('westside');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/plans/active/westside',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].is_active).toBe(true);
    });
  });

  describe('plan-organization association', () => {
    it('plans fetched by district slug only return that district plans', async () => {
      const westsidePlans = [
        { id: 'plan-1', district_id: 'west-id', name: 'Westside Plan' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(westsidePlans),
      });

      const result = await PlansService.getByDistrictSlug('westside');

      // Verify the API was called with the correct district slug
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations/westside/plans',
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].district_id).toBe('west-id');
    });

    it('different districts return different plans', async () => {
      // Fetch westside plans
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 'plan-w', district_id: 'west-id', name: 'Westside Plan' }]),
      });

      const westsideResult = await PlansService.getByDistrictSlug('westside');
      expect(westsideResult[0].id).toBe('plan-w');

      // Fetch eastside plans
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 'plan-e', district_id: 'east-id', name: 'Eastside Plan' }]),
      });

      const eastsideResult = await PlansService.getByDistrictSlug('eastside');
      expect(eastsideResult[0].id).toBe('plan-e');

      // Verify different API URLs were called
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost/api/organizations/westside/plans',
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/organizations/eastside/plans',
        expect.any(Object)
      );
    });
  });

  describe('getPlansWithCounts', () => {
    it('should fetch plans with counts via user endpoint', async () => {
      const mockDistrict = {
        id: 'district-123',
        slug: 'westside',
        name: 'Westside District',
      };

      const mockPlansWithCounts = [
        {
          id: 'plan-1',
          district_id: 'district-123',
          name: 'Plan 1',
          objective_count: 5,
        },
      ];

      // District lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Plans with counts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlansWithCounts),
      });

      const result = await PlansService.getPlansWithCounts('district-123');

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/user/plans-with-counts?orgSlug=westside',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
    });
  });
});
