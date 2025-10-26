// UI-related types
export interface ImageGalleryProps {
  images: Image[];
  onImageSelect?: (image: Image) => void;
  onImageDelete?: (imageId: string) => void;
  loading?: boolean;
  error?: string;
}

export interface ImageUploadProps {
  onUploadComplete?: (image: Image) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
