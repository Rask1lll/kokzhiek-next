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
import { useAuth } from "@/app/hooks/useAuth";
import { GetBooksParams } from "@/app/services/book/booksApi";
import { BookStatus } from "@/app/types/book";
import style from "@/app/components/booksPage/booksSection/booksList/BooksList.module.css";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { isAuthor } from "@/app/libs/roles";

export default function BooksPageClient() {
  const { books } = useBooksStore();
  const { deleteBook, duplicateBook, getBooks, isLoading } = useBooks();
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("book");
  const canEdit = isAuthor(user);
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

  const handleDuplicateBook = async (bookId: number, bookTitle: string) => {
    const result = await duplicateBook(bookId);
    if (result.success) {
      await getBooks(filters);
      router.push(`/books/book?book=${result.data.id}`);
    } else {
      alert(result.message || t("duplicateError"));
    }
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
              canEdit={canEdit}
              key={el.id}
              onDelete={deleteBook}
              onDuplicate={handleDuplicateBook}
              viewMode={viewMode}
            />
          ))
        )}
      </div>
    </>
  );
}
