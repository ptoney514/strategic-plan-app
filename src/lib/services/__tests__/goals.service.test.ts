import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GoalsService } from '../goals.service';

// Mock logger to prevent console noise
vi.mock('../../utils/logger', () => ({
  serviceLoggers: {
    goals: {
      debug: vi.fn(),
      error: vi.fn(),
    },
    district: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('GoalsService', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;

    // Mock window.location.origin for API URL construction
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

  describe('getByDistrict', () => {
    it('should fetch goals for a district', async () => {
      const mockDistrictId = 'district-123';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'test-district',
        name: 'Test District',
      };
      const mockGoals = [
        {
          id: 'goal-1',
          district_id: mockDistrictId,
          goal_number: '1',
          title: 'District Goal 1',
          level: 0,
          parent_id: null,
        },
      ];

      // Mock district lookup (DistrictService.getById)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Mock goals fetch by org slug
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockGoals),
      });

      const result = await GoalsService.getByDistrict(mockDistrictId);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `http://localhost/api/organizations?id=${mockDistrictId}`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `http://localhost/api/organizations/${mockDistrict.slug}/goals`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('goal-1');
    });

    it('should throw error when district API call fails', async () => {
      const mockDistrictId = 'district-123';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'District not found' }),
      });

      await expect(GoalsService.getByDistrict(mockDistrictId)).rejects.toThrow();
    });

    it('should throw error when goals API call fails', async () => {
      const mockDistrictId = 'district-123';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'test-district',
        name: 'Test District',
      };

      // District lookup succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Goals fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database error' }),
      });

      await expect(GoalsService.getByDistrict(mockDistrictId)).rejects.toThrow();
    });
  });

  describe('getByPlan', () => {
    it('should fetch goals for a specific plan', async () => {
      const mockPlanId = 'plan-123';
      const mockGoals = [
        {
          id: 'goal-1',
          plan_id: mockPlanId,
          goal_number: '1',
          title: 'Plan Goal 1',
          level: 0,
          parent_id: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockGoals),
      });

      const result = await GoalsService.getByPlan(mockPlanId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/plans/${mockPlanId}/goals`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
    });

  });

  describe('getById', () => {
    it('should fetch a single goal by id', async () => {
      const mockGoalId = 'goal-123';
      const mockGoal = {
        id: mockGoalId,
        goal_number: '1',
        title: 'Test Goal',
        level: 0,
        parent_id: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockGoal),
      });

      const result = await GoalsService.getById(mockGoalId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/goals/${mockGoalId}`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result!.id).toBe(mockGoalId);
    });
  });

  describe('getChildren', () => {
    it('should fetch children of a parent goal', async () => {
      const mockParentId = 'goal-parent';
      const mockChildren = [
        {
          id: 'goal-child-1',
          parent_id: mockParentId,
          goal_number: '1.1',
          title: 'Child Goal 1',
          level: 1,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockChildren),
      });

      const result = await GoalsService.getChildren(mockParentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/goals/${mockParentId}/children`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a goal for a plan', async () => {
      const mockGoal = {
        plan_id: 'plan-123',
        district_id: 'district-123',
        title: 'New District Goal',
        level: 0 as const,
      };

      const createdGoal = {
        id: 'goal-new',
        ...mockGoal,
        goal_number: '1',
      };

      // First call: GET existing goals to calculate goal number
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      // Second call: POST to create new goal
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdGoal),
      });

      const result = await GoalsService.create(mockGoal);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `http://localhost/api/plans/${mockGoal.plan_id}/goals`,
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `http://localhost/api/plans/${mockGoal.plan_id}/goals`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(mockGoal.title),
        })
      );
      expect(result).toEqual(createdGoal);
    });

    it('should throw error when district_id is missing', async () => {
      const mockGoal = {
        plan_id: 'plan-123',
        title: 'Invalid Goal',
        level: 0 as const,
      };

      await expect(GoalsService.create(mockGoal)).rejects.toThrow(
        'Goal must belong to a district'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error when plan_id is missing', async () => {
      const mockGoal = {
        district_id: 'district-123',
        title: 'Invalid Goal',
        level: 0 as const,
      };

      // Service doesn't validate plan_id upfront, so it will attempt to POST
      // with undefined in the URL, which should fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid plan_id' }),
      });

      await expect(GoalsService.create(mockGoal)).rejects.toThrow();

      // It should attempt a POST to /plans/undefined/goals
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/plans/undefined/goals',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('renumberGoals', () => {
    it('should renumber goals for a district', async () => {
      const options = { districtId: 'district-123' };
      const parentId = null;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await GoalsService.renumberGoals(options, parentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/goals/renumber`,
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district_id: options.districtId,
            parent_id: parentId,
          }),
        })
      );
    });
  });
});
