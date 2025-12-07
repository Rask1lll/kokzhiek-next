"use client";
import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import style from "./BooksList.module.css";

type Book = {
  id: number | string;
  title: string;
};

export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    getBooks();
    async function getBooks() {
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
      console.log(res.data);
      setBooks(res.data);
    }
  }, []);
  return (
    <div className={`w-full ${style.booksGrid} px-10`}>
      {books.map((el) => {
        return <BookCard bookId={String(el.id)} name={el.title} key={el.id} />;
      })}
    </div>
  );
}
