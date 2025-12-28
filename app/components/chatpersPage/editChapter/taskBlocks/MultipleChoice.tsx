"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiImage,
  FiTrash2,
} from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";
import { useTranslations } from "next-intl";

type MultipleChoiceProps = {
  widgetId: number;
};

export default function MultipleChoice({ widgetId }: MultipleChoiceProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update, uploadImage, removeImage } =
    useQuestions(widgetId);

  // Get first question from array
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      // Only update if question ID changed
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const optionDebounceTimersRef = useRef<Map<number, NodeJS.Timeout>>(
    new Map()
  );
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const optionTimers = optionDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      optionTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      optionTimers.clear();
    };
  }, []);

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, body } : prev));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce server update
      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;
        const trimmedBody = body.trim();
        if (trimmedBody.length === 0) return;

        update(questionId, { body: trimmedBody });
      }, 500);
    },
    [currentQuestion, update]
  );

  const addOption = useCallback(async () => {
    if (!currentQuestion?.id) return;
    const newOptions = [
      ...(currentQuestion.options || []),
      {
        body: "Новый вариант",
        image_url: null,
        is_correct: false,
        match_id: null,
        group: null,
        order: currentQuestion.options?.length || 0,
      },
    ];

    // Send to server and wait for response to get IDs
    const updated = await update(currentQuestion.id, { options: newOptions });
    console.log(updated);
    if (updated) {
      // Update UI with data from server (includes IDs for new options)
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const removeOption = useCallback(
    (optionId: number | undefined) => {
      if (!currentQuestion?.id || !optionId) return;
      if ((currentQuestion.options?.length || 0) <= 2) return;

      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.id !== optionId
      );

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptions } : null
      );

      // Send to server
      update(currentQuestion.id, { options: newOptions });
    },
    [currentQuestion, update]
  );

  const moveOption = useCallback(
    (optionId: number | undefined, direction: "up" | "down") => {
      if (!currentQuestion?.id || !optionId) return;

      const options = [...(currentQuestion.options || [])];
      const index = options.findIndex((opt) => opt.id === optionId);

      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === options.length - 1)
      ) {
        return;
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [options[index], options[swapIndex]] = [
        options[swapIndex],
        options[index],
      ];

      // Update order
      options.forEach((opt, idx) => {
        opt.order = idx;
      });

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

      // Send to server
      update(currentQuestion.id, { options });
    },
    [currentQuestion, update]
  );

  const updateOption = (
    optionId: number | undefined,
    updates: Partial<QuestionOption>
  ) => {
    if (!currentQuestion?.id || optionId === undefined) return;

    // Update UI immediately
    const newOptions = (currentQuestion.options || []).map((opt) =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    setCurrentQuestion((prev) =>
      prev ? { ...prev, options: newOptions } : prev
    );

    // If updating body, use debounce for server update
    if (updates.body !== undefined) {
      const existingTimer = optionDebounceTimersRef.current.get(optionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const trimmedBody = updates.body?.trim() || "";
      const timer = setTimeout(() => {
        if (!questionId) {
          optionDebounceTimersRef.current.delete(optionId);
          return;
        }
        if (trimmedBody.length === 0) {
          optionDebounceTimersRef.current.delete(optionId);
          return;
        }

        // Use the newOptions we already created for UI, just update the body
        const serverOptions = newOptions.map((opt) =>
          opt.id === optionId ? { ...opt, body: trimmedBody } : opt
        );

        update(questionId, { options: serverOptions });
        optionDebounceTimersRef.current.delete(optionId);
      }, 500);

      optionDebounceTimersRef.current.set(optionId, timer);
      return;
    }

    // For other updates (like is_correct), send immediately
    // For multiple choice, allow multiple correct answers (no need to uncheck others)
    update(currentQuestion.id, { options: newOptions });
  };
  const handleImageUpload = useCallback(
    async (optionId: number | undefined, file: File) => {
      if (optionId === undefined || !currentQuestion?.id) return;

      const imageUrl = await uploadImage(optionId, file);
      if (imageUrl) {
        // Update currentQuestion with image URL from server
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: imageUrl } : opt
        );
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: updatedOptions } : prev
        );
      }
    },
    [uploadImage, currentQuestion]
  );

  const handleImageDelete = useCallback(
    async (optionId: number | undefined) => {
      if (optionId === undefined || !currentQuestion?.id) return;

      const success = await removeImage(optionId);
      if (success) {
        // Update currentQuestion - remove image_url
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: null } : opt
        );
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: updatedOptions } : prev
        );
      }
    },
    [removeImage, currentQuestion]
  );

  // Show loading state while loading or creating question
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        {t("loadError")}
      </div>
    );
  }

  const options = currentQuestion.options || [];

  return (
    <div className="w-full space-y-4">
      {/* Settings bar */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-gray-600">{t("questionLabel")}</div>
        <input
          type="text"
          placeholder={t("questionPlaceholder")}
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Options list */}
      <div className="space-y-2">
        <span className="text-sm font-medium flex justify-between text-slate-700">
          {t("answerOptions")}
          <Button
            content={t("addOption")}
            color="green"
            onClick={addOption}
          ></Button>
        </span>

        {options.map((option, index) => (
          <div
            key={option.id || index}
            className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {/* Correct checkbox */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={option.is_correct || false}
                  onChange={(e) =>
                    updateOption(option.id, { is_correct: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* Text input */}
              <input
                type="text"
                value={option.body || ""}
                onChange={(e) =>
                  updateOption(option.id, { body: e.target.value })
                }
                placeholder={t("optionPlaceholder", { number: index + 1 })}
                className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Image upload button */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  if (el && option.id) {
                    fileInputRefs.current.set(option.id, el);
                  }
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && option.id !== undefined) {
                    handleImageUpload(option.id, file);
                  }
                  if (e.target) {
                    e.target.value = "";
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  const input = option.id
                    ? fileInputRefs.current.get(option.id)
                    : null;
                  input?.click();
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
                title={t("addImage")}
              >
                <FiImage className="w-4 h-4" />
              </button>

              {/* Move up */}
              <button
                type="button"
                onClick={() => moveOption(option.id, "up")}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={t("moveUp")}
              >
                <FiChevronUp className="w-4 h-4" />
              </button>

              {/* Move down */}
              <button
                type="button"
                onClick={() => moveOption(option.id, "down")}
                disabled={index === options.length - 1}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={t("moveDown")}
              >
                <FiChevronDown className="w-4 h-4" />
              </button>

              {/* Remove option */}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={t("removeOption")}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Image preview */}
            {option.image_url && (
              <div className="relative ml-7 mt-2">
                <div className="relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden">
                  <Image
                    src={option.image_url}
                    alt={option.body || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (option.id !== undefined) {
                      handleImageDelete(option.id);
                    }
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title={t("removeImage")}
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
