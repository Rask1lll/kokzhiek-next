"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BiArrowBack } from "react-icons/bi";
import {
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { canEditBook } from "@/app/libs/permissions";
import { handleGetBook } from "@/app/services/book/booksApi";
import { useBlocksStore } from "@/app/store/blocksStore";

export default function ChapterHeader() {
  const t = useTranslations("chapterHeader");
  const param = useSearchParams();
  const path = usePathname();
  const bookId = param.get("book");
  const chapter = param.get("chapter");
  const isEdit = param.get("edit");
  const { user } = useAuth();
  const { prevChapter, nextChapter } = useBlocksStore();
  const [bookCreatedBy, setBookCreatedBy] = useState<number | null>(null);
  const [collaboratorIds, setCollaboratorIds] = useState<number[]>([]);

  // Загружаем данные книги для проверки прав
  useEffect(() => {
    if (!bookId) return;

    async function fetchBookOwner() {
      try {
        const res = await handleGetBook(Number(bookId));
        if (res?.data) {
          if (res.data.created_by) setBookCreatedBy(res.data.created_by);
          if (res.data.collaborators) {
            setCollaboratorIds(res.data.collaborators.map((c) => c.id));
          }
        }
      } catch (error) {
        console.error("Error fetching book owner:", error);
      }
    }

    fetchBookOwner();
  }, [bookId]);

  const canEdit = canEditBook(
    user,
    bookCreatedBy ?? undefined,
    collaboratorIds,
  );

  const handleSaveAsPdf = () => {
    const header = document.querySelector("header");
    if (header) {
      header.style.display = "none";
    }
    window.print();
    if (header) {
      header.style.display = "";
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-14 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="mx-auto h-full w-5/6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/books/book?book=${bookId}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            <BiArrowBack className="text-lg" />
            <span>{t("back")}</span>
          </Link>

          <div className="flex items-center gap-1">
            {prevChapter ? (
              <Link
                href={`${path}?chapter=${prevChapter.id}&book=${bookId}${isEdit ? "&edit=1" : ""}`}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition text-sm"
                title={prevChapter.title}
              >
                <FiChevronLeft className="text-base" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {prevChapter.title}
                </span>
              </Link>
            ) : (
              <span className="flex items-center px-2 py-1.5 text-gray-300 text-sm cursor-default">
                <FiChevronLeft className="text-base" />
              </span>
            )}
            {nextChapter ? (
              <Link
                href={`${path}?chapter=${nextChapter.id}&book=${bookId}${isEdit ? "&edit=1" : ""}`}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition text-sm"
                title={nextChapter.title}
              >
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {nextChapter.title}
                </span>
                <FiChevronRight className="text-base" />
              </Link>
            ) : (
              <span className="flex items-center px-2 py-1.5 text-gray-300 text-sm cursor-default">
                <FiChevronRight className="text-base" />
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEdit && (
            <button
              onClick={handleSaveAsPdf}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition text-sm"
            >
              <FiDownload className="text-base" />
              <span>{t("saveAsPdf")}</span>
            </button>
          )}

          {canEdit && (
            <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm shadow-sm">
              <Link
                href={`${path}?chapter=${chapter}&book=${bookId}&edit=1`}
                title={t("editing")}
                aria-label={t("editing")}
                className={`flex items-center justify-center rounded-md p-2.5 transition-colors ${
                  isEdit
                    ? "bg-blue-500 text-white shadow"
                    : // ? "bg-sky-600 text-white shadow"
                      "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <FiEdit2 className="w-4 h-4" />
              </Link>
              <Link
                href={`${path}?chapter=${chapter}&book=${bookId}`}
                title={t("preview")}
                aria-label={t("preview")}
                className={`flex items-center justify-center rounded-md p-2.5 transition-colors ${
                  !isEdit
                    ? "bg-sky-600 text-white shadow"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <FiEye className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
