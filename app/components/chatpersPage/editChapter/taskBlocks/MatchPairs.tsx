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

type PairItem = {
  id: string;
  answer: {
    text: string;
    imageUrl?: string;
  };
  cell: {
    text: string;
    imageUrl?: string;
  };
};

type MatchPairsData = {
  pairs: PairItem[];
  shuffleInOpiq: boolean;
};

export default function MatchPairs({ widgetId }: MatchPairsProps) {
  const { questions, loading, create, update, uploadImage, removeImage } =
    useQuestions(widgetId);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasCreatedQuestionRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(
    new Map()
  );
  const cellDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const dataDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const questionsArray = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions]
  );

  // Convert question options to pairs data structure
  const data = useMemo((): MatchPairsData => {
    if (!currentQuestion?.options) {
      return { pairs: [], shuffleInOpiq: true };
    }

    const options = currentQuestion.options;
    const leftOptions = options
      .filter((opt) => opt.group === "left")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const rightOptions = options
      .filter((opt) => opt.group === "right")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const pairs: PairItem[] = [];
    const minLength = Math.min(leftOptions.length, rightOptions.length);

    for (let i = 0; i < minLength; i++) {
      if (leftOptions[i] && rightOptions[i]) {
        pairs.push({
          id: String(i),
          answer: {
            text: leftOptions[i].body || "",
            imageUrl: leftOptions[i].image_url || undefined,
          },
          cell: {
            text: rightOptions[i].body || "",
            imageUrl: rightOptions[i].image_url || undefined,
          },
        });
      }
    }

    const shuffleInOpiq =
      (currentQuestion.data as { shuffle?: boolean })?.shuffle ?? true;

    return { pairs, shuffleInOpiq };
  }, [currentQuestion]);

  // Initialize or update current question
  useEffect(() => {
    if (questionsArray.length > 0) {
      const firstQuestion = questionsArray[0];
      if (
        !currentQuestion ||
        currentQuestion.id !== firstQuestion.id ||
        firstQuestion.options?.length !== currentQuestion.options?.length
      ) {
        const timer = setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }

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

  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const dataDebounceTimer = dataDebounceTimerRef.current;
    const answerTimers = answerDebounceTimersRef.current;
    const cellTimers = cellDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (dataDebounceTimer) {
        clearTimeout(dataDebounceTimer);
      }
      answerTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      answerTimers.clear();
      cellTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      cellTimers.clear();
    };
  }, []);

  const updateData = useCallback(
    (newData: MatchPairsData, immediate = false) => {
      if (!currentQuestion?.id) return;

      // Convert pairs back to options
      const options: QuestionOption[] = [];
      let order = 0;

      newData.pairs.forEach((pair) => {
        // Find existing options by matching text and group
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.group === "left" && opt.body === pair.answer.text
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.group === "right" && opt.body === pair.cell.text
        );

        options.push({
          id: existingLeft?.id,
          body: pair.answer.text,
          image_url: pair.answer.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: pair.cell.text,
          image_url: pair.cell.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "right",
          order: order++,
        });
      });

      // Update UI immediately (optimistic update)
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              options,
              data: { ...prev.data, shuffle: newData.shuffleInOpiq },
            }
          : null
      );

      // Clear existing timer
      if (dataDebounceTimerRef.current) {
        clearTimeout(dataDebounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      const sendUpdate = () => {
        update(questionId, {
          options,
          data: { shuffle: newData.shuffleInOpiq },
        });
      };

      if (immediate) {
        sendUpdate();
      } else {
        // Debounce for non-immediate updates
        dataDebounceTimerRef.current = setTimeout(sendUpdate, 300);
      }
    },
    [currentQuestion, update]
  );

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      setCurrentQuestion((prev) => (prev ? { ...prev, body } : null));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(async () => {
        if (!questionId) return;
        const trimmedBody = body.trim();
        if (trimmedBody.length === 0) return;

        const updated = await update(questionId, { body: trimmedBody });
        if (updated) {
          setCurrentQuestion(updated);
        }
      }, 500);
    },
    [currentQuestion, update]
  );

  const addPair = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const newPair: PairItem = {
      id: String(data.pairs.length),
      answer: { text: "" },
      cell: { text: "" },
    };

    // Convert pairs to options including new pair
    const options: QuestionOption[] = [];
    let order = 0;

    [...data.pairs, newPair].forEach((pair) => {
      const existingLeft = currentQuestion.options?.find(
        (opt) => opt.group === "left" && opt.body === pair.answer.text
      );
      const existingRight = currentQuestion.options?.find(
        (opt) => opt.group === "right" && opt.body === pair.cell.text
      );

      options.push({
        id: existingLeft?.id,
        body: pair.answer.text,
        image_url: pair.answer.imageUrl || null,
        is_correct: false,
        match_id: null,
        group: "left",
        order: order++,
      });

      options.push({
        id: existingRight?.id,
        body: pair.cell.text,
        image_url: pair.cell.imageUrl || null,
        is_correct: false,
        match_id: null,
        group: "right",
        order: order++,
      });
    });

    // Update UI immediately
    setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

    // Send to server and wait for response to get IDs for new options
    const updated = await update(currentQuestion.id, {
      options,
      data: { shuffle: data.shuffleInOpiq },
    });

    if (updated) {
      setCurrentQuestion(updated);
    }
  }, [data, currentQuestion, update]);

  const removePair = useCallback(
    (id: string) => {
      updateData(
        { ...data, pairs: data.pairs.filter((p) => p.id !== id) },
        true
      );
    },
    [data, updateData]
  );

  const updateAnswer = useCallback(
    (id: string, field: "text" | "imageUrl", value: string) => {
      const pair = data.pairs.find((p) => p.id === id);
      if (!pair || !currentQuestion?.id) return;

      const newPair = {
        ...pair,
        answer: { ...pair.answer, [field]: value },
      };
      const newPairs = data.pairs.map((p) => (p.id === id ? newPair : p));

      // Convert pairs to options
      const options: QuestionOption[] = [];
      let order = 0;

      newPairs.forEach((p) => {
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.group === "left" && opt.body === p.answer.text
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.group === "right" && opt.body === p.cell.text
        );

        options.push({
          id: existingLeft?.id,
          body: p.answer.text,
          image_url: p.answer.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: p.cell.text,
          image_url: p.cell.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "right",
          order: order++,
        });
      });

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

      // Debounce text updates, immediate for imageUrl
      if (field === "text") {
        const timerKey = `answer-${id}`;
        const existingTimer = answerDebounceTimersRef.current.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const questionId = currentQuestion.id;
        const timer = setTimeout(() => {
          update(questionId, {
            options,
            data: { shuffle: data.shuffleInOpiq },
          });
          answerDebounceTimersRef.current.delete(timerKey);
        }, 500);

        answerDebounceTimersRef.current.set(timerKey, timer);
      } else {
        // Immediate update for imageUrl
        update(currentQuestion.id, {
          options,
          data: { shuffle: data.shuffleInOpiq },
        });
      }
    },
    [data, currentQuestion, update]
  );

  const updateCell = useCallback(
    (id: string, field: "text" | "imageUrl", value: string) => {
      const pair = data.pairs.find((p) => p.id === id);
      if (!pair || !currentQuestion?.id) return;

      const newPair = {
        ...pair,
        cell: { ...pair.cell, [field]: value },
      };
      const newPairs = data.pairs.map((p) => (p.id === id ? newPair : p));

      // Convert pairs to options
      const options: QuestionOption[] = [];
      let order = 0;

      newPairs.forEach((p) => {
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.group === "left" && opt.body === p.answer.text
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.group === "right" && opt.body === p.cell.text
        );

        options.push({
          id: existingLeft?.id,
          body: p.answer.text,
          image_url: p.answer.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: p.cell.text,
          image_url: p.cell.imageUrl || null,
          is_correct: false,
          match_id: null,
          group: "right",
          order: order++,
        });
      });

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

      // Debounce text updates, immediate for imageUrl
      if (field === "text") {
        const timerKey = `cell-${id}`;
        const existingTimer = cellDebounceTimersRef.current.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const questionId = currentQuestion.id;
        const timer = setTimeout(() => {
          update(questionId, {
            options,
            data: { shuffle: data.shuffleInOpiq },
          });
          cellDebounceTimersRef.current.delete(timerKey);
        }, 500);

        cellDebounceTimersRef.current.set(timerKey, timer);
      } else {
        // Immediate update for imageUrl
        update(currentQuestion.id, {
          options,
          data: { shuffle: data.shuffleInOpiq },
        });
      }
    },
    [data, currentQuestion, update]
  );

  const handleImageDelete = useCallback(
    async (pairId: string, side: "answer" | "cell") => {
      const pair = data.pairs.find((p) => p.id === pairId);
      if (!pair || !currentQuestion?.id) return;

      const options = currentQuestion.options || [];
      const targetOption = options.find((opt) => {
        if (side === "answer") {
          return opt.group === "left" && opt.body === pair.answer.text;
        } else {
          return opt.group === "right" && opt.body === pair.cell.text;
        }
      });

      if (!targetOption?.id) return;

      // Update UI immediately (optimistic)
      if (side === "answer") {
        updateAnswer(pairId, "imageUrl", "");
      } else {
        updateCell(pairId, "imageUrl", "");
      }

      // Send to server
      removeImage(targetOption.id);
    },
    [data.pairs, currentQuestion, removeImage, updateAnswer, updateCell]
  );

  const handleImageUpload = useCallback(
    async (pairId: string, side: "answer" | "cell", file: File) => {
      const pair = data.pairs.find((p) => p.id === pairId);

      if (!pair) return;

      // Find the corresponding option
      const options = currentQuestion?.options || [];
      console.log(options);
      const targetOption = options.find((opt) => {
        if (side === "answer") {
          return opt.group === "left" && opt.body === pair.answer.text;
        } else {
          return opt.group === "right" && opt.body === pair.cell.text;
        }
      });

      console.log(pairId);

      if (!targetOption?.id) return;

      const imageUrl = await uploadImage(targetOption.id, file);
      if (imageUrl) {
        if (side === "answer") {
          updateAnswer(pairId, "imageUrl", imageUrl);
        } else {
          updateCell(pairId, "imageUrl", imageUrl);
        }
      }
    },
    [data.pairs, currentQuestion, uploadImage, updateAnswer, updateCell]
  );

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
      {/* Question input */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-gray-600">Вопрос к заданию</div>
        <input
          type="text"
          placeholder="Вопрос к заданию"
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.shuffleInOpiq}
            onChange={(e) =>
              updateData({ ...data, shuffleInOpiq: e.target.checked }, true)
            }
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

        {data.pairs.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            Нет пар. Нажмите «Добавить пару» чтобы создать.
          </div>
        )}

        {data.pairs.map((pair, index) => (
          <div
            key={pair.id}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">
                Пара #{index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Удалить пару"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Вариант ответа:
                  </span>
                  <input
                    type="text"
                    value={pair.answer.text}
                    onChange={(e) =>
                      updateAnswer(pair.id, "text", e.target.value)
                    }
                    placeholder="Введите вариант ответа..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    if (el) {
                      fileInputRefs.current.set(`answer-${pair.id}`, el);
                    }
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(pair.id, "answer", file);
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
                    const input = fileInputRefs.current.get(
                      `answer-${pair.id}`
                    );
                    input?.click();
                  }}
                  className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                    pair.answer.imageUrl
                      ? "bg-pink-100 text-pink-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <FiImage className="w-3 h-3" />
                  {pair.answer.imageUrl
                    ? "Удалить изображение"
                    : "Добавить изображение"}
                </button>
                {pair.answer.imageUrl && (
                  <div className="relative mt-2">
                    <div className="relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden">
                      <Image
                        src={pair.answer.imageUrl}
                        alt={pair.answer.text}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.id, "answer")}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Удалить изображение"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Ячейка:
                  </span>
                  <input
                    type="text"
                    value={pair.cell.text}
                    onChange={(e) =>
                      updateCell(pair.id, "text", e.target.value)
                    }
                    placeholder="Введите текст ячейки..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    if (el) {
                      fileInputRefs.current.set(`cell-${pair.id}`, el);
                    }
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(pair.id, "cell", file);
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
                    const input = fileInputRefs.current.get(`cell-${pair.id}`);
                    input?.click();
                  }}
                  className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                    pair.cell.imageUrl
                      ? "bg-pink-100 text-pink-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <FiImage className="w-3 h-3" />
                  {pair.cell.imageUrl
                    ? "Удалить изображение"
                    : "Добавить изображение"}
                </button>
                {pair.cell.imageUrl && (
                  <div className="relative mt-2">
                    <div className="relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden">
                      <Image
                        src={pair.cell.imageUrl}
                        alt={pair.cell.text}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.id, "cell")}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Удалить изображение"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

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
