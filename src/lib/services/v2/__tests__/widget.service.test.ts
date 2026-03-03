import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WidgetService } from '../widget.service';

describe('WidgetService', () => {
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

  describe('list', () => {
    it('calls correct URL with orgSlug query param', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await WidgetService.list('westside');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets?orgSlug=westside',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('returns array of widgets', async () => {
      const widgets = [{ id: 'w-1', title: 'Test' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(widgets),
      });

      const result = await WidgetService.list('westside');
      expect(result).toEqual(widgets);
    });
  });

  describe('listPublic', () => {
    it('calls correct public URL with orgSlug query param', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await WidgetService.listPublic('westside');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets/public?orgSlug=westside',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('get', () => {
    it('calls correct URL with widget id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'w-1' }),
      });

      await WidgetService.get('w-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets/w-1',
        expect.objectContaining({ credentials: 'include' }),
      );
    });
  });

  describe('create', () => {
    it('calls correct URL with POST method', async () => {
      const payload = { type: 'donut' as const, title: 'Progress' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'w-new', ...payload }),
      });

      await WidgetService.create('westside', payload);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets?orgSlug=westside',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          credentials: 'include',
        }),
      );
    });
  });

  describe('update', () => {
    it('calls correct URL with PUT method', async () => {
      const payload = { title: 'Updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'w-1', ...payload }),
      });

      await WidgetService.update('w-1', payload);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets/w-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  describe('delete', () => {
    it('calls correct URL with DELETE method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await WidgetService.delete('w-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets/w-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('reorder', () => {
    it('calls correct URL with PUT method and payload', async () => {
      const payload = {
        orgSlug: 'westside',
        widgets: [
          { id: 'w-1', position: 0 },
          { id: 'w-2', position: 1 },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await WidgetService.reorder(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost/api/v2/widgets/reorder',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('throws on 401 unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(WidgetService.list('westside')).rejects.toThrow();
    });

    it('throws on 404 not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Widget not found' }),
      });

      await expect(WidgetService.get('nonexistent')).rejects.toThrow();
    });
  });
});
