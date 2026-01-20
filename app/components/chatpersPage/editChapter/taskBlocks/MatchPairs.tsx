"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FiX, FiImage, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";
import { useTranslations } from "next-intl";

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

type PairSizeMode = "small" | "medium" | "large" | "custom";

type MatchPairsData = {
  pairs: PairItem[];
  shuffleInOpiq: boolean;
  pairSizeMode?: PairSizeMode;
  pairHeight?: number;
};

export default function MatchPairs({ widgetId }: MatchPairsProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update, uploadImage, removeImage } =
    useQuestions(widgetId);

  // Get first question from array
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(
    new Map()
  );
  const cellDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const dataDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Convert question options to pairs data structure
  const data = useMemo((): MatchPairsData => {
    if (!currentQuestion?.options) {
      return { pairs: [], shuffleInOpiq: true };
    }

    const options = currentQuestion.options;

    // Group options by match_id
    const pairsMap = new Map<
      string,
      { left?: QuestionOption; right?: QuestionOption }
    >();

    options.forEach((opt) => {
      if (opt.match_id) {
        if (!pairsMap.has(opt.match_id)) {
          pairsMap.set(opt.match_id, {});
        }
        const pair = pairsMap.get(opt.match_id)!;
        if (opt.group === "left") {
          pair.left = opt;
        } else if (opt.group === "right") {
          pair.right = opt;
        }
      }
    });

    // Convert to pairs array, sorted by order
    const pairs: PairItem[] = [];
    Array.from(pairsMap.entries())
      .sort(([, a], [, b]) => {
        const orderA = a.left?.order ?? a.right?.order ?? 0;
        const orderB = b.left?.order ?? b.right?.order ?? 0;
        return orderA - orderB;
      })
      .forEach(([matchId, pair]) => {
        if (pair.left && pair.right) {
          pairs.push({
            id: matchId,
            answer: {
              text: pair.left.body || "",
              imageUrl: pair.left.image_url || undefined,
            },
            cell: {
              text: pair.right.body || "",
              imageUrl: pair.right.image_url || undefined,
            },
          });
        }
      });

    const shuffleInOpiq =
      (currentQuestion.data as { shuffle?: boolean })?.shuffle ?? true;

    const pairSizeMode = (currentQuestion.data as { pairSizeMode?: PairSizeMode })?.pairSizeMode || "medium";
    const pairHeight = (currentQuestion.data as { pairHeight?: number })?.pairHeight;

    return { pairs, shuffleInOpiq, pairSizeMode, pairHeight };
  }, [currentQuestion]);

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
        // Find existing options by match_id (pair.id is match_id)
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.match_id === pair.id && opt.group === "left"
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.match_id === pair.id && opt.group === "right"
        );

        // Use pair.id as match_id (it's the match_id from data structure)
        const matchId = pair.id;

        options.push({
          id: existingLeft?.id,
          body: pair.answer.text,
          image_url: pair.answer.imageUrl || null,
          is_correct: false,
          match_id: matchId,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: pair.cell.text,
          image_url: pair.cell.imageUrl || null,
          is_correct: false,
          match_id: matchId,
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
              data: {
                ...prev.data,
                shuffle: newData.shuffleInOpiq,
                pairSizeMode: newData.pairSizeMode,
                pairHeight: newData.pairHeight,
              },
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
          data: {
            shuffle: newData.shuffleInOpiq,
            pairSizeMode: newData.pairSizeMode,
            pairHeight: newData.pairHeight,
          },
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

    // Generate unique match_id for new pair
    const newMatchId = `${data.pairs.length}-${Math.ceil(
      Math.random() * 1000
    )}`;
    const newPair: PairItem = {
      id: newMatchId,
      answer: { text: "" },
      cell: { text: "" },
    };

    // Convert pairs to options including new pair
    const options: QuestionOption[] = [];
    let order = 0;

    [...data.pairs, newPair].forEach((pair) => {
      // Find existing options by match_id
      const existingLeft = currentQuestion.options?.find(
        (opt) => opt.match_id === pair.id && opt.group === "left"
      );
      const existingRight = currentQuestion.options?.find(
        (opt) => opt.match_id === pair.id && opt.group === "right"
      );

      options.push({
        id: existingLeft?.id,
        body: pair.answer.text,
        image_url: pair.answer.imageUrl || null,
        is_correct: false,
        match_id: pair.id,
        group: "left",
        order: order++,
      });

      options.push({
        id: existingRight?.id,
        body: pair.cell.text,
        image_url: pair.cell.imageUrl || null,
        is_correct: false,
        match_id: pair.id,
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
        // Find existing options by match_id (pair.id is match_id)
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.match_id === p.id && opt.group === "left"
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.match_id === p.id && opt.group === "right"
        );

        options.push({
          id: existingLeft?.id,
          body: p.answer.text,
          image_url: p.answer.imageUrl || null,
          is_correct: false,
          match_id: p.id,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: p.cell.text,
          image_url: p.cell.imageUrl || null,
          is_correct: false,
          match_id: p.id,
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
        const timer = setTimeout(async () => {
          const updated = await update(questionId, {
            options,
            data: { shuffle: data.shuffleInOpiq },
          });
          if (updated) {
            setCurrentQuestion(updated);
          }
          answerDebounceTimersRef.current.delete(timerKey);
        }, 500);

        answerDebounceTimersRef.current.set(timerKey, timer);
      } else {
        // Immediate update for imageUrl
        update(currentQuestion.id, {
          options,
          data: { shuffle: data.shuffleInOpiq },
        }).then((updated) => {
          if (updated) {
            setCurrentQuestion(updated);
          }
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
        // Find existing options by match_id (pair.id is match_id)
        const existingLeft = currentQuestion.options?.find(
          (opt) => opt.match_id === p.id && opt.group === "left"
        );
        const existingRight = currentQuestion.options?.find(
          (opt) => opt.match_id === p.id && opt.group === "right"
        );

        options.push({
          id: existingLeft?.id,
          body: p.answer.text,
          image_url: p.answer.imageUrl || null,
          is_correct: false,
          match_id: p.id,
          group: "left",
          order: order++,
        });

        options.push({
          id: existingRight?.id,
          body: p.cell.text,
          image_url: p.cell.imageUrl || null,
          is_correct: false,
          match_id: p.id,
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
        const timer = setTimeout(async () => {
          const updated = await update(questionId, {
            options,
            data: { shuffle: data.shuffleInOpiq },
          });
          if (updated) {
            setCurrentQuestion(updated);
          }
          cellDebounceTimersRef.current.delete(timerKey);
        }, 500);

        cellDebounceTimersRef.current.set(timerKey, timer);
      } else {
        // Immediate update for imageUrl
        update(currentQuestion.id, {
          options,
          data: { shuffle: data.shuffleInOpiq },
        }).then((updated) => {
          if (updated) {
            setCurrentQuestion(updated);
          }
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
        // Find by match_id (pairId is match_id) and group
        return (
          opt.match_id === pairId &&
          opt.group === (side === "answer" ? "left" : "right")
        );
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

      // Find the corresponding option by match_id (pairId is match_id)
      const options = currentQuestion?.options || [];
      const targetOption = options.find((opt) => {
        // Find by match_id and group
        return (
          opt.match_id === pairId &&
          opt.group === (side === "answer" ? "left" : "right")
        );
      });

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

  return (
    <div className="w-full space-y-4">
      {/* Question input */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-base md:text-lg lg:text-xl text-gray-600">{t("questionLabel")}</div>
        <input
          spellCheck
          type="text"
          placeholder={t("questionPlaceholder")}
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Settings */}
      <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.shuffleInOpiq}
            onChange={(e) =>
              updateData({ ...data, shuffleInOpiq: e.target.checked }, true)
            }
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-base md:text-lg lg:text-xl text-slate-600">
            {t("shuffleOptions")}
          </span>
        </label>

        {/* Pair sizes */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <span className="text-base md:text-lg lg:text-xl text-slate-600 block">
            {t("pairSize")}
          </span>
          
          {/* Size mode buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateData({ ...data, pairSizeMode: "small" }, false)
              }
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                data.pairSizeMode === "small"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {t("sizeSmall")}
            </button>
            <button
              type="button"
              onClick={() =>
                updateData({ ...data, pairSizeMode: "medium" }, false)
              }
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                data.pairSizeMode === "medium"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {t("sizeMedium")}
            </button>
            <button
              type="button"
              onClick={() =>
                updateData({ ...data, pairSizeMode: "large" }, false)
              }
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                data.pairSizeMode === "large"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {t("sizeLarge")}
            </button>
            <button
              type="button"
              onClick={() =>
                updateData({ ...data, pairSizeMode: "custom" }, false)
              }
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                data.pairSizeMode === "custom"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {t("sizeCustom")}
            </button>
          </div>

          {/* Custom height input (only shown when custom mode is selected) */}
          {data.pairSizeMode === "custom" && (
            <div className="flex items-center gap-2 pt-2">
              <label className="text-sm md:text-base lg:text-lg text-slate-500">
                {t("height")}:
              </label>
              <input
                type="number"
                min="100"
                max="1000"
                value={data.pairHeight || 200}
                onChange={(e) =>
                  updateData(
                    { ...data, pairHeight: Number(e.target.value) || 200 },
                    false
                  )
                }
                className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-400">px</span>
            </div>
          )}
        </div>
      </div>

      {/* Pairs list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("pairsLabel")}
          </span>
          <div className="flex gap-2">
            <Button
              content={t("addPair")}
              color="green"
              size="sm"
              onClick={addPair}
            />
          </div>
        </div>

        {data.pairs.length === 0 && (
          <div className="text-base md:text-lg lg:text-xl text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            {t("noPairs")}
          </div>
        )}

        {data.pairs.map((pair, index) => (
          <div
            key={pair.id}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm md:text-base lg:text-lg text-slate-400 font-medium">
                {t("pairNumber", { number: index + 1 })}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title={t("removePair")}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm md:text-base lg:text-lg text-slate-500 mb-1 block">
                    {t("answerVariant")}
                  </span>
                  <input
                    spellCheck={false}
                    type="text"
                    value={pair.answer.text}
                    onChange={(e) =>
                      updateAnswer(pair.id, "text", e.target.value)
                    }
                    placeholder={t("answerPlaceholder")}
                    className="w-full px-3 py-2 text-base md:text-lg lg:text-xl bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {!pair.answer.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = fileInputRefs.current.get(
                        `answer-${pair.id}`
                      );
                      input?.click();
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-sm md:text-base lg:text-lg rounded transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <FiImage className="w-3 h-3" />
                    {t("addImage")}
                  </button>
                )}
                {pair.answer.imageUrl && (
                  <div className="relative mt-2">
                    <div className="relative w-40 h-40 border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <Image
                        src={pair.answer.imageUrl}
                        alt={pair.answer.text}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.id, "answer")}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title={t("removeImage")}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm md:text-base lg:text-lg text-slate-500 mb-1 block">
                    {t("cell")}
                  </span>
                  <input
                    spellCheck
                    type="text"
                    value={pair.cell.text}
                    onChange={(e) =>
                      updateCell(pair.id, "text", e.target.value)
                    }
                    placeholder={t("cellPlaceholder")}
                    className="w-full px-3 py-2 text-base md:text-lg lg:text-xl bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {!pair.cell.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = fileInputRefs.current.get(`cell-${pair.id}`);
                      input?.click();
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-sm md:text-base lg:text-lg rounded transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <FiImage className="w-3 h-3" />
                    {t("addImage")}
                  </button>
                )}
                {pair.cell.imageUrl && (
                  <div className="relative mt-2">
                    <div className="relative w-40 h-40 border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <Image
                        src={pair.cell.imageUrl}
                        alt={pair.cell.text}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(pair.id, "cell")}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title={t("removeImage")}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
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
