import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoalsService } from '../goals.service';
import { supabase } from '../../supabase';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Mock logger to prevent console noise
vi.mock('../../utils/logger', () => ({
  serviceLoggers: {
    goals: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('GoalsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByDistrict', () => {
    it('should fetch goals for a district', async () => {
      const mockDistrictId = 'district-123';
      const mockGoals = [
        {
          id: 'goal-1',
          district_id: mockDistrictId,
          school_id: null,
          goal_number: '1',
          title: 'District Goal 1',
          level: 0,
          parent_id: null,
          metrics: [],
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockGoals, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await GoalsService.getByDistrict(mockDistrictId);

      expect(supabase.from).toHaveBeenCalledWith('spb_goals');
      expect(mockEq).toHaveBeenCalledWith('district_id', mockDistrictId);
      expect(mockOrder).toHaveBeenCalledWith('goal_number');
      expect(result).toHaveLength(1);
    });

    it('should throw error on database failure', async () => {
      const mockDistrictId = 'district-123';
      const mockError = { message: 'Database error', code: '500' };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      await expect(GoalsService.getByDistrict(mockDistrictId)).rejects.toEqual(mockError);
    });
  });

  describe('getBySchool', () => {
    it('should fetch goals for a specific school', async () => {
      const mockSchoolId = 'school-123';
      const mockGoals = [
        {
          id: 'goal-1',
          district_id: null,
          school_id: mockSchoolId,
          goal_number: '1',
          title: 'School Goal 1',
          level: 0,
          parent_id: null,
          metrics: [],
        },
        {
          id: 'goal-2',
          district_id: null,
          school_id: mockSchoolId,
          goal_number: '1.1',
          title: 'School Goal 1.1',
          level: 1,
          parent_id: 'goal-1',
          metrics: [],
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockGoals, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await GoalsService.getBySchool(mockSchoolId);

      expect(supabase.from).toHaveBeenCalledWith('spb_goals');
      expect(mockEq).toHaveBeenCalledWith('school_id', mockSchoolId);
      expect(mockOrder).toHaveBeenCalledWith('goal_number');
      // Result should be hierarchical
      expect(result).toBeDefined();
    });

    it('should return empty array for school with no goals', async () => {
      const mockSchoolId = 'school-empty';

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await GoalsService.getBySchool(mockSchoolId);

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      const mockSchoolId = 'school-123';
      const mockError = { message: 'Database error', code: '500' };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      await expect(GoalsService.getBySchool(mockSchoolId)).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should create a goal for a district', async () => {
      const mockGoal = {
        district_id: 'district-123',
        title: 'New District Goal',
        level: 0 as const,
      };

      const createdGoal = {
        id: 'goal-new',
        ...mockGoal,
        goal_number: '1',
        school_id: null,
      };

      // Mock for getting existing goals
      const mockSelectExisting = vi.fn().mockReturnThis();
      const mockEqExisting = vi.fn().mockReturnThis();
      const mockIsExisting = vi.fn().mockResolvedValue({ data: [], error: null });

      // Mock for insert
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelectInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: createdGoal, error: null });

      let callCount = 0;
      (supabase.from as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: get existing goals
          return {
            select: mockSelectExisting,
          };
        }
        // Second call: insert
        return {
          insert: mockInsert,
        };
      });

      mockSelectExisting.mockReturnValue({
        eq: mockEqExisting,
      });
      mockEqExisting.mockReturnValue({
        is: mockIsExisting,
      });

      mockInsert.mockReturnValue({
        select: mockSelectInsert,
      });
      mockSelectInsert.mockReturnValue({
        single: mockSingle,
      });

      const result = await GoalsService.create(mockGoal);

      expect(result).toEqual(createdGoal);
    });

    it('should create a goal for a school', async () => {
      const mockGoal = {
        school_id: 'school-123',
        title: 'New School Goal',
        level: 0 as const,
      };

      const createdGoal = {
        id: 'goal-new',
        ...mockGoal,
        goal_number: '1',
        district_id: null,
      };

      // Mock for getting existing goals
      const mockSelectExisting = vi.fn().mockReturnThis();
      const mockEqExisting = vi.fn().mockResolvedValue({ data: [], error: null });

      // Mock for insert
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelectInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: createdGoal, error: null });

      let callCount = 0;
      (supabase.from as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: mockSelectExisting,
          };
        }
        return {
          insert: mockInsert,
        };
      });

      mockSelectExisting.mockReturnValue({
        eq: mockEqExisting,
      });

      mockInsert.mockReturnValue({
        select: mockSelectInsert,
      });
      mockSelectInsert.mockReturnValue({
        single: mockSingle,
      });

      const result = await GoalsService.create(mockGoal);

      expect(result).toEqual(createdGoal);
    });

    it('should throw error when both district_id and school_id are provided', async () => {
      const mockGoal = {
        district_id: 'district-123',
        school_id: 'school-123',
        title: 'Invalid Goal',
        level: 0 as const,
      };

      await expect(GoalsService.create(mockGoal)).rejects.toThrow(
        'Goal cannot belong to both district and school'
      );
    });

    it('should throw error when neither district_id nor school_id is provided', async () => {
      const mockGoal = {
        title: 'Invalid Goal',
        level: 0 as const,
      };

      await expect(GoalsService.create(mockGoal)).rejects.toThrow(
        'Goal must belong to either a district or a school'
      );
    });
  });

  describe('renumberGoals', () => {
    it('should throw error when both districtId and schoolId are provided', async () => {
      await expect(
        GoalsService.renumberGoals({ districtId: 'dist-1', schoolId: 'school-1' }, null)
      ).rejects.toThrow('Cannot renumber with both districtId and schoolId');
    });

    it('should throw error when neither districtId nor schoolId is provided', async () => {
      await expect(GoalsService.renumberGoals({}, null)).rejects.toThrow(
        'Must provide either districtId or schoolId'
      );
    });
  });

});
