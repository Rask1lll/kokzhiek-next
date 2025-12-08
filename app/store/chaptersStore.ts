"use client";

import { create } from "zustand";

export type Chapter = {
  id: number | string;
  title: string;
  order?: number;
};

type ChaptersStore = {
  chapters: Chapter[];
  bookId: string | null;
  isLoading: boolean;
  error: string | null;

  // Setters
  setBookId: (bookId: string | null) => void;
  setChapters: (chapters: Chapter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Mutations
  addChapter: (chapter: Chapter) => void;
  updateChapter: (chapterId: string | number, updates: Partial<Chapter>) => void;
  removeChapter: (chapterId: string | number) => void;

  // Clear
  clearChapters: () => void;
};

export const useChaptersStore = create<ChaptersStore>((set) => ({
  chapters: [],
  bookId: null,
  isLoading: false,
  error: null,

  setBookId: (bookId) => set({ bookId }),

  setChapters: (chapters) =>
    set({
      chapters: chapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  addChapter: (chapter) =>
    set((state) => ({
      chapters: [...state.chapters, chapter].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    })),

  updateChapter: (chapterId, updates) =>
    set((state) => ({
      chapters: state.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, ...updates } : ch
      ),
    })),

  removeChapter: (chapterId) =>
    set((state) => ({
      chapters: state.chapters.filter((ch) => ch.id !== chapterId),
    })),

  clearChapters: () => set({ chapters: [], bookId: null, error: null }),
}));

