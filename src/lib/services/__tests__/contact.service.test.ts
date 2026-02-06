import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactService } from '../contact.service';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin for URL construction
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5174' },
      writable: true,
    });
  });

  describe('submitContactForm', () => {
    const mockFormData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      organization: 'Test District',
      topic: 'Schedule a demo',
      phone: '555-1234',
      message: 'I would like to learn more about StrataDash.',
    };

    it('should successfully submit form data via fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const result = await ContactService.submitContactForm(mockFormData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5174/api/contact',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            organization: 'Test District',
            topic: 'Schedule a demo',
            phone: '555-1234',
            message: 'I would like to learn more about StrataDash.',
          }),
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should transform camelCase fields to snake_case for API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await ContactService.submitContactForm(mockFormData);

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody).toHaveProperty('first_name', 'John');
      expect(requestBody).toHaveProperty('last_name', 'Doe');
      expect(requestBody).not.toHaveProperty('firstName');
      expect(requestBody).not.toHaveProperty('lastName');
    });

    it('should return success: false with error message on fetch error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database connection failed' }),
      });

      const result = await ContactService.submitContactForm(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to submit form. Please try again or email us directly.');
    });

    it('should handle null optional fields (phone, message)', async () => {
      const formDataWithoutOptionals = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        organization: 'Another District',
        topic: 'Pricing information',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const result = await ContactService.submitContactForm(formDataWithoutOptionals);

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody).toEqual({
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        organization: 'Another District',
        topic: 'Pricing information',
        phone: null,
        message: null,
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle empty string optional fields as null', async () => {
      const formDataWithEmptyStrings = {
        email: 'test@example.com',
        firstName: 'Bob',
        lastName: 'Jones',
        organization: 'Empty Fields District',
        topic: 'Technical questions',
        phone: '',
        message: '',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const result = await ContactService.submitContactForm(formDataWithEmptyStrings);

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.phone).toBeNull();
      expect(requestBody.message).toBeNull();
      expect(result).toEqual({ success: true });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await ContactService.submitContactForm(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to submit form. Please try again or email us directly.');
    });
  });

  describe('getAll', () => {
    it('should fetch all contact submissions', async () => {
      const mockSubmissions = [
        {
          id: '1',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          organization: 'Test District',
          topic: 'Demo',
          phone: null,
          message: null,
          status: 'new',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSubmissions),
      });

      const result = await ContactService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5174/api/contact',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockSubmissions);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(ContactService.getAll()).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update submission status', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await ContactService.updateStatus('1', 'reviewed');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5174/api/contact/1',
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          body: JSON.stringify({ status: 'reviewed' }),
        })
      );
    });

    it('should throw error on failed update', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Submission not found' }),
      });

      await expect(ContactService.updateStatus('999', 'reviewed')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a submission', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      await ContactService.delete('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5174/api/contact/1',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
    });

    it('should throw error on failed delete', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not Found' }),
      });

      await expect(ContactService.delete('999')).rejects.toThrow();
    });
  });
});
