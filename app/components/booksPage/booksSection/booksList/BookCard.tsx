"use client";

import Image from "next/image";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { useTranslations } from "next-intl";
import { ViewMode } from "../filters/BooksViewModeToggle";
import { BookStatus } from "@/app/types/book";

type BookCardProps = {
  bookId: number;
  name: string;
  status?: BookStatus;
  grade?: string;
  coverImageUrl?: string;
  onDelete: (bookId: number, bookTitle: string) => void;
  viewMode?: ViewMode;
};

export default function BookCard({ bookId, name, status = "draft", grade, coverImageUrl, onDelete, viewMode = "grid" }: BookCardProps) {
  const t = useTranslations("status");

  const STATUS_CONFIG: Record<BookStatus, { label: string; bg: string; color: string }> = {
    draft: { label: t("draft"), bg: "bg-gray-100", color: "text-gray-600" },
    pending: { label: t("pending"), bg: "bg-yellow-100", color: "text-yellow-700" },
    published: { label: t("published"), bg: "bg-green-100", color: "text-green-700" },
    archived: { label: t("archived"), bg: "bg-red-100", color: "text-red-700" },
  };

  const statusConfig = STATUS_CONFIG[status];
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(bookId, name);
  };

  if (viewMode === "list") {
    return (
      <div className="relative group w-full">
        <Link
          href={`/books/book?book=${bookId}`}
          className="block bg-white rounded-xl shadow-md hover:shadow-lg transform transition-all overflow-hidden cursor-pointer w-full"
        >
          <div className="flex items-center gap-4 p-4 w-full">
            <div className="relative w-20 h-28 shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={name}
                  width={80}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  {name.slice(0, 20)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1">
                  {name}
                </h3>
                <div className="flex items-center justify-between pr-12">
                  {grade && <span className="text-xs text-gray-500">{grade}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-600 cursor-pointer z-10"
        >
          <MdDelete className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="hover:scale-102 duration-100 cursor-pointer">
        <Link
          href={`/books/book?book=${bookId}`}
          className="block bg-white rounded-xl shadow-lg hover:shadow-xl transform transition-all overflow-hidden cursor-pointer"
        >
          <div className="h-80 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={name}
                width={400}
                height={600}
                className="w-full h-full object-cover"
                unoptimized={process.env.NODE_ENV === "development"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg text-center p-4">
                {name}
              </div>
            )}
          </div>

          <div className="p-4 h-24 relative">
            <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
              {name}
            </h3>

            <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {grade && <span className="text-xs text-gray-500">{grade}</span>}
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-600 cursor-pointer"
        >
          <MdDelete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
