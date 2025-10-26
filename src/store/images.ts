import { create } from 'zustand';
import type { Image, UploadProgress } from '@/types/entities';

interface ImageState {
  images: Image[];
  selectedImage: Image | null;
  uploadProgress: UploadProgress | null;
  isLoading: boolean;
  error: string | null;
}

interface ImageActions {
  setImages: (images: Image[]) => void;
  addImage: (image: Image) => void;
  removeImage: (imageId: string) => void;
  updateImage: (imageId: string, updates: Partial<Image>) => void;
  setSelectedImage: (image: Image | null) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useImageStore = create<ImageState & ImageActions>((set) => ({
  images: [],
  selectedImage: null,
  uploadProgress: null,
  isLoading: false,
  error: null,
  
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (imageId) => set((state) => ({ 
    images: state.images.filter(img => img.id !== imageId),
    selectedImage: state.selectedImage?.id === imageId ? null : state.selectedImage
  })),
  updateImage: (imageId, updates) => set((state) => ({
    images: state.images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ),
    selectedImage: state.selectedImage?.id === imageId 
      ? { ...state.selectedImage, ...updates }
      : state.selectedImage
  })),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
