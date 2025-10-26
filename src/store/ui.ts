import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'list';
  selectedImages: string[];
  showUploadModal: boolean;
  showImageModal: boolean;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleImageSelection: (imageId: string) => void;
  selectAllImages: (imageIds: string[]) => void;
  clearSelection: () => void;
  setShowUploadModal: (show: boolean) => void;
  setShowImageModal: (show: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  viewMode: 'grid',
  selectedImages: [],
  showUploadModal: false,
  showImageModal: false,
  
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleImageSelection: (imageId) => set((state) => ({
    selectedImages: state.selectedImages.includes(imageId)
      ? state.selectedImages.filter(id => id !== imageId)
      : [...state.selectedImages, imageId]
  })),
  selectAllImages: (imageIds) => set({ selectedImages: imageIds }),
  clearSelection: () => set({ selectedImages: [] }),
  setShowUploadModal: (showUploadModal) => set({ showUploadModal }),
  setShowImageModal: (showImageModal) => set({ showImageModal }),
}));
