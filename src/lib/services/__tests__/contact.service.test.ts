import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactService } from '../contact.service';
import { supabase } from '../../supabase';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('ContactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should successfully submit form data to Supabase', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await ContactService.submitContactForm(mockFormData);

      expect(supabase.from).toHaveBeenCalledWith('spb_contact_submissions');
      expect(mockInsert).toHaveBeenCalledWith({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        organization: 'Test District',
        topic: 'Schedule a demo',
        phone: '555-1234',
        message: 'I would like to learn more about StrataDash.',
      });
      expect(result).toEqual({ success: true });
    });

    it('should transform camelCase fields to snake_case for database', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      await ContactService.submitContactForm(mockFormData);

      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall).toHaveProperty('first_name', 'John');
      expect(insertCall).toHaveProperty('last_name', 'Doe');
      expect(insertCall).not.toHaveProperty('firstName');
      expect(insertCall).not.toHaveProperty('lastName');
    });

    it('should return success: false with error message on Supabase error', async () => {
      const mockError = { message: 'Database connection failed', code: '500' };
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
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

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await ContactService.submitContactForm(formDataWithoutOptionals);

      expect(mockInsert).toHaveBeenCalledWith({
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

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await ContactService.submitContactForm(formDataWithEmptyStrings);

      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall.phone).toBeNull();
      expect(insertCall.message).toBeNull();
      expect(result).toEqual({ success: true });
    });
  });
});
