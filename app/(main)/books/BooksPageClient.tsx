"use client";

import { useCallback, useEffect, useState } from "react";
import BookCard from "@/app/components/booksPage/booksSection/booksList/BookCard";
import BookCardSkeleton from "@/app/components/booksPage/booksSection/booksList/BookCardSkeleton";
import BooksFilterBar, {
  BooksFilterState,
  SortBy,
  SortOrder,
} from "@/app/components/booksPage/booksSection/filters/BooksFilterBar";
import { ViewMode } from "@/app/components/booksPage/booksSection/filters/BooksViewModeToggle";
import { useBooksStore } from "@/app/store/booksStore";
import { useBooks } from "@/app/hooks/useBooks";
import style from "@/app/components/booksPage/booksSection/booksList/BooksList.module.css";

export default function BooksPageClient() {
  const { books } = useBooksStore();
  const { deleteBook, getBooks, isLoading } = useBooks();
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const fetchBooks = useCallback(() => {
    getBooks({ sort_by: sortBy, sort_order: sortOrder });
  }, [getBooks, sortBy, sortOrder]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFilterChange = (state: BooksFilterState) => {
    setSortBy(state.sortBy);
    setSortOrder(state.sortOrder);
    setViewMode(state.viewMode);
  };

  const containerClass = viewMode === "list" ? style.booksList : style.booksGrid;

  return (
    <>
      <BooksFilterBar onChange={handleFilterChange} />
      <div
        className={`w-full px-14 ${
          viewMode === "list"
            ? "flex flex-col gap-4"
            : style.booksGrid
        }`}
      >
        {isLoading ? (
          <>
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </>
        ) : (
          books.map((el) => (
            <BookCard
              bookId={el.id}
              name={el.title}
              key={el.id}
              onDelete={deleteBook}
              viewMode={viewMode}
            />
          ))
        )}
      </div>
    </>
  );
}
