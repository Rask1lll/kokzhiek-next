"use client";

import { useSearchParams } from "next/navigation";
import BookInfoCard from "@/app/components/bookDetailsPage.tsx/BookInfoCard";
import BookInfoCardSkeleton from "@/app/components/bookDetailsPage.tsx/BookInfoCardSkeleton";
import ChaptersContainer from "@/app/components/bookDetailsPage.tsx/ChaptersContainer";
import { useEffect, useState } from "react";
import { useChaptersStore } from "@/app/store/chaptersStore";

type Chapter = {
  id: number | string;
  title: string;
};

const testBook = {
  // TODO: remove this
  id: "1",
  title: "Учебник математики 10 класс",
  author: "Иванов И.И.",
  subject: "Математика",
  grade: "10 класс",
  publisher: "Көкжиек-Горизонт",
  language: "Қазақ тілі",
  description:
    "Современный учебник по математике для 10 класса с примерами, задачами и практическими заданиями.",
  coverUrl: "https://placehold.co/600x400@2x.png",
};

export default function BookPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("book");
  const book = testBook;
  const [bookData, setBookData] = useState(testBook);
  const [isLoading, setIsLoading] = useState(true);
  const { setChapters } = useChaptersStore();

  useEffect(() => {
    if (!id) return;

    async function getChapters() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "GET",
          }
        );
        const res = await data.json();
        console.log("Book response:", res);
        setChapters(res.data?.chapters ?? []);
        setBookData(res.data);
        console.log(bookData);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getChapters();
  }, [id]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        {isLoading ? (
          <BookInfoCardSkeleton />
        ) : (
          <BookInfoCard
            title={bookData.title}
            author={book.author}
            subject={book.subject}
            grade={book.grade}
            publisher={book.publisher}
            language={book.language}
            description={bookData.description}
            coverUrl={book.coverUrl}
          />
        )}
      </div>

      <div className="mt-4">
        <ChaptersContainer bookId={id as string} isLoading={isLoading} />
      </div>
    </main>
  );
}
