import { z } from 'zod';

export const imageUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('File size must be positive'),
  metadata: z.record(z.any()).optional(),
});

export const chunkedUploadSchema = z.object({
  sessionId: z.string().uuid({ message: 'Invalid session ID' }),
  chunkNumber: z.number().int().positive('Chunk number must be positive'),
  totalChunks: z.number().int().positive('Total chunks must be positive'),
  chunkSize: z.number().int().positive('Chunk size must be positive'),
  data: z.string().min(1, 'Chunk data is required'),
});

export const imageMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  alt: z.string().optional(),
});

export const imageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  mimeType: z.string().optional(),
  sortBy: z.enum(['created_at', 'filename', 'size']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type ChunkedUploadInput = z.infer<typeof chunkedUploadSchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;
export type ImageQueryInput = z.infer<typeof imageQuerySchema>;
