"use client";

import { create } from "zustand";
import { Book } from "../types/book";

type BooksStore = {
  books: Book[];
  isLoading: boolean;
  error: string | null;

  // State setters
  setBooks: (books: Book[]) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Actions
  addBook: (book: Book) => void;
  updateBook: (bookId: number | string, updates: Partial<Book>) => void;
  removeBook: (bookId: number | string) => void;

  // Clear
  clearBooks: () => void;
};

export const useBooksStore = create<BooksStore>((set, get) => ({
  books: [],
  isLoading: false,
  error: null,

  setBooks: (books) => set({ books }),
  setIsLoading: (isLoading) => set({ isLoading }),

  addBook: (book) =>
    set((state) => ({
      books: [...state.books, book],
    })),

  updateBook: (bookId, updates) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, ...updates } : book
      ),
    })),

  removeBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== bookId),
    })),

  clearBooks: () => set({ books: [], error: null }),
}));
