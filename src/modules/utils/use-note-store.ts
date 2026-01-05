import { create } from 'zustand';

interface NotesState {
  isOnline: boolean;
  pendingCount: number;
  viewMode: 'list' | 'grid';
  setIsOnline: (isOnline: boolean) => void;
  setPendingCount: (count: number) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  isOnline: true,
  pendingCount: 0,
  viewMode: 'grid',
  setIsOnline: (isOnline) => set({ isOnline }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setViewMode: (viewMode) => set({ viewMode }),
}));