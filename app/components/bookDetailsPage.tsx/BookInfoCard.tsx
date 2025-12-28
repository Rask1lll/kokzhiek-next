"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiEdit2, FiTrash2, FiSend, FiCheck, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { BookStatus } from "@/app/types/book";
import { handleUpdateBookStatus } from "@/app/services/book/booksApi";
import { useAuth } from "@/app/hooks/useAuth";
import { isAdmin } from "@/app/libs/roles";

type BookInfoCardProps = {
  bookId: number | string;
  title: string;
  author?: string;
  subject?: string;
  grade?: string;
  publisher?: string;
  language?: string;
  description?: string;
  coverUrl?: string;
  status?: BookStatus;
  onDelete?: () => void;
  onStatusChange?: (status: BookStatus) => void;
};

const STATUS_CONFIG: Record<
  BookStatus,
  { label: string; color: string; border: string; hoverBg: string }
> = {
  draft: {
    label: "Черновик",
    color: "text-gray-700",
    border: "border-gray-300",
    hoverBg: "hover:bg-gray-100",
  },
  pending: {
    label: "На модерации",
    color: "text-yellow-600",
    border: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
  },
  published: {
    label: "Опубликовано",
    color: "text-green-600",
    border: "border-green-300",
    hoverBg: "hover:bg-green-50",
  },
  archived: {
    label: "В архиве",
    color: "text-red-600",
    border: "border-red-300",
    hoverBg: "hover:bg-red-50",
  },
};

const PLACEHOLDER_COVER = "https://placehold.co/600x400@2x.png";

export default function BookInfoCard({
  bookId,
  title,
  author,
  subject,
  grade,
  publisher,
  language,
  description,
  coverUrl,
  status = "draft",
  onDelete,
  onStatusChange,
}: BookInfoCardProps) {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<BookStatus>(status);
  const [isUpdating, setIsUpdating] = useState(false);
  const t = useTranslations("book");
  const tStatus = useTranslations("status");

  const isModerator = isAdmin(user);

  const STATUS_CONFIG: Record<
    BookStatus,
    { label: string; color: string; border: string; hoverBg: string }
  > = {
    draft: {
      label: tStatus("draft"),
      color: "text-gray-700",
      border: "border-gray-300",
      hoverBg: "hover:bg-gray-100",
    },
    pending: {
      label: tStatus("pending"),
      color: "text-yellow-600",
      border: "border-yellow-300",
      hoverBg: "hover:bg-yellow-50",
    },
    published: {
      label: tStatus("published"),
      color: "text-green-600",
      border: "border-green-300",
      hoverBg: "hover:bg-green-50",
    },
    archived: {
      label: tStatus("archived"),
      color: "text-red-600",
      border: "border-red-300",
      hoverBg: "hover:bg-red-50",
    },
  };

  const handleStatusChange = async (newStatus: BookStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    const result = await handleUpdateBookStatus(Number(bookId), newStatus);
    setIsUpdating(false);

    if (result.success) {
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
    } else {
      alert(result.message);
    }
  };

  const statusConfig = STATUS_CONFIG[currentStatus];

  return (
    <section className="rounded-2xl bg-white shadow-md border border-gray-200 p-5 md:p-6 flex gap-5 mx-10">
      <div className="relative shrink-0">
        <div className="overflow-hidden rounded-xl bg-gray-100 w-[150px] h-[200px] md:w-[180px] md:h-[240px]">
          <Image
            src={coverUrl || PLACEHOLDER_COVER}
            alt={title}
            width={200}
            height={280}
            className="h-full w-full object-cover"
            unoptimized={process.env.NODE_ENV === "development"}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            {author && (
              <p className="mt-1 text-sm text-gray-600">
                {t("author")}: {author}
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span
              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium ${statusConfig.border} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>

            {currentStatus === "draft" && (
              <button
                type="button"
                onClick={() => handleStatusChange("pending")}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50"
              >
                <FiSend className="h-4 w-4" />
                <span>{isUpdating ? "..." : t("toModeration")}</span>
              </button>
            )}

            {currentStatus === "pending" && isModerator && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("published")}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 hover:border-green-400 transition-colors disabled:opacity-50"
                >
                  <FiCheck className="h-4 w-4" />
                  <span>{isUpdating ? "..." : t("approve")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("draft")}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
                >
                  <FiX className="h-4 w-4" />
                  <span>{isUpdating ? "..." : t("reject")}</span>
                </button>
              </>
            )}

            <Link
              href={`/books/book/edit?book=${bookId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <FiEdit2 className="h-4 w-4" />
              <span>{t("edit")}</span>
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>{t("delete")}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {grade && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1">
              {t("grade")}: {grade}
            </span>
          )}
          {subject && (
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1">
              {t("subject")}: {subject}
            </span>
          )}
          {publisher && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">
              {t("publisher")}: {publisher}
            </span>
          )}
          {language && (
            <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-3 py-1">
              {t("language")}: {language}
            </span>
          )}
        </div>

        {description ? (
          <p className="mt-1 text-sm text-gray-700 leading-relaxed line-clamp-3">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
