// Image-related constants
export const IMAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxWidth: 4096,
  maxHeight: 4096,
} as const;

export const UPLOAD_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const IMAGE_QUALITY = {
  LOW: 0.6,
  MEDIUM: 0.8,
  HIGH: 0.9,
  ORIGINAL: 1,
} as const;
