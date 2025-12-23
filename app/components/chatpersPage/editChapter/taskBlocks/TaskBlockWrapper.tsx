"use client";

import { ReactNode, useCallback, useRef, useState, useEffect } from "react";
import { FiImage, FiTrash2, FiHelpCircle } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";

type TaskBlockWrapperProps = {
  widgetId: number;
  children: ReactNode;
};

export default function TaskBlockWrapper({
  widgetId,
  children,
}: TaskBlockWrapperProps) {
  const {
    questions,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
  } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );
  const [showHintInput, setShowHintInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hintDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update currentQuestion when questions change
  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setCurrentQuestion(firstQuestion);
      } else if (
        currentQuestion.image_url !== firstQuestion.image_url ||
        JSON.stringify(currentQuestion.data) !==
          JSON.stringify(firstQuestion.data)
      ) {
        // Sync image_url and data changes from hook
        setCurrentQuestion(firstQuestion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!currentQuestion?.id) return;

      const imageUrl = await uploadQuestionImage(currentQuestion.id, file);
      if (imageUrl) {
        // Update currentQuestion with image URL from server
        setCurrentQuestion((prev) =>
          prev ? { ...prev, image_url: imageUrl } : null
        );
      }
    },
    [currentQuestion, uploadQuestionImage]
  );

  const handleImageDelete = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const success = await removeQuestionImage(currentQuestion.id);
    if (success) {
      // Update currentQuestion - remove image_url
      setCurrentQuestion((prev) =>
        prev ? { ...prev, image_url: null } : null
      );
    }
  }, [currentQuestion, removeQuestionImage]);

  const updateHint = useCallback(
    (hint: string) => {
      if (!currentQuestion?.id) return;

      const trimmedHint = hint.trim();
      const newData = {
        ...currentQuestion.data,
        hint: trimmedHint || undefined,
      };

      // Remove hint from data if empty
      if (!trimmedHint) {
        delete newData.hint;
      }

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

      // Debounce server update
      if (hintDebounceTimerRef.current) {
        clearTimeout(hintDebounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      hintDebounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;

        update(questionId, {
          data: newData,
        });
      }, 500);
    },
    [currentQuestion, update]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hintDebounceTimerRef.current) {
        clearTimeout(hintDebounceTimerRef.current);
      }
    };
  }, []);

  if (loading || !currentQuestion) {
    return <>{children}</>;
  }

  const hint = (currentQuestion.data as { hint?: string })?.hint || "";

  return (
    <div className="w-full ">
      {/* Background image and hint controls */}
      <div className="flex w-fit mb-2 items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        {/* Background image upload */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
              if (e.target) {
                e.target.value = "";
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentQuestion.image_url
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Загрузить фоновое изображение"
          >
            <FiImage className="w-4 h-4" />
            <span>Фон</span>
          </button>
          {currentQuestion.image_url && (
            <div className="relative">
              <div className="relative w-12 h-12 border border-slate-300 rounded-lg overflow-hidden">
                <Image
                  src={currentQuestion.image_url}
                  alt="Background"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleImageDelete}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Удалить изображение"
              >
                <FiTrash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Hint input */}
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            onClick={() => setShowHintInput(!showHintInput)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              hint
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Добавить подсказку"
          >
            <FiHelpCircle className="w-4 h-4" />
            <span>Подсказка</span>
          </button>
          {showHintInput && (
            <input
              type="text"
              value={hint}
              onChange={(e) => updateHint(e.target.value)}
              placeholder="Введите подсказку..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onBlur={() => {
                if (!hint.trim()) {
                  setShowHintInput(false);
                }
              }}
              autoFocus
            />
          )}
          {!showHintInput && hint && (
            <div className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
              {hint}
            </div>
          )}
        </div>
      </div>

      {/* Task content */}
      {children}
    </div>
  );
}
