import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept?: string;
  maxSizeMB?: number;
  error?: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAcceptedExtensions(accept: string): string[] {
  return accept.split(',').map((ext) => ext.trim().toLowerCase());
}

export function FileUploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  accept = '.xlsx,.xls,.csv',
  maxSizeMB = 10,
  error = null,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      const extensions = getAcceptedExtensions(accept);
      const fileName = file.name.toLowerCase();
      const hasValidExt = extensions.some((ext) => fileName.endsWith(ext));
      if (!hasValidExt) {
        return `Invalid file type. Accepted: ${extensions.join(', ')}`;
      }
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File too large. Maximum size: ${maxSizeMB} MB`;
      }
      return null;
    },
    [accept, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  const displayError = validationError || error;

  if (selectedFile) {
    return (
      <div>
        <div
          data-testid="file-upload-zone"
          className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900" data-testid="file-name">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            data-testid="file-clear"
            onClick={onClear}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {displayError && (
          <p data-testid="upload-error" className="mt-2 text-sm text-red-600">
            {displayError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        data-testid="file-upload-zone"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mb-3 h-10 w-10 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">Drag & drop or click to upload</p>
        <p className="mt-1 text-xs text-gray-500">
          Accepts {accept} (max {maxSizeMB} MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File upload"
        />
      </div>
      {displayError && (
        <p data-testid="upload-error" className="mt-2 text-sm text-red-600">
          {displayError}
        </p>
      )}
    </div>
  );
}
