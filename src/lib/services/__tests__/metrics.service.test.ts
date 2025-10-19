import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetricsService } from '../metrics.service';
import { supabase } from '../../supabase';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('MetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByDistrict', () => {
    it('should fetch metrics for a specific district using JOIN', async () => {
      const mockDistrictId = 'district-123';
      const mockMetrics = [
        {
          id: 'metric-1',
          goal_id: 'goal-1',
          metric_name: 'Test Metric 1',
          visualization_type: 'bar',
          spb_goals: { district_id: mockDistrictId }
        },
        {
          id: 'metric-2',
          goal_id: 'goal-2',
          metric_name: 'Test Metric 2',
          visualization_type: 'likert-scale',
          spb_goals: { district_id: mockDistrictId }
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockMetrics, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await MetricsService.getByDistrict(mockDistrictId);

      // Verify the correct chain of calls
      expect(supabase.from).toHaveBeenCalledWith('spb_metrics');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        spb_goals!inner(district_id)
      `);
      expect(mockEq).toHaveBeenCalledWith('spb_goals.district_id', mockDistrictId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });

      // Verify joined data is removed from response
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('spb_goals');
      expect(result[1]).not.toHaveProperty('spb_goals');
      expect(result[0].id).toBe('metric-1');
      expect(result[1].id).toBe('metric-2');
    });

    it('should return empty array when no metrics found', async () => {
      const mockDistrictId = 'district-456';

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

      const result = await MetricsService.getByDistrict(mockDistrictId);

      expect(result).toEqual([]);
    });

    it('should handle null data gracefully', async () => {
      const mockDistrictId = 'district-789';

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await MetricsService.getByDistrict(mockDistrictId);

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      const mockDistrictId = 'district-error';
      const mockError = new Error('Database connection failed');

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

      await expect(MetricsService.getByDistrict(mockDistrictId)).rejects.toThrow('Database connection failed');
    });

    it('should only return metrics from the specified district', async () => {
      // This test verifies the JOIN logic filters correctly
      const districtId = 'correct-district';
      const mockData = [
        {
          id: 'metric-1',
          goal_id: 'goal-1',
          metric_name: 'Metric for correct district',
          spb_goals: { district_id: districtId }
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await MetricsService.getByDistrict(districtId);

      // Verify the filter was applied correctly
      expect(mockEq).toHaveBeenCalledWith('spb_goals.district_id', districtId);
      expect(result).toHaveLength(1);
      expect(result[0].metric_name).toBe('Metric for correct district');
    });
  });
});
