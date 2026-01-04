"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FiClock, FiUser, FiGitBranch } from "react-icons/fi";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import RollbackModal, { type HistoryVersion } from "./RollbackModal";

export function BookHistorySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookHistoryClient() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const { addContent } = useModalWindowStore();
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;

    setTimeout(() => {
      setVersions([
        {
          id: "1",
          date: "2024-01-15T14:30:00Z",
          author: "Иванов Иван",
          authorEmail: "ivan@example.com",
          changes: ["Обновлен заголовок", "Добавлена новая глава"],
          version: "v1.2.0",
          branch: "main",
        },
        {
          id: "2",
          date: "2024-01-10T10:15:00Z",
          author: "Петров Петр",
          authorEmail: "petr@example.com",
          changes: ["Исправлены ошибки", "Обновлено описание"],
          version: "v1.1.0",
          branch: "main",
        },
        {
          id: "3",
          date: "2024-01-05T09:00:00Z",
          author: "Сидоров Сидор",
          authorEmail: "sidor@example.com",
          changes: ["Создана книга", "Добавлена обложка"],
          version: "v1.0.0",
          branch: "main",
        },
        {
          id: "4",
          date: "2024-01-03T16:45:00Z",
          author: "Иванов Иван",
          authorEmail: "ivan@example.com",
          changes: ["Начальная версия"],
          version: "v0.1.0",
          branch: "development",
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, [bookId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVersionClick = (version: HistoryVersion) => {
    addContent(<RollbackModal version={version} bookId={bookId || ""} />);
  };

  if (isLoading) {
    return <BookHistorySkeleton />;
  }

  if (!bookId) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <p className="text-gray-500 text-center">Не указан ID книги</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiClock className="w-6 h-6 text-purple-600" />
            История изменений
          </h1>

          <div className="relative">
            {/* Вертикальная линия */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="relative pl-14 cursor-pointer group"
                  onClick={() => handleVersionClick(version)}
                >
                  {/* Точка на линии */}
                  {/* <div className="absolute left-4 top-2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-md group-hover:bg-purple-600 transition-colors" /> */}

                  {/* Карточка версии */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FiUser className="w-4 h-4" />
                          <span className="font-medium">{version.author}</span>
                          {version.authorEmail && (
                            <span className="text-gray-400">
                              ({version.authorEmail})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiClock className="w-4 h-4" />
                          <span>{formatDate(version.date)}</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          Текущая
                        </span>
                      )}
                    </div>

                    {/* Кнопка отката (показываем только если не текущая версия) */}
                    {index > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVersionClick(version);
                          }}
                        >
                          Откатить до этой версии →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
