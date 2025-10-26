// Core entity types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadSession {
  id: string;
  userId: string;
  filename: string;
  totalSize: number;
  uploadedSize: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  chunks: UploadChunk[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadChunk {
  id: string;
  sessionId: string;
  chunkNumber: number;
  size: number;
  data: string; // base64 encoded
  uploaded: boolean;
  createdAt: Date;
}
