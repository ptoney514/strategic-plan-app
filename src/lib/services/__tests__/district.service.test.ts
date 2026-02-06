import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DistrictService } from '../district.service';

describe('DistrictService', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    global.fetch = mockFetch;
    // Mock window.location.origin for URL construction
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe('getAll', () => {
    it('should fetch all districts successfully', async () => {
      const mockDistricts = [
        {
          id: 'dist-1',
          name: 'District 1',
          slug: 'dist1',
          entity_type: 'district',
          entity_label: null,
          logo_url: null,
          admin_email: 'admin1@test.com',
          primary_color: '#000000',
          secondary_color: null,
          tagline: null,
          is_public: true,
          settings: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          goals_count: 5,
          metrics_count: 3,
          admins_count: 2,
        },
        {
          id: 'dist-2',
          name: 'District 2',
          slug: 'dist2',
          entity_type: 'district',
          entity_label: null,
          logo_url: null,
          admin_email: 'admin2@test.com',
          primary_color: '#000000',
          secondary_color: null,
          tagline: null,
          is_public: true,
          settings: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          goals_count: 8,
          metrics_count: 4,
          admins_count: 1,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistricts),
      });

      const result = await DistrictService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockDistricts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no districts found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const result = await DistrictService.getAll();

      expect(result).toEqual([]);
    });

    it('should handle null response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      });

      const result = await DistrictService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw ApiError when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database connection failed' }),
      });

      await expect(DistrictService.getAll()).rejects.toThrow('Database connection failed');
    });

    it('should throw ApiError with statusText when no error in body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.resolve({}),
      });

      await expect(DistrictService.getAll()).rejects.toThrow('Service Unavailable');
    });
  });

  describe('getBySlug', () => {
    it('should fetch district by slug successfully', async () => {
      const mockDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        goals_count: 10,
        metrics_count: 7,
        admins_count: 3,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      const result = await DistrictService.getBySlug('test-district');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations/test-district',
        expect.objectContaining({
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockDistrict);
    });

    it('should return null when district not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'District not found' }),
      });

      const result = await DistrictService.getBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    it('should return null and log error on other fetch errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const result = await DistrictService.getBySlug('test-district');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('should fetch district by ID using query param', async () => {
      const mockDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        goals_count: 5,
        metrics_count: 3,
        admins_count: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDistrict),
      });

      const result = await DistrictService.getById('dist-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations?id=dist-1',
        expect.objectContaining({
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockDistrict);
    });
  });

  describe('create', () => {
    it('should create a new district with correct payload', async () => {
      const newDistrict = {
        name: 'New District',
        slug: 'new-district',
        entity_type: 'district',
        entity_label: 'School',
        logo_url: 'https://example.com/logo.png',
        admin_email: 'admin@new.com',
        primary_color: '#000000',
        secondary_color: '#FFFFFF',
        tagline: 'Excellence in Education',
        is_public: true,
        settings: { some: 'setting' },
      };

      const createdDistrict = {
        ...newDistrict,
        id: 'new-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdDistrict),
      });

      const result = await DistrictService.create(newDistrict);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/organizations',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            name: newDistrict.name,
            slug: newDistrict.slug,
            entity_type: newDistrict.entity_type,
            entity_label: newDistrict.entity_label,
            logo_url: newDistrict.logo_url,
            primary_color: newDistrict.primary_color,
            secondary_color: newDistrict.secondary_color,
            admin_email: newDistrict.admin_email,
            tagline: newDistrict.tagline,
            is_public: newDistrict.is_public,
            settings: newDistrict.settings,
          }),
        })
      );
      expect(result).toEqual(createdDistrict);
    });

    it('should default entity_type to district when not provided', async () => {
      const newDistrict = {
        name: 'New District',
        slug: 'new-district',
        admin_email: 'admin@new.com',
        primary_color: '#000000',
        is_public: true,
      };

      const createdDistrict = {
        ...newDistrict,
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        secondary_color: null,
        tagline: null,
        settings: null,
        id: 'new-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdDistrict),
      });

      await DistrictService.create(newDistrict);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.entity_type).toBe('district');
    });

    it('should throw ApiError when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Slug already exists' }),
      });

      await expect(
        DistrictService.create({ name: 'Test', slug: 'test' })
      ).rejects.toThrow('Slug already exists');
    });
  });

  describe('update', () => {
    it('should fetch existing district by ID then update by slug', async () => {
      const updates = {
        name: 'Updated District',
        primary_color: '#FF0000',
      };

      const existingDistrict = {
        id: 'dist-1',
        name: 'Original District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const updatedDistrict = {
        ...existingDistrict,
        ...updates,
        updated_at: '2024-01-02T00:00:00Z',
      };

      // First call: getById
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(existingDistrict),
      });

      // Second call: PUT
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updatedDistrict),
      });

      const result = await DistrictService.update('dist-1', updates);

      // Verify getById call
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost/api/organizations?id=dist-1',
        expect.objectContaining({
          credentials: 'include',
        })
      );

      // Verify PUT call
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/organizations/test-district',
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          body: JSON.stringify(updates),
        })
      );

      expect(result).toEqual(updatedDistrict);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw ApiError when update fails', async () => {
      const existingDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // First call: getById succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(existingDistrict),
      });

      // Second call: PUT fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Update failed' }),
      });

      await expect(
        DistrictService.update('dist-1', { name: 'Test' })
      ).rejects.toThrow('Update failed');
    });

    it('should throw ApiError when getById fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'District not found' }),
      });

      await expect(
        DistrictService.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('District not found');

      // Should not call PUT if getById fails
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should fetch existing district by ID then delete by slug', async () => {
      const existingDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // First call: getById
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(existingDistrict),
      });

      // Second call: DELETE (204 No Content)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await DistrictService.delete('dist-1');

      // Verify getById call
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost/api/organizations?id=dist-1',
        expect.objectContaining({
          credentials: 'include',
        })
      );

      // Verify DELETE call
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost/api/organizations/test-district',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw ApiError when delete fails', async () => {
      const existingDistrict = {
        id: 'dist-1',
        name: 'Test District',
        slug: 'test-district',
        entity_type: 'district',
        entity_label: null,
        logo_url: null,
        admin_email: 'admin@test.com',
        primary_color: '#000000',
        secondary_color: null,
        tagline: null,
        is_public: true,
        settings: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // First call: getById succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(existingDistrict),
      });

      // Second call: DELETE fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Cannot delete district with existing data' }),
      });

      await expect(DistrictService.delete('dist-1')).rejects.toThrow(
        'Cannot delete district with existing data'
      );
    });

    it('should throw ApiError when getById fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'District not found' }),
      });

      await expect(DistrictService.delete('non-existent-id')).rejects.toThrow(
        'District not found'
      );

      // Should not call DELETE if getById fails
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
