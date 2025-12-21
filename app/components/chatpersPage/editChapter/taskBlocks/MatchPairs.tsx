"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FiX, FiImage, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";
import { TaskType } from "@/app/types/enums";

type MatchPairsProps = {
  widgetId: number;
};

type PairView = {
  pairId: string;
  leftOption: QuestionOption | null;
  rightOption: QuestionOption | null;
};

// Generate unique pair ID
function generatePairId(): string {
  return `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function MatchPairs({ widgetId }: MatchPairsProps) {
  const { questions, loading, create, update, uploadImage, removeImage } =
    useQuestions(widgetId);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasCreatedQuestionRef = useRef(false);
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Ensure questions is an array
  const questionsArray = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions]
  );

  // Initialize or update current question from questions array
  useEffect(() => {
    if (questionsArray.length > 0) {
      const firstQuestion = questionsArray[0];
      if (
        !currentQuestion ||
        currentQuestion.id !== firstQuestion.id ||
        (firstQuestion.options && !currentQuestion.options)
      ) {
        const timer = setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }

    // If no questions and haven't created one yet, create it
    if (
      !loading &&
      !hasCreatedQuestionRef.current &&
      !currentQuestion &&
      !isCreating
    ) {
      hasCreatedQuestionRef.current = true;
      setTimeout(() => {
        setIsCreating(true);
        create({
          type: TaskType.MATCH_PAIRS,
          body: "Соедините пары",
          data: { shuffle: true },
          points: 1,
          options: [],
        }).then((newQuestion) => {
          setIsCreating(false);
          if (newQuestion) {
            setCurrentQuestion(newQuestion);
          }
        });
      }, 0);
    }
  }, [questionsArray, loading, currentQuestion, create, isCreating]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Convert flat options to pairs view
  const pairs = useMemo<PairView[]>(() => {
    const options = currentQuestion?.options;
    if (!options || options.length === 0) return [];

    // Sort by position
    const sortedOptions = [...options].sort(
      (a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0)
    );

    // Check if options have group field set
    const hasGroups = sortedOptions.some(
      (opt) => opt.group === "left" || opt.group === "right"
    );

    if (hasGroups) {
      // Use group and match_id for pairing
      const leftOptions = sortedOptions.filter((opt) => opt.group === "left");
      const rightOptions = sortedOptions.filter((opt) => opt.group === "right");

      const matchIds = new Set<string>();
      leftOptions.forEach((opt) => {
        if (opt.match_id) matchIds.add(opt.match_id);
      });

      if (matchIds.size > 0) {
        return Array.from(matchIds).map((matchId) => ({
          pairId: matchId,
          leftOption:
            leftOptions.find((opt) => opt.match_id === matchId) || null,
          rightOption:
            rightOptions.find((opt) => opt.match_id === matchId) || null,
        }));
      }
    }

    // Fallback: pair by position (even = left, odd = right)
    const result: PairView[] = [];
    for (let i = 0; i < sortedOptions.length; i += 2) {
      const leftOption = sortedOptions[i] || null;
      const rightOption = sortedOptions[i + 1] || null;
      result.push({
        pairId: `position_${i}`,
        leftOption,
        rightOption,
      });
    }
    return result;
  }, [currentQuestion]);

  const shuffleEnabled = useMemo(() => {
    return (currentQuestion?.data as { shuffle?: boolean })?.shuffle ?? true;
  }, [currentQuestion]);

  const toggleShuffle = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const newData = {
      ...((currentQuestion.data as object) || {}),
      shuffle: !shuffleEnabled,
    };

    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    const updated = await update(currentQuestion.id, { data: newData });
    if (updated) {
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, shuffleEnabled, update]);

  const addPair = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const pairId = generatePairId();
    const currentOptions = currentQuestion.options || [];
    const maxOrder = Math.max(0, ...currentOptions.map((o) => o.order || 0));
    const pairNumber = Math.floor(currentOptions.length / 2) + 1;

    const newOptions = [
      ...currentOptions,
      {
        body: `Вариант ${pairNumber}`,
        image_url: null,
        is_correct: false,
        match_id: pairId,
        group: "left",
        order: maxOrder + 1,
      },
      {
        body: `Ячейка ${pairNumber}`,
        image_url: null,
        is_correct: false,
        match_id: pairId,
        group: "right",
        order: maxOrder + 1,
      },
    ];

    const updated = await update(currentQuestion.id, { options: newOptions });
    if (updated) {
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const removePair = useCallback(
    async (pairId: string, leftOptionId?: number, rightOptionId?: number) => {
      if (!currentQuestion?.id) return;

      let newOptions: typeof currentQuestion.options;

      // If pairId starts with "position_", remove by option IDs
      if (pairId.startsWith("position_")) {
        const idsToRemove = new Set<number>();
        if (leftOptionId !== undefined) idsToRemove.add(leftOptionId);
        if (rightOptionId !== undefined) idsToRemove.add(rightOptionId);

        newOptions = (currentQuestion.options || []).filter(
          (opt) => opt.id === undefined || !idsToRemove.has(opt.id)
        );
      } else {
        // Remove by match_id
        newOptions = (currentQuestion.options || []).filter(
          (opt) => opt.match_id !== pairId
        );
      }

      const updated = await update(currentQuestion.id, { options: newOptions });
      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const updateOptionText = useCallback(
    (optionId: number | undefined, text: string) => {
      if (!currentQuestion?.id || optionId === undefined) return;

      // Update local state immediately
      const newOptionsLocal = (currentQuestion.options || []).map((opt) =>
        opt.id === optionId ? { ...opt, body: text } : opt
      );
      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptionsLocal } : null
      );

      // Debounce server update
      const timerKey = `option_${optionId}`;
      const existingTimer = debounceTimersRef.current.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const timer = setTimeout(async () => {
        if (!questionId) {
          debounceTimersRef.current.delete(timerKey);
          return;
        }

        // Don't send empty body to server
        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
          debounceTimersRef.current.delete(timerKey);
          return;
        }

        const newOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, body: trimmedText } : opt
        );

        const updated = await update(questionId, { options: newOptions });
        if (updated) {
          setCurrentQuestion(updated);
        }
        debounceTimersRef.current.delete(timerKey);
      }, 500);

      debounceTimersRef.current.set(timerKey, timer);
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

  console.log(pairs);
  // Show loading state
  if (loading || isCreating) {
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

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={shuffleEnabled}
            onChange={toggleShuffle}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600">
            Перемешивать варианты ответа при каждом решении
          </span>
        </label>
      </div>

      {/* Pairs list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Пары (вариант ответа → ячейка):
          </span>
          <div className="flex gap-2">
            <Button
              content="+ Добавить пару"
              color="green"
              size="sm"
              onClick={addPair}
            />
          </div>
        </div>

        {pairs.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            Нет пар. Нажмите «Добавить пару» чтобы создать.
          </div>
        )}

        {pairs.map((pair, index) => (
          <div
            key={pair.pairId}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">
                Пара #{index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    removePair(
                      pair.pairId,
                      pair.leftOption?.id,
                      pair.rightOption?.id
                    )
                  }
                  className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Удалить пару"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left side (answer) */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Вариант ответа:
                  </span>
                  <input
                    type="text"
                    value={pair.leftOption?.body || ""}
                    onChange={(e) =>
                      updateOptionText(pair.leftOption?.id, e.target.value)
                    }
                    placeholder="Введите вариант ответа..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                {/* Image upload for left */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      if (el && pair.leftOption?.id) {
                        fileInputRefs.current.set(pair.leftOption.id, el);
                      }
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && pair.leftOption?.id !== undefined) {
                        handleImageUpload(pair.leftOption.id, file);
                      }
                      if (e.target) e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = pair.leftOption?.id
                        ? fileInputRefs.current.get(pair.leftOption.id)
                        : null;
                      input?.click();
                    }}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      pair.leftOption?.image_url
                        ? "bg-pink-100 text-pink-600"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    }`}
                  >
                    <FiImage className="w-3 h-3" />
                    {pair.leftOption?.image_url
                      ? "Изменить изображение"
                      : "Добавить изображение"}
                  </button>
                </div>

                {/* Image preview for left */}
                {pair.leftOption?.image_url && (
                  <div className="relative">
                    <div className="relative w-24 h-24 border border-slate-200 rounded-lg overflow-hidden">
                      <Image
                        src={pair.leftOption.image_url}
                        alt={pair.leftOption.body || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.leftOption?.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Удалить изображение"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right side (cell) */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Ячейка:
                  </span>
                  <input
                    type="text"
                    value={pair.rightOption?.body || ""}
                    onChange={(e) =>
                      updateOptionText(pair.rightOption?.id, e.target.value)
                    }
                    placeholder="Введите текст ячейки..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                {/* Image upload for right */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      if (el && pair.rightOption?.id) {
                        fileInputRefs.current.set(pair.rightOption.id, el);
                      }
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && pair.rightOption?.id !== undefined) {
                        handleImageUpload(pair.rightOption.id, file);
                      }
                      if (e.target) e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = pair.rightOption?.id
                        ? fileInputRefs.current.get(pair.rightOption.id)
                        : null;
                      input?.click();
                    }}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      pair.rightOption?.image_url
                        ? "bg-pink-100 text-pink-600"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    }`}
                  >
                    <FiImage className="w-3 h-3" />
                    {pair.rightOption?.image_url
                      ? "Изменить изображение"
                      : "Добавить изображение"}
                  </button>
                </div>

                {/* Image preview for right */}
                {pair.rightOption?.image_url && (
                  <div className="relative">
                    <div className="relative w-24 h-24 border border-slate-200 rounded-lg overflow-hidden">
                      <Image
                        src={pair.rightOption.image_url}
                        alt={pair.rightOption.body || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.rightOption?.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Удалить изображение"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center justify-center mt-3 text-slate-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
