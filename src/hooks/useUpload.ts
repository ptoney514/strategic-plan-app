import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UploadService } from '../lib/services/upload.service';
import type { UploadFolder, UploadProgress } from '../lib/services/upload.service';

interface UseImageUploadOptions {
  folder: UploadFolder;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  upload: (file: File) => Promise<string | undefined>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for uploading images to R2 storage
 *
 * @example
 * ```tsx
 * const { upload, isUploading, progress } = useImageUpload({
 *   folder: 'district-logos',
 *   onSuccess: (url) => setLogoUrl(url),
 * });
 *
 * const handleFileSelect = async (file: File) => {
 *   await upload(file);
 * };
 * ```
 */
export function useImageUpload({
  folder,
  onSuccess,
  onError,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      const url = await UploadService.uploadImage(file, folder, (p) => {
        setProgress(p);
      });

      return url;
    },
    onSuccess: (url) => {
      setProgress(null);
      onSuccess?.(url);
    },
    onError: (error: Error) => {
      setProgress(null);
      onError?.(error);
    },
  });

  const upload = useCallback(
    async (file: File) => {
      try {
        return await mutation.mutateAsync(file);
      } catch {
        return undefined;
      }
    },
    [mutation]
  );

  const reset = useCallback(() => {
    setProgress(null);
    mutation.reset();
  }, [mutation]);

  return {
    upload,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
    reset,
  };
}

/**
 * Hook for deleting files from R2 storage
 */
export function useDeleteFile() {
  return useMutation({
    mutationFn: (key: string) => UploadService.deleteFile(key),
  });
}
