"use client";

import { useCallback, useEffect, useState } from "react";
import BookCard from "@/app/components/booksPage/booksSection/booksList/BookCard";
import BookCardSkeleton from "@/app/components/booksPage/booksSection/booksList/BookCardSkeleton";
import BooksFilterBar, {
  BooksFilterState,
} from "@/app/components/booksPage/booksSection/filters/BooksFilterBar";
import { ViewMode } from "@/app/components/booksPage/booksSection/filters/BooksViewModeToggle";
import { useBooksStore } from "@/app/store/booksStore";
import { useBooks } from "@/app/hooks/useBooks";
import { GetBooksParams } from "@/app/services/book/booksApi";
import { BookStatus } from "@/app/types/book";
import style from "@/app/components/booksPage/booksSection/booksList/BooksList.module.css";

export default function BooksPageClient() {
  const { books } = useBooksStore();
  const { deleteBook, getBooks, isLoading } = useBooks();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<GetBooksParams>({
    sort_by: "recent",
    sort_order: "desc",
  });

  const fetchBooks = useCallback(() => {
    getBooks(filters);
  }, [getBooks, filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFilterChange = (state: BooksFilterState) => {
    setViewMode(state.viewMode);

    const newFilters: GetBooksParams = {
      sort_by: state.sortBy,
      sort_order: state.sortOrder,
    };

    if (state.search) {
      newFilters.search = state.search;
    }
    if (state.status !== "all") {
      newFilters.status = state.status as BookStatus;
    }
    if (state.gradeId) {
      newFilters.grade_id = state.gradeId;
    }
    if (state.subjectId) {
      newFilters.subject_id = state.subjectId;
    }

    setFilters(newFilters);
  };

  return (
    <>
      <BooksFilterBar onChange={handleFilterChange} />
      <div
        className={`w-full px-14 min-h-[calc(100vh-330px)] ${
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
              status={el.status}
              grade={el.grade?.label}
              coverImageUrl={el.cover_image_url}
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
