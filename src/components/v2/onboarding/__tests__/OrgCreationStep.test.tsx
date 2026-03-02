import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { OrgCreationStep } from '../OrgCreationStep';

// Mock the useCheckSlug hook
const mockUseCheckSlug = vi.fn().mockReturnValue({
  data: { available: true, slug: 'test-org' } as Record<string, unknown> | undefined,
  isFetching: false,
});

vi.mock('@/hooks/v2/useOnboarding', () => ({
  useCheckSlug: (...args: unknown[]) => mockUseCheckSlug(...args),
}));

describe('OrgCreationStep', () => {
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCheckSlug.mockReturnValue({
      data: { available: true, slug: 'test-org' },
      isFetching: false,
    });
  });

  it('renders form fields', () => {
    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/public url/i)).toBeInTheDocument();
  });

  it('renders heading and description', () => {
    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByText('Tell us about your organization')).toBeInTheDocument();
    expect(screen.getByText(/this information helps us set up your workspace/i)).toBeInTheDocument();
  });

  it('renders entity type options', () => {
    render(<OrgCreationStep onNext={mockOnNext} />);

    const select = screen.getByLabelText(/organization type/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByText('School District')).toBeInTheDocument();
    expect(screen.getByText('Nonprofit')).toBeInTheDocument();
    expect(screen.getByText('Small Business')).toBeInTheDocument();
  });

  it('auto-generates slug from organization name', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'Westside School District');

    const slugInput = screen.getByLabelText(/public url/i);
    expect(slugInput).toHaveValue('westside-school-district');
  });

  it('allows manual slug editing', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const slugInput = screen.getByLabelText(/public url/i);
    await user.type(slugInput, 'custom-slug');
    expect(slugInput).toHaveValue('custom-slug');

    // After manual edit, typing in name should not change slug
    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'New Org Name');
    expect(slugInput).toHaveValue('custom-slug');
  });

  it('shows the stratadash.org/ prefix for slug', () => {
    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByText('stratadash.org/')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const submitButton = screen.getByRole('button', { name: /continue/i });
    await user.click(submitButton);

    expect(screen.getByText('Organization name is required')).toBeInTheDocument();
    expect(screen.getByText('Please select an organization type')).toBeInTheDocument();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('shows validation error for short slug', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'AB');
    const select = screen.getByLabelText(/organization type/i);
    await user.selectOptions(select, 'school_district');

    const submitButton = screen.getByRole('button', { name: /continue/i });
    await user.click(submitButton);

    expect(screen.getByText('URL must be at least 3 characters')).toBeInTheDocument();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('shows error when slug is unavailable', async () => {
    mockUseCheckSlug.mockReturnValue({
      data: { available: false, slug: 'taken-slug', reason: 'This URL is already taken' },
      isFetching: false,
    });

    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'Taken Slug');
    const select = screen.getByLabelText(/organization type/i);
    await user.selectOptions(select, 'school_district');

    const submitButton = screen.getByRole('button', { name: /continue/i });
    await user.click(submitButton);

    expect(screen.getByText('This URL is already taken')).toBeInTheDocument();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('submits form with correct data on valid input', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'Test Organization');

    const select = screen.getByLabelText(/organization type/i);
    await user.selectOptions(select, 'nonprofit');

    const submitButton = screen.getByRole('button', { name: /continue/i });
    await user.click(submitButton);

    expect(mockOnNext).toHaveBeenCalledWith({
      name: 'Test Organization',
      slug: 'test-organization',
      entity_type: 'nonprofit',
    });
  });

  it('shows loading state when isSubmitting is true', () => {
    render(<OrgCreationStep onNext={mockOnNext} isSubmitting={true} />);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('disables submit button while checking slug', () => {
    mockUseCheckSlug.mockReturnValue({
      data: undefined,
      isFetching: true,
    });

    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('shows slug suggestion when available', () => {
    mockUseCheckSlug.mockReturnValue({
      data: { available: false, slug: 'taken', reason: 'Taken', suggestion: 'taken-2' },
      isFetching: false,
    });

    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByText('taken-2')).toBeInTheDocument();
  });

  it('cleans slug input to only allow lowercase letters, numbers, and hyphens', async () => {
    const user = userEvent.setup();
    render(<OrgCreationStep onNext={mockOnNext} />);

    const slugInput = screen.getByLabelText(/public url/i);
    await user.type(slugInput, 'My Org!@#');
    // Only lowercase and valid chars kept
    expect(slugInput).toHaveValue('myorg');
  });

  it('renders Continue button text when not submitting', () => {
    render(<OrgCreationStep onNext={mockOnNext} />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});
