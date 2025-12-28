"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";
import { getChapterState } from "@/app/services/constructor/constructorApi";
import { Book } from "@/app/types/book";
import { Chapter } from "@/app/types/chapter";
import { Block } from "@/app/types/block";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";

type ChapterWithBlocks = {
  chapter: Chapter;
  blocks: Block[];
};

export default function BookPrintClient() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const t = useTranslations("book");

  const [book, setBook] = useState<Book | null>(null);
  const [chaptersData, setChaptersData] = useState<ChapterWithBlocks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    async function fetchBookAndChapters() {
      setIsLoading(true);
      setError(null);

      try {
        const bookResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${bookId}`,
          {
            headers: getAuthHeaders(),
            method: "GET",
          }
        );
        const bookRes = await bookResponse.json();

        if (!bookRes.data) {
          setError(t("notFound"));
          return;
        }

        const bookData: Book = bookRes.data;
        setBook(bookData);

        const chapters: Chapter[] = bookData.chapters ?? [];
        const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

        const chaptersWithBlocks: ChapterWithBlocks[] = [];

        for (const chapter of sortedChapters) {
          try {
            const chapterState = await getChapterState(
              bookId,
              String(chapter.id)
            );
            if (chapterState.success) {
              chaptersWithBlocks.push({
                chapter,
                blocks: chapterState.data.blocks,
              });
            }
          } catch (err) {
            console.error(`Error fetching chapter ${chapter.id}:`, err);
            chaptersWithBlocks.push({
              chapter,
              blocks: [],
            });
          }
        }

        setChaptersData(chaptersWithBlocks);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookAndChapters();
  }, [bookId, t]);

  const handlePrint = () => {
    window.print();
  };

  if (!bookId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t("noBookId")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        <p className="text-gray-600">{t("loadingBook")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-14 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm print:hidden">
        <div className="mx-auto h-full w-5/6 flex items-center justify-between">
          <Link
            href={`/books/book?book=${bookId}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            <BiArrowBack className="text-lg" />
            <span>{t("back")}</span>
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FiDownload className="text-base" />
            <span>{t("downloadPdf")}</span>
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-20 pb-10 print:pt-0 print:pb-0">
        <div className="w-5/6 mx-auto print:w-full">
          <div className="mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
              {book?.title}
            </h1>
            {book?.settings?.author && (
              <p className="mt-2 text-gray-600">{book.settings.author}</p>
            )}
          </div>

          {chaptersData.map(({ chapter, blocks }, chapterIndex) => (
            <div
              key={chapter.id}
              className="mb-12 print:break-before-page print:first:break-before-avoid"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {chapterIndex + 1}. {chapter.title}
              </h2>

              <div className="space-y-1">
                {blocks.map((block) => (
                  <div key={block.id} className="bg-white rounded-lg p-1">
                    <Layout block={block} />
                  </div>
                ))}
              </div>

              {blocks.length === 0 && (
                <p className="text-gray-400 italic py-4">{t("emptyChapter")}</p>
              )}
            </div>
          ))}

          {chaptersData.length === 0 && (
            <p className="text-gray-500 text-center py-10">
              {t("noChapters")}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
