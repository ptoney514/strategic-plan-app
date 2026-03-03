import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { FileUploadZone } from '../FileUploadZone';

describe('FileUploadZone', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    selectedFile: null,
    onClear: vi.fn(),
  };

  it('renders dropzone with upload text', () => {
    render(<FileUploadZone {...defaultProps} />);

    expect(screen.getByText('Drag & drop or click to upload')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-zone')).toBeInTheDocument();
  });

  it('calls onFileSelect when valid file selected via input', async () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone {...defaultProps} onFileSelect={onFileSelect} />);

    const file = new File(['test content'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const input = screen.getByLabelText('File upload') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('rejects file with invalid extension', () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone {...defaultProps} onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    const input = screen.getByLabelText('File upload') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('upload-error')).toHaveTextContent('Invalid file type');
  });

  it('rejects oversized file', async () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone {...defaultProps} onFileSelect={onFileSelect} maxSizeMB={1} />);

    // Create a file > 1MB
    const largeContent = new ArrayBuffer(1.5 * 1024 * 1024);
    const file = new File([largeContent], 'big.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const input = screen.getByLabelText('File upload') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('upload-error')).toHaveTextContent('File too large');
  });

  it('shows selected file name and size when file provided', () => {
    const file = new File(['hello world'], 'report.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    render(<FileUploadZone {...defaultProps} selectedFile={file} />);

    expect(screen.getByTestId('file-name')).toHaveTextContent('report.xlsx');
    expect(screen.getByTestId('file-upload-zone')).toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', async () => {
    const onClear = vi.fn();
    const file = new File(['content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    render(<FileUploadZone {...defaultProps} selectedFile={file} onClear={onClear} />);

    await userEvent.click(screen.getByTestId('file-clear'));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
