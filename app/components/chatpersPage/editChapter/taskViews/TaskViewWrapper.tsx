"use client";

import { ReactNode, useEffect, useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useActivationKeys } from "@/app/hooks/useActivationKeys";
import { useAlert } from "@/app/hooks/useAlert";
import { useTranslations } from "next-intl";
import Button from "@/app/components/Button/Button";

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
  const t = useTranslations();

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const hint = (currentQuestion?.data as { hint?: string })?.hint || "";
  const imageUrl = currentQuestion?.image_url;
  const body = currentQuestion?.body || "";
  const conditionalSign =
    currentQuestion?.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSign" in currentQuestion.data &&
    typeof currentQuestion.data.conditionalSign === "string"
      ? currentQuestion.data.conditionalSign
      : "";
  const conditionalSignMode =
    currentQuestion?.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSignMode" in currentQuestion.data &&
    typeof (currentQuestion.data as { conditionalSignMode?: string })
      .conditionalSignMode === "string"
      ? (
          currentQuestion.data as {
            conditionalSignMode?: string;
          }
        ).conditionalSignMode
      : "inline";
  const { showAlert } = useAlert();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowHint(false);
    }, 15000);
    return () => {
      clearTimeout(timeout);
    };
  }, [showHint]);

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

  const bgColor =
    currentQuestion.data &&
    "bgColor" in currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    typeof currentQuestion.data.bgColor === "string"
      ? currentQuestion.data.bgColor
      : "#ffffff";

  return (
    <div
      className="w-full p-2 relative"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Background image */}
      {imageUrl && (
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Background"
            fill
            className="object-cover opacity-50"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative mb-2 z-10 wrap-anywhere ${imageUrl ? "p-4" : ""}`}
      >
        {/* Absolute mode: знак слева, выпирает за контент */}
        {conditionalSignMode === "absolute" && conditionalSign && (
          <span className="absolute -left-8 top-0 text-2xl font-semibold text-gray-700">
            {conditionalSign}
          </span>
        )}

        {conditionalSignMode === "absolute" ? (
          // Обычный контент, знак позиционируется абсолютно
          <div>
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
                  onClick={() => {
                    showAlert(hint, "hint", 10000);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-purple-700 hover:bg-purple-200 shrink-0"
                  title="Показать подсказку"
                >
                  <FiHelpCircle className="w-4 h-4" />
                  <span>Подсказка</span>
                </button>
              )}
            </div>

            {/* Task content */}
            {children}
          </div>
        ) : (
          // Inline mode: знак стоит в одной строке с контентом
          <div className="flex items-start gap-2">
            {conditionalSign && (
              <span className="text-2xl font-semibold text-gray-700 flex-shrink-0">
                {conditionalSign}
              </span>
            )}
            <div className="flex-1">
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
                    onClick={() => {
                      showAlert(hint, "hint", 10000);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-purple-700 hover:bg-purple-200 shrink-0"
                    title="Показать подсказку"
                  >
                    <FiHelpCircle className="w-4 h-4" />
                    <span>Подсказка</span>
                  </button>
                )}
              </div>

              {/* Task content */}
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
