/**
 * Upload Service
 *
 * Handles file uploads to Cloudflare R2 via the upload worker.
 */

const UPLOAD_WORKER_URL = import.meta.env.VITE_R2_UPLOAD_WORKER_URL || '';

export type UploadFolder = 'district-logos' | 'school-logos';

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface UploadResponse {
  success: boolean;
  publicUrl: string;
  key: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class UploadService {
  /**
   * Upload an image file to R2 storage
   *
   * @param file - The file to upload
   * @param folder - The folder/category for the file
   * @param onProgress - Optional progress callback
   * @returns The public URL of the uploaded file
   */
  static async uploadImage(
    file: File,
    folder: UploadFolder,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    if (!UPLOAD_WORKER_URL) {
      throw new Error('Upload worker URL not configured. Set VITE_R2_UPLOAD_WORKER_URL in your environment.');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a PNG, JPG, SVG, or WebP image.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Step 1: Get presigned URL from worker
    const presignResponse = await fetch(`${UPLOAD_WORKER_URL}/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder,
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to prepare upload');
    }

    const presignData: PresignResponse = await presignResponse.json();

    // Step 2: Upload file to the worker's upload endpoint
    const uploadResponse = await this.uploadWithProgress(
      `${UPLOAD_WORKER_URL}${presignData.uploadUrl}`,
      file,
      onProgress
    );

    if (!uploadResponse.success) {
      throw new Error('Failed to upload file');
    }

    return uploadResponse.publicUrl;
  }

  /**
   * Upload file with progress tracking using XMLHttpRequest
   */
  private static uploadWithProgress(
    url: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  /**
   * Delete a file from R2 storage
   *
   * @param key - The storage key of the file to delete
   */
  static async deleteFile(key: string): Promise<void> {
    if (!UPLOAD_WORKER_URL) {
      throw new Error('Upload worker URL not configured');
    }

    const response = await fetch(`${UPLOAD_WORKER_URL}/delete/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to delete file');
    }
  }

  /**
   * Extract the storage key from a public URL
   * e.g., "https://assets.domain.com/district-logos/uuid.png" -> "district-logos/uuid.png"
   */
  static getKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.slice(1);
    } catch {
      return null;
    }
  }
}
