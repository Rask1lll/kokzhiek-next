"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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

type SingleChoiceProps = {
  widgetId: number;
};

export default function SingleChoice({ widgetId }: SingleChoiceProps) {
  const { questions, loading, update, uploadImage, removeImage } =
    useQuestions(widgetId);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const hasCreatedQuestionRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const optionDebounceTimersRef = useRef<Map<number, NodeJS.Timeout>>(
    new Map()
  );
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [imgSize, setImgSize] = useState<number>(40);

  // Ensure questions is an array
  const questionsArray = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions]
  );

  // Initialize or update current question from questions array
  useEffect(() => {
    if (loading) return;

    // If we have questions, use the first one
    if (questionsArray.length > 0) {
      const firstQuestion = questionsArray[0];
      // Only update if the question changed (different ID or more complete data)
      if (
        !currentQuestion ||
        currentQuestion.id !== firstQuestion.id ||
        (firstQuestion.options && !currentQuestion.options) ||
        (firstQuestion.body && !currentQuestion.body)
      ) {
        // Use setTimeout to set state asynchronously
        const timer = setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (!hasCreatedQuestionRef.current && !currentQuestion) {
      hasCreatedQuestionRef.current = true;
    }
  }, [questionsArray, loading, currentQuestion]);

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

      // Update local state immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, body } : null));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce server update
      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(async () => {
        if (!questionId) return;
        const trimmedBody = body;
        if (trimmedBody.length === 0) return;

        await update(questionId, { body: trimmedBody });
      }, 500);
    },
    [currentQuestion, update]
  );

  const addOption = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const newOptions = [
      ...(currentQuestion.options || []),
      {
        body: "",
        image_url: null,
        is_correct: false,
        match_id: null,
        group: null,
        order: currentQuestion.options?.length || 0,
      },
    ];

    const updated = await update(currentQuestion.id, { options: newOptions });
    if (updated) {
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const removeOption = useCallback(
    async (optionId: number | undefined) => {
      if (!currentQuestion?.id || !optionId) return;
      if ((currentQuestion.options?.length || 0) <= 2) return;

      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.id !== optionId
      );

      const updated = await update(currentQuestion.id, { options: newOptions });
      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const moveOption = useCallback(
    async (optionId: number | undefined, direction: "up" | "down") => {
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

      const updated = await update(currentQuestion.id, { options });
      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const updateOption = useCallback(
    (optionId: number | undefined, updates: Partial<QuestionOption>) => {
      if (!currentQuestion?.id || optionId === undefined) return;

      // Update local state immediately
      const newOptionsLocal = (currentQuestion.options || []).map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      );
      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptionsLocal } : null
      );

      // If updating body, use debounce
      if (updates.body !== undefined) {
        const existingTimer = optionDebounceTimersRef.current.get(optionId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const questionId = currentQuestion.id;
        const timer = setTimeout(async () => {
          if (!questionId) {
            optionDebounceTimersRef.current.delete(optionId);
            return;
          }
          const trimmedBody = updates.body || " ";
          if (trimmedBody.length === 0) {
            optionDebounceTimersRef.current.delete(optionId);
            return;
          }

          const newOptions = (currentQuestion.options || []).map((opt) =>
            opt.id === optionId
              ? { ...opt, ...updates, body: trimmedBody }
              : opt
          );

          await update(questionId, { options: newOptions });

          optionDebounceTimersRef.current.delete(optionId);
        }, 500);

        optionDebounceTimersRef.current.set(optionId, timer);
        return;
      }

      // For other updates (like is_correct), send immediately
      const newOptions = (currentQuestion.options || []).map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      );

      // For single choice, ensure only one option is correct
      if (updates.is_correct === true) {
        newOptions.forEach((opt) => {
          if (opt.id !== optionId) {
            opt.is_correct = false;
          }
        });
      }

      // Send immediately for non-body updates
      update(currentQuestion.id, { options: newOptions }).then((updated) => {
        if (updated) {
          setCurrentQuestion(updated);
        }
      });
    },
    [currentQuestion, update]
  );

  const handleImageUpload = useCallback(
    async (optionId: number | undefined, file: File) => {
      if (optionId === undefined) return;

      const imageUrl = await uploadImage(optionId, file);
      if (imageUrl && currentQuestion) {
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: imageUrl } : opt
        );
        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
      }
    },
    [uploadImage, currentQuestion]
  );

  const handleImageDelete = useCallback(
    async (optionId: number | undefined) => {
      if (optionId === undefined) return;

      const success = await removeImage(optionId);
      if (success && currentQuestion) {
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: null } : opt
        );
        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
      }
    },
    [removeImage, currentQuestion]
  );

  // Show loading state while loading or creating question
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        Ошибка загрузки вопроса
      </div>
    );
  }

  const options = currentQuestion.options || [];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-gray-600">Вопрос к заданию</div>
        <input
          type="text"
          name="single_choice_input"
          placeholder="Вопрос к заданию"
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium flex justify-between text-slate-700">
          Варианты ответа:
          <Button
            content="Добавить +"
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
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={option.is_correct || false}
                  onChange={() => {
                    updateOption(option.id, { is_correct: !option.is_correct });
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <input
                type="text"
                value={option.body || ""}
                onChange={(e) =>
                  updateOption(option.id, { body: e.target.value })
                }
                placeholder={`Вариант ${index + 1}`}
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
                title="Добавить изображение"
              >
                <FiImage className="w-4 h-4" />
              </button>

              {/* Move up */}
              <button
                type="button"
                onClick={() => moveOption(option.id, "up")}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Переместить вверх"
              >
                <FiChevronUp className="w-4 h-4" />
              </button>

              {/* Move down */}
              <button
                type="button"
                onClick={() => moveOption(option.id, "down")}
                disabled={index === options.length - 1}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Переместить вниз"
              >
                <FiChevronDown className="w-4 h-4" />
              </button>

              {/* Remove option */}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Удалить вариант"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Image preview */}
            {option.image_url && (
              <div className="relative ml-7 mt-2">
                <div className="relative w-full max-w-xl h-70 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={option.image_url}
                    alt={option.body || "Изображение опции"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                {/* <input
                    type="range"
                    className="w-full absolute h-2 bottom-0 left-0"
                    max={100}
                    min={10}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImgSize(Number(e.target.value));
                    }}
                  /> */}
                <button
                  type="button"
                  onClick={() => {
                    if (option.id !== undefined) {
                      handleImageDelete(option.id);
                    }
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Удалить изображение"
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
