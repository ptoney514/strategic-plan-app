import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DistrictService } from '../district.service';
import { supabase } from '../../supabase';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('DistrictService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch districts with goals_count, metrics_count, and admins_count', async () => {
      const mockDistricts = [
        {
          id: 'dist-1',
          name: 'District 1',
          slug: 'dist1',
          admin_email: 'admin1@test.com',
          primary_color: '#000000',
          is_public: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 'dist-2',
          name: 'District 2',
          slug: 'dist2',
          admin_email: 'admin2@test.com',
          primary_color: '#000000',
          is_public: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
      ];

      // Mock district query
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: mockDistricts, error: null });

      // Mock count queries - will be called 6 times (3 per district)
      const mockCountSelect = vi.fn().mockReturnThis();
      const mockCountEq = vi.fn();

      // District 1 counts: 5 goals, 3 metrics, 2 admins
      mockCountEq
        .mockResolvedValueOnce({ count: 5, error: null })  // goals for dist-1
        .mockResolvedValueOnce({ count: 3, error: null })  // metrics for dist-1
        .mockResolvedValueOnce({ count: 2, error: null })  // admins for dist-1
        // District 2 counts: 8 goals, 4 metrics, 1 admin
        .mockResolvedValueOnce({ count: 8, error: null })  // goals for dist-2
        .mockResolvedValueOnce({ count: 4, error: null })  // metrics for dist-2
        .mockResolvedValueOnce({ count: 1, error: null }); // admins for dist-2

      // Setup mock chain
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockDistrictSelect,
        })
        .mockReturnValue({
          select: mockCountSelect,
        });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      mockCountSelect.mockReturnValue({
        eq: mockCountEq,
      });

      const result = await DistrictService.getAll();

      // Verify district query
      expect(supabase.from).toHaveBeenCalledWith('spb_districts');
      expect(mockDistrictSelect).toHaveBeenCalledWith('*');
      expect(mockDistrictOrder).toHaveBeenCalledWith('name');

      // Verify count queries
      expect(supabase.from).toHaveBeenCalledWith('spb_goals');
      expect(supabase.from).toHaveBeenCalledWith('spb_metrics');
      expect(supabase.from).toHaveBeenCalledWith('spb_district_admins');
      expect(mockCountSelect).toHaveBeenCalledWith('id', { count: 'exact', head: true });

      // Verify results
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'dist-1',
        goals_count: 5,
        metrics_count: 3,
        admins_count: 2,
      });
      expect(result[1]).toMatchObject({
        id: 'dist-2',
        goals_count: 8,
        metrics_count: 4,
        admins_count: 1,
      });
    });

    it('should handle districts with zero counts', async () => {
      const mockDistricts = [
        {
          id: 'dist-empty',
          name: 'Empty District',
          slug: 'empty',
          admin_email: 'admin@test.com',
          primary_color: '#000000',
          is_public: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
      ];

      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: mockDistricts, error: null });

      const mockCountSelect = vi.fn().mockReturnThis();
      const mockCountEq = vi.fn();

      // All zero counts
      mockCountEq
        .mockResolvedValueOnce({ count: 0, error: null })  // goals
        .mockResolvedValueOnce({ count: 0, error: null })  // metrics
        .mockResolvedValueOnce({ count: 0, error: null }); // admins

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockDistrictSelect,
        })
        .mockReturnValue({
          select: mockCountSelect,
        });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      mockCountSelect.mockReturnValue({
        eq: mockCountEq,
      });

      const result = await DistrictService.getAll();

      expect(result[0]).toMatchObject({
        goals_count: 0,
        metrics_count: 0,
        admins_count: 0,
      });
    });

    it('should handle null count results', async () => {
      const mockDistricts = [
        {
          id: 'dist-1',
          name: 'District 1',
          slug: 'dist1',
          admin_email: 'admin@test.com',
          primary_color: '#000000',
          is_public: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
      ];

      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: mockDistricts, error: null });

      const mockCountSelect = vi.fn().mockReturnThis();
      const mockCountEq = vi.fn();

      // Null counts (should default to 0)
      mockCountEq
        .mockResolvedValueOnce({ count: null, error: null })
        .mockResolvedValueOnce({ count: null, error: null })
        .mockResolvedValueOnce({ count: null, error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockDistrictSelect,
        })
        .mockReturnValue({
          select: mockCountSelect,
        });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      mockCountSelect.mockReturnValue({
        eq: mockCountEq,
      });

      const result = await DistrictService.getAll();

      expect(result[0]).toMatchObject({
        goals_count: 0,
        metrics_count: 0,
        admins_count: 0,
      });
    });

    it('should return empty array when no districts found', async () => {
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as any).mockReturnValue({
        select: mockDistrictSelect,
      });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      const result = await DistrictService.getAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockDistrictSelect,
      });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      const result = await DistrictService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw error when district query fails', async () => {
      const mockError = new Error('Database connection failed');
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockDistrictSelect,
      });

      mockDistrictSelect.mockReturnValue({
        order: mockDistrictOrder,
      });

      await expect(DistrictService.getAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getBySlug', () => {
    it('should fetch district with counts by slug', async () => {
      const mockDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        is_public: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      // Mock district query
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictEq = vi.fn().mockReturnThis();
      const mockDistrictSingle = vi.fn().mockResolvedValue({ data: mockDistrict, error: null });

      // Mock count queries
      const mockCountSelect = vi.fn().mockReturnThis();
      const mockCountEq = vi.fn();

      // 10 goals, 7 metrics, 3 admins
      mockCountEq
        .mockResolvedValueOnce({ count: 10, error: null })  // goals
        .mockResolvedValueOnce({ count: 7, error: null })   // metrics
        .mockResolvedValueOnce({ count: 3, error: null });  // admins

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockDistrictSelect,
        })
        .mockReturnValue({
          select: mockCountSelect,
        });

      mockDistrictSelect.mockReturnValue({
        eq: mockDistrictEq,
      });

      mockDistrictEq.mockReturnValue({
        single: mockDistrictSingle,
      });

      mockCountSelect.mockReturnValue({
        eq: mockCountEq,
      });

      const result = await DistrictService.getBySlug('test-district');

      // Verify district query
      expect(supabase.from).toHaveBeenCalledWith('spb_districts');
      expect(mockDistrictSelect).toHaveBeenCalledWith('*');
      expect(mockDistrictEq).toHaveBeenCalledWith('slug', 'test-district');
      expect(mockDistrictSingle).toHaveBeenCalled();

      // Verify count queries
      expect(mockCountSelect).toHaveBeenCalledWith('id', { count: 'exact', head: true });
      expect(mockCountEq).toHaveBeenCalledWith('district_id', 'dist-1');

      // Verify result
      expect(result).toMatchObject({
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        goals_count: 10,
        metrics_count: 7,
        admins_count: 3,
      });
    });

    it('should return null when district not found', async () => {
      const mockError = { code: 'PGRST116', message: 'No rows found' };
      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictEq = vi.fn().mockReturnThis();
      const mockDistrictSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockDistrictSelect,
      });

      mockDistrictSelect.mockReturnValue({
        eq: mockDistrictEq,
      });

      mockDistrictEq.mockReturnValue({
        single: mockDistrictSingle,
      });

      const result = await DistrictService.getBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    it('should handle null counts', async () => {
      const mockDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        is_public: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      const mockDistrictSelect = vi.fn().mockReturnThis();
      const mockDistrictEq = vi.fn().mockReturnThis();
      const mockDistrictSingle = vi.fn().mockResolvedValue({ data: mockDistrict, error: null });

      const mockCountSelect = vi.fn().mockReturnThis();
      const mockCountEq = vi.fn();

      // Null counts
      mockCountEq
        .mockResolvedValueOnce({ count: null, error: null })
        .mockResolvedValueOnce({ count: null, error: null })
        .mockResolvedValueOnce({ count: null, error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockDistrictSelect,
        })
        .mockReturnValue({
          select: mockCountSelect,
        });

      mockDistrictSelect.mockReturnValue({
        eq: mockDistrictEq,
      });

      mockDistrictEq.mockReturnValue({
        single: mockDistrictSingle,
      });

      mockCountSelect.mockReturnValue({
        eq: mockCountEq,
      });

      const result = await DistrictService.getBySlug('test-district');

      expect(result).toMatchObject({
        goals_count: 0,
        metrics_count: 0,
        admins_count: 0,
      });
    });
  });

  describe('create', () => {
    it('should create a new district', async () => {
      const newDistrict = {
        name: 'New District',
        slug: 'new-district',
        admin_email: 'admin@new.com',
        primary_color: '#000000',
        is_public: true,
      };

      const createdDistrict = {
        ...newDistrict,
        id: 'new-id',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: createdDistrict, error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const result = await DistrictService.create(newDistrict);

      expect(supabase.from).toHaveBeenCalledWith('spb_districts');
      expect(mockInsert).toHaveBeenCalledWith(newDistrict);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(createdDistrict);
    });

    it('should throw error when creation fails', async () => {
      const mockError = new Error('Creation failed');
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      await expect(DistrictService.create({ name: 'Test' })).rejects.toThrow('Creation failed');
    });
  });

  describe('update', () => {
    it('should update an existing district', async () => {
      const updates = {
        name: 'Updated District',
        primary_color: '#FF0000',
      };

      const updatedDistrict = {
        id: 'dist-1',
        name: 'Updated District',
        slug: 'test-district',
        admin_email: 'admin@test.com',
        primary_color: '#FF0000',
        is_public: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedDistrict, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const result = await DistrictService.update('dist-1', updates);

      expect(supabase.from).toHaveBeenCalledWith('spb_districts');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'dist-1');
      expect(result).toEqual(updatedDistrict);
    });

    it('should throw error when update fails', async () => {
      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      await expect(DistrictService.update('dist-1', { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a district', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      await DistrictService.delete('dist-1');

      expect(supabase.from).toHaveBeenCalledWith('spb_districts');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'dist-1');
    });

    it('should throw error when delete fails', async () => {
      const mockError = new Error('Delete failed');
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      await expect(DistrictService.delete('dist-1')).rejects.toThrow('Delete failed');
    });
  });
});
