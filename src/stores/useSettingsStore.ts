import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      ollamaUrl: localStorage.getItem('ollamaUrl') || 'http://localhost:11434',
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
    }),
    {
      name: 'settings-storage',
    }
  )
);