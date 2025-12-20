"use client";

import Image from "next/image";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

type BookInfoCardProps = {
  title: string;
  author?: string;
  subject?: string;
  grade?: string;
  publisher?: string;
  language?: string;
  description?: string;
  coverUrl?: string;
  onDelete?: () => void;
};

export default function BookInfoCard({
  title,
  author,
  subject,
  grade,
  publisher,
  language,
  description,
  coverUrl = "https://placehold.co/600x400@2x.png",
  onDelete,
}: BookInfoCardProps) {
  return (
    <section className="rounded-2xl bg-white shadow-md border border-gray-200 p-5 md:p-6 flex gap-5 mx-10">
      {/* Обложка */}
      <div className="relative shrink-0">
        <div className="overflow-hidden rounded-xl bg-gray-100 w-[150px] h-[200px] md:w-[180px] md:h-[240px]">
          <Image
            src={coverUrl}
            alt={title}
            width={200}
            height={280}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Основная информация */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            {author && (
              <p className="mt-1 text-sm text-gray-600">Автор: {author}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <FiEdit2 className="h-4 w-4" />
              <span>Редактировать</span>
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Удалить</span>
              </button>
            )}
          </div>
        </div>

        {/* Метаданные */}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {grade && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1">
              Класс: {grade}
            </span>
          )}
          {subject && (
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1">
              Предмет: {subject}
            </span>
          )}
          {publisher && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">
              Издательство: {publisher}
            </span>
          )}
          {language && (
            <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-3 py-1">
              Язык: {language}
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
