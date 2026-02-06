import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MetricsService } from '../metrics.service';
import type { Metric } from '../../types';

describe('MetricsService', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    // Mock window.location.origin for URL construction
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
    it('should fetch metrics for a specific district', async () => {
      const mockDistrictId = 'district-123';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'test-district',
        name: 'Test District',
      };
      const mockMetrics: Metric[] = [
        {
          id: 'metric-1',
          goal_id: 'goal-1',
          metric_name: 'Test Metric 1',
          visualization_type: 'bar',
        } as Metric,
        {
          id: 'metric-2',
          goal_id: 'goal-2',
          metric_name: 'Test Metric 2',
          visualization_type: 'likert-scale',
        } as Metric,
      ];

      // Mock DistrictService.getById call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Mock MetricsService.getByDistrict API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await MetricsService.getByDistrict(mockDistrictId);

      // Verify district lookup
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `http://localhost/api/organizations?id=${mockDistrictId}`,
        expect.objectContaining({
          credentials: 'include',
        })
      );

      // Verify metrics fetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `http://localhost/api/organizations/${mockDistrict.slug}/metrics`,
        expect.objectContaining({
          credentials: 'include',
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('metric-1');
      expect(result[0].metric_name).toBe('Test Metric 1');
      expect(result[1].id).toBe('metric-2');
      expect(result[1].metric_name).toBe('Test Metric 2');
    });

    it('should return empty array when no metrics found', async () => {
      const mockDistrictId = 'district-456';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'empty-district',
        name: 'Empty District',
      };

      // Mock DistrictService.getById call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Mock empty metrics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const result = await MetricsService.getByDistrict(mockDistrictId);

      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle null data gracefully', async () => {
      const mockDistrictId = 'district-789';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'null-district',
        name: 'Null District',
      };

      // Mock DistrictService.getById call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Mock null metrics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      });

      const result = await MetricsService.getByDistrict(mockDistrictId);

      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when district lookup fails', async () => {
      const mockDistrictId = 'district-error';

      // Mock failed district lookup
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'District not found' }),
      });

      await expect(MetricsService.getByDistrict(mockDistrictId)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when metrics API call fails', async () => {
      const mockDistrictId = 'district-error';
      const mockDistrict = {
        id: mockDistrictId,
        slug: 'error-district',
        name: 'Error District',
      };

      // Mock successful district lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      // Mock failed metrics API call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Database connection failed' }),
      });

      await expect(MetricsService.getByDistrict(mockDistrictId)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', async () => {
      const mockDistrictId = 'district-network-error';

      // Mock network error on district lookup
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(MetricsService.getByDistrict(mockDistrictId)).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByGoal', () => {
    it('should fetch metrics for a specific goal', async () => {
      const mockGoalId = 'goal-123';
      const mockMetrics: Metric[] = [
        {
          id: 'metric-1',
          goal_id: mockGoalId,
          metric_name: 'Goal Metric 1',
          visualization_type: 'bar',
        } as Metric,
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await MetricsService.getByGoal(mockGoalId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/goals/${mockGoalId}/metrics`,
        expect.objectContaining({
          credentials: 'include',
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].goal_id).toBe(mockGoalId);
    });
  });

  describe('getById', () => {
    it('should fetch a single metric by ID', async () => {
      const mockMetric: Metric = {
        id: 'metric-1',
        goal_id: 'goal-1',
        metric_name: 'Test Metric',
        visualization_type: 'bar',
      } as Metric;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMetric),
      });

      const result = await MetricsService.getById('metric-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/metric-1',
        expect.objectContaining({
          credentials: 'include',
        })
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe('metric-1');
      expect(result!.metric_name).toBe('Test Metric');
    });
  });

  describe('create', () => {
    it('should create a new metric', async () => {
      const newMetric: Partial<Metric> = {
        goal_id: 'goal-1',
        metric_name: 'New Metric',
        visualization_type: 'bar',
      };

      const createdMetric: Metric = {
        id: 'metric-new',
        ...newMetric,
      } as Metric;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdMetric),
      });

      const result = await MetricsService.create(newMetric);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost/api/goals/${newMetric.goal_id}/metrics`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newMetric),
        })
      );
      expect(result.id).toBe('metric-new');
      expect(result.metric_name).toBe('New Metric');
    });

    it('should still attempt API call when goal_id is missing (server validates)', async () => {
      const newMetric: Partial<Metric> = {
        metric_name: 'Invalid Metric',
        visualization_type: 'bar',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'goal_id is required' }),
      });

      await expect(MetricsService.create(newMetric)).rejects.toThrow('goal_id is required');
    });
  });

  describe('update', () => {
    it('should update a metric', async () => {
      const updates: Partial<Metric> = {
        metric_name: 'Updated Metric',
      };

      const updatedMetric: Metric = {
        id: 'metric-1',
        goal_id: 'goal-1',
        ...updates,
      } as Metric;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updatedMetric),
      });

      const result = await MetricsService.update('metric-1', updates);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/metric-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      );
      expect(result.metric_name).toBe('Updated Metric');
    });
  });

  describe('updateValue', () => {
    it('should update a metric value', async () => {
      const newValue = 85;
      const updatedMetric: Metric = {
        id: 'metric-1',
        goal_id: 'goal-1',
        metric_name: 'Test Metric',
        current_value: newValue,
      } as Metric;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updatedMetric),
      });

      const result = await MetricsService.updateValue('metric-1', newValue);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/metric-1/value',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ value: newValue }),
        })
      );
      expect(result.current_value).toBe(newValue);
    });
  });

  describe('delete', () => {
    it('should delete a metric', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      await MetricsService.delete('metric-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/metric-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update multiple metrics', async () => {
      const updates = [
        { id: 'metric-1', updates: { metric_name: 'Updated 1' } },
        { id: 'metric-2', updates: { metric_name: 'Updated 2' } },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await MetricsService.bulkUpdate(updates);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/bulk',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ metrics: updates }),
        })
      );
    });
  });

  describe('reorder', () => {
    it('should reorder metrics', async () => {
      const reorderData = [
        { id: 'metric-1', display_order: 1 },
        { id: 'metric-2', display_order: 2 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await MetricsService.reorder(reorderData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/metrics/reorder',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ metrics: reorderData }),
        })
      );
    });
  });
});
