import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/setup';
import { ContactModal } from '../ContactModal';
import { ContactService } from '../../lib/services/contact.service';

// Mock the ContactService
vi.mock('../../lib/services/contact.service', () => ({
  ContactService: {
    submitContactForm: vi.fn(),
  },
}));

describe('ContactModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields when open', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/work email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/which topic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/how can we help/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ContactModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByLabelText(/work email address/i)).not.toBeInTheDocument();
    });

    it('should display "Contact Us" heading', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update form values on input change', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/work email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update all fields correctly', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'john@district.edu', name: 'email' },
      });
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John', name: 'firstName' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe', name: 'lastName' },
      });
      fireEvent.change(screen.getByLabelText(/organization/i), {
        target: { value: 'Test District', name: 'organization' },
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), {
        target: { value: '555-1234', name: 'phone' },
      });
      fireEvent.change(screen.getByLabelText(/how can we help/i), {
        target: { value: 'I need help with strategic planning.', name: 'message' },
      });

      expect(screen.getByLabelText(/work email address/i)).toHaveValue('john@district.edu');
      expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
      expect(screen.getByLabelText(/organization/i)).toHaveValue('Test District');
      expect(screen.getByLabelText(/phone number/i)).toHaveValue('555-1234');
      expect(screen.getByLabelText(/how can we help/i)).toHaveValue(
        'I need help with strategic planning.'
      );
    });
  });

  describe('form submission', () => {
    it('should call ContactService.submitContactForm on submit', async () => {
      (ContactService.submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'test@example.com', name: 'email' },
      });
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John', name: 'firstName' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe', name: 'lastName' },
      });
      fireEvent.change(screen.getByLabelText(/organization/i), {
        target: { value: 'Test District', name: 'organization' },
      });
      fireEvent.change(screen.getByLabelText(/which topic/i), {
        target: { value: 'Schedule a demo', name: 'topic' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(ContactService.submitContactForm).toHaveBeenCalledWith({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          organization: 'Test District',
          topic: 'Schedule a demo',
          phone: '',
          message: '',
        });
      });
    });

    it('should show loading state while submitting', async () => {
      let resolveSubmit: (value: { success: boolean }) => void;
      const submitPromise = new Promise<{ success: boolean }>((resolve) => {
        resolveSubmit = resolve;
      });

      (ContactService.submitContactForm as ReturnType<typeof vi.fn>).mockReturnValue(submitPromise);

      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'test@example.com', name: 'email' },
      });
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John', name: 'firstName' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe', name: 'lastName' },
      });
      fireEvent.change(screen.getByLabelText(/organization/i), {
        target: { value: 'Test District', name: 'organization' },
      });
      fireEvent.change(screen.getByLabelText(/which topic/i), {
        target: { value: 'Schedule a demo', name: 'topic' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      });

      // Resolve and check success
      resolveSubmit!({ success: true });

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument();
      });
    });

    it('should show success message after successful submission', async () => {
      (ContactService.submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'test@example.com', name: 'email' },
      });
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John', name: 'firstName' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe', name: 'lastName' },
      });
      fireEvent.change(screen.getByLabelText(/organization/i), {
        target: { value: 'Test District', name: 'organization' },
      });
      fireEvent.change(screen.getByLabelText(/which topic/i), {
        target: { value: 'Schedule a demo', name: 'topic' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument();
        expect(screen.getByText(/we've received your message/i)).toBeInTheDocument();
      });
    });

    it('should show error message on failed submission', async () => {
      (ContactService.submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Failed to submit form. Please try again.',
      });

      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'test@example.com', name: 'email' },
      });
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John', name: 'firstName' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe', name: 'lastName' },
      });
      fireEvent.change(screen.getByLabelText(/organization/i), {
        target: { value: 'Test District', name: 'organization' },
      });
      fireEvent.change(screen.getByLabelText(/which topic/i), {
        target: { value: 'Schedule a demo', name: 'topic' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
      });
    });
  });

  describe('modal behavior', () => {
    it('should close modal on backdrop click', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      // The backdrop is the first child div with onClick
      const backdrop = screen.getByRole('heading', { name: /contact us/i }).closest('.fixed')
        ?.firstChild as HTMLElement;

      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should close modal on Escape key press', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking close button', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('topic dropdown', () => {
    it('should display all topic options', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      const select = screen.getByLabelText(/which topic/i);
      expect(select).toBeInTheDocument();

      // Check options exist
      expect(screen.getByRole('option', { name: /select a topic/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /schedule a demo/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pricing information/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /technical questions/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /partnership inquiry/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /other/i })).toBeInTheDocument();
    });

    it('should update topic when selecting an option', () => {
      render(<ContactModal isOpen={true} onClose={mockOnClose} />);

      const select = screen.getByLabelText(/which topic/i);
      fireEvent.change(select, { target: { value: 'Pricing information', name: 'topic' } });

      expect(select).toHaveValue('Pricing information');
    });
  });
});
