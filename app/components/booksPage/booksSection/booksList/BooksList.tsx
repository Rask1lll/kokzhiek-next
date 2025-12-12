"use client";
import { useEffect } from "react";
import BookCard from "./BookCard";
import BookCardSkeleton from "./BookCardSkeleton";
import { useBooksStore } from "@/app/store/booksStore";
import style from "./BooksList.module.css";
import { useBooks } from "@/app/hooks/useBooks";

export default function BooksList() {
  const { books } = useBooksStore();
  const { getBooks, isLoading } = useBooks();

  useEffect(() => {
    getBooks();
  }, [getBooks]);

  return (
    <div className={`w-full ${style.booksGrid} px-14`}>
      {isLoading ? (
        <>
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
          {/* <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton /> */}
        </>
      ) : (
        books.map((el) => {
          return (
            <BookCard bookId={String(el.id)} name={el.title} key={el.id} />
          );
        })
      )}
    </div>
  );
}
