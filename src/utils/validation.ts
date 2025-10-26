// Validation utilities
import { IMAGE_CONFIG } from '@/constants/image';

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > IMAGE_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(IMAGE_CONFIG.maxFileSize)}`
    };
  }

  // Check file type
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${IMAGE_CONFIG.allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

export function validateImageDimensions(
  width: number, 
  height: number
): { isValid: boolean; error?: string } {
  if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
    return {
      isValid: false,
      error: `Image dimensions must be less than ${IMAGE_CONFIG.maxWidth} × ${IMAGE_CONFIG.maxHeight}`
    };
  }

  return { isValid: true };
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replaceAll(/[^a-zA-Z0-9.-]/g, '_')
    .replaceAll(/_+/g, '_')
    .replaceAll(/^_|_$/g, '');
}

// Helper function for file size formatting (re-exported from format.ts)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
