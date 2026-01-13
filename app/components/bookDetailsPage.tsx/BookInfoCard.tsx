"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiSend,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiDownload,
  FiClock,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { BookStatus } from "@/app/types/book";
import {
  handleUpdateBookStatus,
  UpdateBookStatusPayload,
} from "@/app/services/book/booksApi";
import { useAuth } from "@/app/hooks/useAuth";
import { isModerator, isAuthor } from "@/app/libs/roles";

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
  rejectionReason?: string | null;
  onDelete?: () => void;
  onStatusChange?: (status: BookStatus) => void;
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
  rejectionReason,
  onDelete,
  onStatusChange,
}: BookInfoCardProps) {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<BookStatus>(status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const t = useTranslations("book");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");

  const canModerate = isModerator(user);
  const canEdit = isAuthor(user);

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

  const handleStatusChange = async (newStatus: BookStatus, reason?: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    const payload: UpdateBookStatusPayload = { status: newStatus };
    if (reason) {
      payload.reason = reason;
    }

    setIsUpdating(true);
    const result = await handleUpdateBookStatus(Number(bookId), payload);
    setIsUpdating(false);

    if (result.success) {
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      setShowRejectModal(false);
      setRejectReason("");
    } else {
      alert(result.message);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      return;
    }
    handleStatusChange("draft", rejectReason.trim());
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
  };

  const statusConfig = STATUS_CONFIG[currentStatus];

  return (
    <section className="rounded-2xl h-full bg-white shadow-md border border-gray-200 p-5 md:p-6 md:flex not-md:justify-center gap-5 mx-10">
      <div className=" relative flex justify-center shrink-0">
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

      <div className="h-full flex flex-1 flex-col gap-3">
        <div className="sm:flex-row flex flex-col gap-2 items-start justify-between">
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

            {currentStatus === "draft" && canEdit && (
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

            {currentStatus === "pending" && canModerate && (
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
                  onClick={handleRejectClick}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
                >
                  <FiX className="h-4 w-4" />
                  <span>{isUpdating ? "..." : t("reject")}</span>
                </button>
              </>
            )}

            {canEdit && (
              <Link
                href={`/books/book/edit?book=${bookId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
              >
                <FiEdit2 className="h-4 w-4" />
                <span>{t("edit")}</span>
              </Link>
            )}
            {canEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>{t("delete")}</span>
              </button>
            )}

            {/* TODO: refactor IT!!!! */}
            <Link
              href={`/books/book/print?book=${bookId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
            >
              <FiDownload className="h-4 w-4" />
              <span>{t("downloadPdf")}</span>
            </Link>
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

        {rejectionReason && currentStatus === "draft" && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {t("rejectionReasonLabel")}
                </p>
                <p className="text-sm text-red-600 mt-1">{rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-auto flex justify-end">
          {canEdit && (
            <Link
              href={`/books/book/history?book=${bookId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors"
            >
              <FiClock className="h-4 w-4" />
              <span>{t("history")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleRejectCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={handleRejectCancel}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("rejectTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("rejectDescription")}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("rejectReason")} *
              </label>
              <textarea
                spellCheck={false}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("rejectReasonPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectCancel}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || isUpdating}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  tCommon("loading")
                ) : (
                  <>
                    <FiX className="w-4 h-4" />
                    {t("reject")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
