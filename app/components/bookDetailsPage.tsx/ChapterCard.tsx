"use client";

import Link from "next/link";
import { FiChevronRight, FiTrash2, FiEdit2, FiLock } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import EditChapterModal from "./EditChapterModal";
import { useAuth } from "@/app/hooks/useAuth";
import { isAuthor } from "@/app/libs/roles";
import { PresenceUser } from "@/app/hooks/useChapterPresence";

type ChapterCardProps = {
  chapterId: string;
  title: string;
  bookid: string;
  onDelete?: (chapterId: string) => Promise<void>;
  isOccupied?: boolean;
  occupiedBy?: PresenceUser[];
};

export default function ChapterCard({
  chapterId,
  title,
  bookid,
  onDelete,
  isOccupied = false,
  occupiedBy = [],
}: ChapterCardProps) {
  const t = useTranslations("chapters");
  const { addContent } = useModalWindowStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const canEdit = useMemo(() => {
    return isAuthor(user);
  }, [user]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addContent(<EditChapterModal chapterId={chapterId} currentTitle={title} />);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onDelete) return;

    if (!confirm(t("deleteConfirm", { title }))) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(chapterId);
    } catch (err) {
      console.error("Error deleting chapter:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Получаем имя пользователя, занимающего главу
  const occupiedByName = occupiedBy[0]?.name || t("someone");

  // Если глава занята, рендерим div вместо Link
  if (isOccupied) {
    return (
      <div className="relative group">
        <div
          className="flex w-full items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left shadow-sm cursor-not-allowed opacity-75"
          title={t("occupiedBy", { name: occupiedByName })}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
              <FiLock />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {title}
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                {t("occupiedBy", { name: occupiedByName })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {occupiedBy.slice(0, 3).map((u) => (
              <div
                key={u.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 text-xs font-semibold text-orange-800"
                title={u.name}
              >
                {(u.name?.[0] || "?").toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={
          canEdit
            ? `/books/book/chapter?chapter=${chapterId}&book=${bookid}&edit=1`
            : `/books/book/chapter?chapter=${chapterId}&book=${bookid}`
        }
        className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50/60 ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            <MdMenuBook />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {title}
            </p>
          </div>
        </div>

        <FiChevronRight className="h-4 w-4 text-gray-400" />
      </Link>

      {/* Edit button */}
      {canEdit && (
        <button
          onClick={handleEdit}
          className="absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500"
          title={t("edit")}
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
      )}

      {/* Delete button */}
      {canEdit && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
          title={t("delete")}
        >
          {canEdit && isDeleting ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <FiTrash2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
