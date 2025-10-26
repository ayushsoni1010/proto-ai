// API-related types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadProgress {
  sessionId: string;
  uploaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
}

export interface ImageUploadRequest {
  filename: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface ChunkedUploadRequest {
  sessionId: string;
  chunkNumber: number;
  totalChunks: number;
  chunkSize: number;
  data: string; // base64 encoded
}
