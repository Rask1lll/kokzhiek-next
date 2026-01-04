"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import BookInfoCard from "@/app/components/bookDetailsPage.tsx/BookInfoCard";
import BookInfoCardSkeleton from "@/app/components/bookDetailsPage.tsx/BookInfoCardSkeleton";
import ChaptersContainer from "@/app/components/bookDetailsPage.tsx/ChaptersContainer";
import { useEffect, useState } from "react";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { Book } from "@/app/types/book";
import { handleDeleteBook } from "@/app/services/book/booksApi";
import { getAuthHeaders } from "@/app/libs/auth";
import { useChapterPresence } from "@/app/hooks/useChapterPresence";
import { useAuth } from "@/app/hooks/useAuth";

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
  const router = useRouter();
  const t = useTranslations("book");
  const id = searchParams.get("book");
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setChapters } = useChaptersStore();
  const { user } = useAuth();
  const { isConnected, requestBookPresence, isChapterOccupied, getChapterUsers } = useChapterPresence(user);

  const onDeleteBook = async () => {
    if (!book) return;

    const confirmed = window.confirm(
      t("deleteConfirm", { title: book.title })
    );
    if (!confirmed) return;

    router.push("/books");
    await handleDeleteBook(book.id);
  };

  useEffect(() => {
    if (!id) return;

    async function fetchBook() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`,
          {
            headers: getAuthHeaders(),
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

  // Запрашиваем состояние глав когда WebSocket подключен
  useEffect(() => {
    if (id && isConnected) {
      requestBookPresence(id);
    }
  }, [id, isConnected, requestBookPresence]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto">
        {isLoading || !book ? (
          <BookInfoCardSkeleton />
        ) : (
          <BookInfoCard
            bookId={book.id}
            title={book.title}
            author={book.settings?.author}
            subject={book.subject?.name_ru}
            grade={book.grade?.label}
            language={LANGUAGE_MAP[book.language] ?? book.language}
            description={book.description}
            coverUrl={book.cover_image_url}
            status={book.status}
            rejectionReason={book.rejection_reason}
            onDelete={onDeleteBook}
          />
        )}
      </div>

      <div className="mt-4">
        <ChaptersContainer
          bookId={id as string}
          isLoading={isLoading}
          isChapterOccupied={isChapterOccupied}
          getChapterUsers={getChapterUsers}
        />
      </div>
    </main>
  );
}

