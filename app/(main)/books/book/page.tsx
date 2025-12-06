"use client";

import { useSearchParams } from "next/navigation";
import BookInfoCard from "@/app/components/bookDetailsPage.tsx/BookInfoCard";
import ChaptersContainer from "@/app/components/bookDetailsPage.tsx/ChaptersContainer";

const testBook = {
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
  const id = searchParams.get("id");
  const book = testBook;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        <BookInfoCard
          title={book.title}
          author={book.author}
          subject={book.subject}
          grade={book.grade}
          publisher={book.publisher}
          language={book.language}
          description={book.description}
          coverUrl={book.coverUrl}
        />
      </div>
      <div className="mt-4">
        <ChaptersContainer />
      </div>
    </main>
  );
}
