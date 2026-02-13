"use client";

import { create } from "zustand";
import { Chapter, Section } from "../types/chapter";

type ChaptersStore = {
  chapters: Chapter[];
  sections: Section[];
  bookId: string | null;
  isLoading: boolean;
  error: string | null;

  // Setters
  setBookId: (bookId: string | null) => void;
  setChapters: (chapters: Chapter[]) => void;
  setSections: (sections: Section[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Chapter mutations
  addChapter: (chapter: Chapter) => void;
  updateChapter: (
    chapterId: string | number,
    updates: Partial<Chapter>
  ) => void;
  removeChapter: (chapterId: string | number) => void;

  // Section mutations
  addSection: (section: Section) => void;
  updateSection: (
    sectionId: string | number,
    updates: Partial<Omit<Section, "chapters">>
  ) => void;
  removeSection: (sectionId: string | number) => void;

  // Clear
  clearChapters: () => void;
};

export const useChaptersStore = create<ChaptersStore>((set) => ({
  chapters: [],
  sections: [],
  bookId: null,
  isLoading: false,
  error: null,

  setBookId: (bookId) => set({ bookId }),

  setChapters: (chapters) =>
    set({
      chapters: chapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }),

  setSections: (sections) =>
    set({
      sections: sections
        .map((s) => ({
          ...s,
          chapters: [...s.chapters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
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
    set((state) => {
      const numId = typeof chapterId === "string" ? Number(chapterId) : chapterId;
      return {
        chapters: state.chapters.map((ch) =>
          ch.id === numId ? { ...ch, ...updates } : ch
        ),
        sections: state.sections.map((s) => ({
          ...s,
          chapters: s.chapters.map((ch) =>
            ch.id === numId ? { ...ch, ...updates } : ch
          ),
        })),
      };
    }),

  removeChapter: (chapterId) =>
    set((state) => ({
      chapters: state.chapters.filter((ch) => ch.id !== chapterId),
    })),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    })),

  updateSection: (sectionId, updates) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    })),

  removeSection: (sectionId) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== sectionId),
    })),

  clearChapters: () =>
    set({ chapters: [], sections: [], bookId: null, error: null }),
}));
