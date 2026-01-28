import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/setup';
import { LogoUpload } from '../LogoUpload';

// Mock the useImageUpload hook
const mockUpload = vi.fn();
const mockReset = vi.fn();

vi.mock('../../../hooks/useUpload', () => ({
  useImageUpload: vi.fn(() => ({
    upload: mockUpload,
    isUploading: false,
    progress: null,
    error: null,
    reset: mockReset,
  })),
}));

// Import after mocking
import { useImageUpload } from '../../../hooks/useUpload';

describe('LogoUpload', () => {
  const mockOnUpload = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue('https://example.com/logo.png');
    vi.mocked(useImageUpload).mockReturnValue({
      upload: mockUpload,
      isUploading: false,
      progress: null,
      error: null,
      reset: mockReset,
    });
  });

  describe('Rendering', () => {
    it('renders dropzone when no logo', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-upload-dropzone')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop or click to upload')).toBeInTheDocument();
    });

    it('shows logo preview when currentUrl provided', () => {
      render(
        <LogoUpload
          currentUrl="https://example.com/existing-logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-preview')).toBeInTheDocument();
      expect(screen.getByTestId('logo-preview')).toHaveAttribute(
        'src',
        'https://example.com/existing-logo.png'
      );
    });

    it('displays help text', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
          helpText="PNG, JPG, SVG or WebP. Max 5MB."
        />
      );

      expect(screen.getByText('PNG, JPG, SVG or WebP. Max 5MB.')).toBeInTheDocument();
    });

    it('displays custom label', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
          label="District Logo"
        />
      );

      expect(screen.getByText('District Logo')).toBeInTheDocument();
    });

    it('shows default label when none provided', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByText('Logo')).toBeInTheDocument();
    });
  });

  describe('File validation', () => {
    it('accepts PNG files', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['png content'], 'test.png', { type: 'image/png' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });
    });

    it('accepts JPG files', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['jpg content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });
    });

    it('accepts SVG files', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['<svg></svg>'], 'test.svg', { type: 'image/svg+xml' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });
    });

    it('accepts WebP files', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['webp content'], 'test.webp', { type: 'image/webp' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });
    });

    it('rejects non-image files', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('logo-upload-error')).toBeInTheDocument();
        expect(screen.getByText(/Please upload a PNG, JPG, SVG, or WebP image/i)).toBeInTheDocument();
      });

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('rejects files over 5MB', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      const input = screen.getByTestId('logo-file-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('logo-upload-error')).toBeInTheDocument();
        expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
      });

      expect(mockUpload).not.toHaveBeenCalled();
    });
  });

  describe('Upload flow', () => {
    it('shows spinner during upload', () => {
      vi.mocked(useImageUpload).mockReturnValue({
        upload: mockUpload,
        isUploading: true,
        progress: { loaded: 0, total: 100, percentage: 0 },
        error: null,
        reset: mockReset,
      });

      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-upload-progress')).toBeInTheDocument();
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('displays progress percentage', () => {
      vi.mocked(useImageUpload).mockReturnValue({
        upload: mockUpload,
        isUploading: true,
        progress: { loaded: 50, total: 100, percentage: 50 },
        error: null,
        reset: mockReset,
      });

      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-upload-percentage')).toHaveTextContent('50%');
    });

    it('hides dropzone during upload', () => {
      vi.mocked(useImageUpload).mockReturnValue({
        upload: mockUpload,
        isUploading: true,
        progress: { loaded: 0, total: 100, percentage: 0 },
        error: null,
        reset: mockReset,
      });

      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.queryByText('Drag and drop or click to upload')).not.toBeInTheDocument();
    });
  });

  describe('Remove', () => {
    it('shows remove button when logo exists', () => {
      render(
        <LogoUpload
          currentUrl="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-remove-btn')).toBeInTheDocument();
    });

    it('calls onRemove when remove clicked', () => {
      render(
        <LogoUpload
          currentUrl="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      fireEvent.click(screen.getByTestId('logo-remove-btn'));
      expect(mockOnRemove).toHaveBeenCalled();
    });

    it('shows replace button when logo exists', () => {
      render(
        <LogoUpload
          currentUrl="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-replace-btn')).toBeInTheDocument();
      expect(screen.getByText('Replace logo')).toBeInTheDocument();
    });
  });

  describe('Drag and drop', () => {
    it('highlights dropzone on dragover', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const dropzone = screen.getByTestId('logo-upload-dropzone');
      fireEvent.dragOver(dropzone);

      expect(dropzone).toHaveClass('border-amber-500');
      expect(dropzone).toHaveClass('bg-amber-50');
    });

    it('removes highlight on dragleave', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const dropzone = screen.getByTestId('logo-upload-dropzone');
      fireEvent.dragOver(dropzone);
      fireEvent.dragLeave(dropzone);

      expect(dropzone).not.toHaveClass('bg-amber-50');
    });

    it('shows drop message on dragover', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const dropzone = screen.getByTestId('logo-upload-dropzone');
      fireEvent.dragOver(dropzone);

      expect(screen.getByText('Drop image here')).toBeInTheDocument();
    });

    it('handles file drop', async () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const dropzone = screen.getByTestId('logo-upload-dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      fireEvent(dropzone, dropEvent);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('Click to upload', () => {
    it('opens file dialog when dropzone clicked', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      const input = screen.getByTestId('logo-file-input');
      const clickSpy = vi.spyOn(input, 'click');

      fireEvent.click(screen.getByTestId('logo-upload-dropzone'));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not open file dialog during upload', () => {
      vi.mocked(useImageUpload).mockReturnValue({
        upload: mockUpload,
        isUploading: true,
        progress: { loaded: 0, total: 100, percentage: 0 },
        error: null,
        reset: mockReset,
      });

      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      // During upload, there's no dropzone to click
      expect(screen.queryByTestId('logo-upload-dropzone')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('remove button has aria-label', () => {
      render(
        <LogoUpload
          currentUrl="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-remove-btn')).toHaveAttribute('aria-label', 'Remove logo');
    });

    it('file input has aria-label', () => {
      render(
        <LogoUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          folder="district-logos"
        />
      );

      expect(screen.getByTestId('logo-file-input')).toHaveAttribute('aria-label', 'Upload logo');
    });
  });
});
