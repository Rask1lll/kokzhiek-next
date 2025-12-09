"use client";

import { create } from "zustand";

type Book = {
  id: number | string;
  title: string;
};

type BooksStore = {
  books: Book[];
  isLoading: boolean;
  error: string | null;

  // State setters
  setBooks: (books: Book[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions
  addBook: (book: Book) => void;
  updateBook: (bookId: number | string, updates: Partial<Book>) => void;
  removeBook: (bookId: number | string) => void;
  refreshBooks: () => Promise<void>;

  // Clear
  clearBooks: () => void;
};

export const useBooksStore = create<BooksStore>((set, get) => ({
  books: [],
  isLoading: false,
  error: null,

  setBooks: (books) => set({ books }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

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

  refreshBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const res = await data.json();
      set({ books: res.data ?? [], isLoading: false });
    } catch (error) {
      console.error("Error fetching books:", error);
      set({ error: "Failed to fetch books", isLoading: false, books: [] });
    }
  },

  clearBooks: () => set({ books: [], error: null }),
}));

