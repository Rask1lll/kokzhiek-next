"use client";

import { useSearchParams } from "next/navigation";
import BookInfoCard from "@/app/components/bookDetailsPage.tsx/BookInfoCard";
import BookInfoCardSkeleton from "@/app/components/bookDetailsPage.tsx/BookInfoCardSkeleton";
import ChaptersContainer from "@/app/components/bookDetailsPage.tsx/ChaptersContainer";
import { useEffect, useState } from "react";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { Book } from "@/app/types/book";

const LANGUAGE_MAP: Record<string, string> = {
  kk: "Қазақ тілі",
  ru: "Русский",
  en: "English",
};

export function BookPageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        <BookInfoCardSkeleton />
      </div>
    </main>
  );
}

export default function BookPageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("book");
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setChapters } = useChaptersStore();

  useEffect(() => {
    if (!id) return;

    async function fetchBook() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "GET",
          }
        );
        const res = await response.json();
        setChapters(res.data?.chapters ?? []);
        setBook(res.data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBook();
  }, [id, setChapters]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        {isLoading || !book ? (
          <BookInfoCardSkeleton />
        ) : (
          <BookInfoCard
            title={book.title}
            author={book.settings?.author}
            subject={book.subject?.name_ru}
            grade={book.grade?.label}
            language={LANGUAGE_MAP[book.language] ?? book.language}
            description={book.description}
            coverUrl={book.cover_image_url}
          />
        )}
      </div>

      <div className="mt-4">
        <ChaptersContainer bookId={id as string} isLoading={isLoading} />
      </div>
    </main>
  );
}

