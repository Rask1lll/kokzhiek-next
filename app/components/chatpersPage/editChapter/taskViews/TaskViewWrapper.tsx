"use client";

import { ReactNode, useState } from "react";
import { FiHelpCircle, FiX } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";

type TaskViewWrapperProps = {
  widgetId: number;
  children: ReactNode;
  showQuestionBody?: boolean; // Whether to show question body in wrapper or let child handle it
};

export default function TaskViewWrapper({
  widgetId,
  children,
  showQuestionBody = true,
}: TaskViewWrapperProps) {
  const { questions, loading, error } = useQuestions(widgetId);
  const [showHint, setShowHint] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const hint = (currentQuestion?.data as { hint?: string })?.hint || "";
  const imageUrl = currentQuestion?.image_url;
  const body = currentQuestion?.body || "";

  if (loading) {
    return <p className="text-gray-400">Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Ошибка загрузки: {error}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">Вопрос не найден</p>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[200px]">
      {/* Background image */}
      {imageUrl && (
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Background"
            fill
            className="object-cover opacity-20"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${imageUrl ? "p-4" : ""}`}>
        {/* Header with question body and hint button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {showQuestionBody && body && (
            <div className="flex-1">
              <div className="text-lg font-medium text-gray-800">
                {body}
              </div>
            </div>
          )}
          {hint && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200 shrink-0"
              title="Показать подсказку"
            >
              <FiHelpCircle className="w-4 h-4" />
              <span>Подсказка</span>
            </button>
          )}
        </div>

        {/* Hint modal */}
        {showHint && hint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                title="Закрыть"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <FiHelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Подсказка
                </h3>
              </div>
              <p className="text-gray-700">{hint}</p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHint(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task content */}
        {children}
      </div>
    </div>
  );
}

