import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../../hooks/useUpload';
import type { UploadFolder } from '../../lib/services/upload.service';

interface LogoUploadProps {
  /** Current logo URL (if exists) */
  currentUrl?: string;
  /** Callback when a new logo is uploaded */
  onUpload: (url: string) => void;
  /** Callback when logo is removed */
  onRemove: () => void;
  /** Folder to upload to */
  folder: UploadFolder;
  /** Optional label override */
  label?: string;
  /** Optional help text */
  helpText?: string;
}

/**
 * Logo upload component with drag-and-drop support
 */
export function LogoUpload({
  currentUrl,
  onUpload,
  onRemove,
  folder,
  label = 'Logo',
  helpText = 'PNG, JPG, SVG or WebP. Max 5MB.',
}: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, progress } = useImageUpload({
    folder,
    onSuccess: (url) => {
      setPreviewUrl(null);
      setUploadError(null);
      onUpload(url);
    },
    onError: (error) => {
      setPreviewUrl(null);
      setUploadError(error.message);
    },
  });

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PNG, JPG, SVG, or WebP image.';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File is too large. Maximum size is 5MB.';
    }

    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file
      await upload(file);
    },
    [upload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setUploadError(null);
    onRemove();
  }, [onRemove]);

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {/* Current logo or upload zone */}
      {displayUrl && !isUploading ? (
        <div data-testid="logo-preview-container" className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            <img
              data-testid="logo-preview"
              src={displayUrl}
              alt="Logo preview"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <button
            type="button"
            data-testid="logo-remove-btn"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            aria-label="Remove logo"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-testid="logo-replace-btn"
            onClick={handleClick}
            className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Replace logo
          </button>
        </div>
      ) : (
        <div
          data-testid="logo-upload-dropzone"
          onClick={!isUploading ? handleClick : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-slate-400'}
            ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
          `}
        >
          {isUploading ? (
            <div data-testid="logo-upload-progress" className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-3" />
              <p className="text-sm text-slate-600 font-medium">Uploading...</p>
              {progress && (
                <div className="w-full max-w-xs mt-3">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p data-testid="logo-upload-percentage" className="text-xs text-slate-500 mt-1">{progress.percentage}%</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {isDragging ? (
                <Upload className="h-10 w-10 text-amber-600 mb-3" />
              ) : (
                <ImageIcon className="h-10 w-10 text-slate-400 mb-3" />
              )}
              <p className="text-sm text-slate-600 font-medium">
                {isDragging ? 'Drop image here' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs text-slate-500 mt-1">{helpText}</p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div data-testid="logo-upload-error" className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        data-testid="logo-file-input"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload logo"
      />
    </div>
  );
}
