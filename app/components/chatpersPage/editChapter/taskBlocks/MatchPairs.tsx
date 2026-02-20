"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FiX, FiImage, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { CgArrowRight } from "react-icons/cg";
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

type PairSide = "answer" | "cell";
type PairSizeMode = "small" | "medium" | "large" | "custom";

type MatchPairsData = {
  pairs: PairItem[];
  shuffleInOpiq: boolean;
  pairSizeMode?: PairSizeMode;
  pairHeight?: number;
};

/** Convert internal PairItem[] to server QuestionOption[], preserving existing IDs */
function pairsToOptions(
  pairs: PairItem[],
  existingOptions: QuestionOption[]
): QuestionOption[] {
  const options: QuestionOption[] = [];
  let order = 0;

  pairs.forEach((pair) => {
    const existingLeft = existingOptions.find(
      (opt) => opt.match_id === pair.id && opt.group === "left"
    );
    const existingRight = existingOptions.find(
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

  return options;
}

export default function MatchPairs({ widgetId }: MatchPairsProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update, uploadImage, removeImage } =
    useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sideDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const dataDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Convert question options to pairs data structure
  const data = useMemo((): MatchPairsData => {
    if (!currentQuestion?.options) {
      return { pairs: [], shuffleInOpiq: true };
    }

    const options = currentQuestion.options;
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
        if (opt.group === "left") pair.left = opt;
        else if (opt.group === "right") pair.right = opt;
      }
    });

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

    const qData = currentQuestion.data as Record<string, unknown> | undefined;
    const shuffleInOpiq = (qData?.shuffle as boolean) ?? true;
    const pairSizeMode = (qData?.pairSizeMode as PairSizeMode) || "medium";
    const pairHeight = qData?.pairHeight as number | undefined;

    return { pairs, shuffleInOpiq, pairSizeMode, pairHeight };
  }, [currentQuestion]);

  const pairHeight = useMemo(
    () => computePairHeight(data.pairSizeMode, data.pairHeight),
    [data.pairSizeMode, data.pairHeight]
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setTimeout(() => setCurrentQuestion(firstQuestion), 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (dataDebounceTimerRef.current) clearTimeout(dataDebounceTimerRef.current);
      sideDebounceTimersRef.current.forEach((timer) => clearTimeout(timer));
      sideDebounceTimersRef.current.clear();
    };
  }, []);

  /** Build the data payload for server updates */
  const buildDataPayload = useCallback(
    (d: MatchPairsData) => ({
      shuffle: d.shuffleInOpiq,
      pairSizeMode: d.pairSizeMode,
      pairHeight: d.pairHeight,
    }),
    []
  );

  const updateData = useCallback(
    (newData: MatchPairsData, immediate = false) => {
      if (!currentQuestion?.id) return;

      const options = pairsToOptions(
        newData.pairs,
        currentQuestion.options || []
      );

      setCurrentQuestion((prev) =>
        prev
          ? { ...prev, options, data: { ...prev.data, ...buildDataPayload(newData) } }
          : null
      );

      if (dataDebounceTimerRef.current) clearTimeout(dataDebounceTimerRef.current);

      const questionId = currentQuestion.id;
      const sendUpdate = () => {
        update(questionId, { options, data: buildDataPayload(newData) });
      };

      if (immediate) {
        sendUpdate();
      } else {
        dataDebounceTimerRef.current = setTimeout(sendUpdate, 300);
      }
    },
    [currentQuestion, update, buildDataPayload]
  );

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      setCurrentQuestion((prev) => (prev ? { ...prev, body } : null));

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(async () => {
        if (!questionId) return;
        const trimmedBody = body.trim();
        if (trimmedBody.length === 0) return;

        const updated = await update(questionId, { body: trimmedBody });
        if (updated) setCurrentQuestion(updated);
      }, 500);
    },
    [currentQuestion, update]
  );

  const addPair = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const newMatchId = `${data.pairs.length}-${Math.ceil(Math.random() * 1000)}`;
    const newPair: PairItem = {
      id: newMatchId,
      answer: { text: "" },
      cell: { text: "" },
    };

    const allPairs = [...data.pairs, newPair];
    const options = pairsToOptions(allPairs, currentQuestion.options || []);

    setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

    const updated = await update(currentQuestion.id, {
      options,
      data: buildDataPayload(data),
    });
    if (updated) setCurrentQuestion(updated);
  }, [data, currentQuestion, update, buildDataPayload]);

  const removePair = useCallback(
    (id: string) => {
      updateData(
        { ...data, pairs: data.pairs.filter((p) => p.id !== id) },
        true
      );
    },
    [data, updateData]
  );

  const movePair = useCallback(
    (pairId: string, direction: "up" | "down") => {
      const pairs = [...data.pairs];
      const index = pairs.findIndex((p) => p.id === pairId);
      if (index === -1) return;
      if (direction === "up" && index === 0) return;
      if (direction === "down" && index === pairs.length - 1) return;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [pairs[index], pairs[swapIndex]] = [pairs[swapIndex], pairs[index]];
      updateData({ ...data, pairs }, true);
    },
    [data, updateData]
  );

  /** Unified update for answer or cell side */
  const updateSide = useCallback(
    (id: string, side: PairSide, field: "text" | "imageUrl", value: string) => {
      const pair = data.pairs.find((p) => p.id === id);
      if (!pair || !currentQuestion?.id) return;

      const newPair = {
        ...pair,
        [side]: { ...pair[side], [field]: value },
      };
      const newPairs = data.pairs.map((p) => (p.id === id ? newPair : p));
      const options = pairsToOptions(newPairs, currentQuestion.options || []);

      setCurrentQuestion((prev) => (prev ? { ...prev, options } : null));

      if (field === "text") {
        const timerKey = `${side}-${id}`;
        const existingTimer = sideDebounceTimersRef.current.get(timerKey);
        if (existingTimer) clearTimeout(existingTimer);

        const questionId = currentQuestion.id;
        const timer = setTimeout(async () => {
          const updated = await update(questionId, {
            options,
            data: buildDataPayload(data),
          });
          if (updated) setCurrentQuestion(updated);
          sideDebounceTimersRef.current.delete(timerKey);
        }, 500);

        sideDebounceTimersRef.current.set(timerKey, timer);
      } else {
        update(currentQuestion.id, {
          options,
          data: buildDataPayload(data),
        }).then((updated) => {
          if (updated) setCurrentQuestion(updated);
        });
      }
    },
    [data, currentQuestion, update, buildDataPayload]
  );

  const handleImageDelete = useCallback(
    async (pairId: string, side: PairSide) => {
      if (!currentQuestion?.id) return;

      const options = currentQuestion.options || [];
      const targetOption = options.find(
        (opt) =>
          opt.match_id === pairId &&
          opt.group === (side === "answer" ? "left" : "right")
      );
      if (!targetOption?.id) return;

      updateSide(pairId, side, "imageUrl", "");
      removeImage(targetOption.id);
    },
    [currentQuestion, removeImage, updateSide]
  );

  const handleImageUpload = useCallback(
    async (pairId: string, side: PairSide, file: File) => {
      const options = currentQuestion?.options || [];
      const targetOption = options.find(
        (opt) =>
          opt.match_id === pairId &&
          opt.group === (side === "answer" ? "left" : "right")
      );
      if (!targetOption?.id) return;

      const imageUrl = await uploadImage(targetOption.id, file);
      if (imageUrl) {
        updateSide(pairId, side, "imageUrl", imageUrl);
      }
    },
    [currentQuestion, uploadImage, updateSide]
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
        <div className="text-base md:text-lg lg:text-xl text-gray-600">
          {t("questionLabel")}
        </div>
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

        <div className="space-y-3 pt-2 border-t border-slate-200">
          <span className="text-base md:text-lg lg:text-xl text-slate-600 block">
            {t("pairSize")}
          </span>
          <div className="flex gap-2">
            {(["small", "medium", "large", "custom"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateData({ ...data, pairSizeMode: mode }, false)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  data.pairSizeMode === mode
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {t(
                  mode === "small"
                    ? "sizeSmall"
                    : mode === "medium"
                    ? "sizeMedium"
                    : mode === "large"
                    ? "sizeLarge"
                    : "sizeCustom"
                )}
              </button>
            ))}
          </div>

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

      {/* Pairs list — visual preview cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("pairsLabel")}
          </span>
          <Button content={t("addPair")} color="green" size="sm" onClick={addPair} />
        </div>

        {data.pairs.length === 0 && (
          <div className="text-base md:text-lg lg:text-xl text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            {t("noPairs")}
          </div>
        )}

        {data.pairs.map((pair, index) => (
          <div
            key={pair.id}
            className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden"
          >
            {/* Pair toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
              <span className="text-xs text-slate-400 font-medium">
                {t("pairNumber", { number: index + 1 })}
              </span>
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => movePair(pair.id, "up")}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded transition-colors disabled:opacity-30"
                  title={t("movePairUp")}
                >
                  <FiChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => movePair(pair.id, "down")}
                  disabled={index === data.pairs.length - 1}
                  className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded transition-colors disabled:opacity-30"
                  title={t("movePairDown")}
                >
                  <FiChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title={t("removePair")}
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pair visual preview: left ↔ right */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 p-3">
              <PairCardEditor
                pair={pair}
                side="answer"
                placeholder={t("answerPlaceholder")}
                pairHeight={pairHeight}
                fileInputRefs={fileInputRefs}
                onTextChange={(v) => updateSide(pair.id, "answer", "text", v)}
                onImageUpload={(f) => handleImageUpload(pair.id, "answer", f)}
                onImageDelete={() => handleImageDelete(pair.id, "answer")}
              />

              <div className="flex items-center justify-center">
                <CgArrowRight className="w-5 h-5 text-slate-300" />
              </div>

              <PairCardEditor
                pair={pair}
                side="cell"
                placeholder={t("cellPlaceholder")}
                pairHeight={pairHeight}
                fileInputRefs={fileInputRefs}
                onTextChange={(v) => updateSide(pair.id, "cell", "text", v)}
                onImageUpload={(f) => handleImageUpload(pair.id, "cell", f)}
                onImageDelete={() => handleImageDelete(pair.id, "cell")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Computed pair height from mode */
function computePairHeight(mode?: PairSizeMode, custom?: number): number {
  if (mode === "custom" && custom) return custom;
  switch (mode) {
    case "small":
      return 80;
    case "large":
      return 300;
    default:
      return 200;
  }
}

/** Visual card editor for one side of a pair — looks like the student preview */
function PairCardEditor({
  pair,
  side,
  placeholder,
  pairHeight,
  fileInputRefs,
  onTextChange,
  onImageUpload,
  onImageDelete,
}: {
  pair: PairItem;
  side: PairSide;
  placeholder: string;
  pairHeight: number;
  fileInputRefs: React.MutableRefObject<Map<string, HTMLInputElement>>;
  onTextChange: (value: string) => void;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
}) {
  const sideData = pair[side];
  const refKey = `${side}-${pair.id}`;

  return (
    <div
      className="relative rounded-xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center p-2 transition-all duration-200 group hover:border-slate-300"
      style={{ minHeight: `${pairHeight}px` }}
    >
      {/* Image area */}
      {sideData.imageUrl && (
        <div className="relative w-full flex-1 min-h-0 mb-2 max-h-[60%]">
          <Image
            src={sideData.imageUrl}
            alt={sideData.text}
            fill
            className="object-contain rounded"
            unoptimized
          />
          <button
            type="button"
            onClick={onImageDelete}
            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Text input — centered, transparent */}
      <input
        spellCheck={side === "cell"}
        type="text"
        value={sideData.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-center text-sm md:text-base lg:text-lg text-slate-700 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-slate-300"
      />

      {/* Image upload button — bottom, appears on hover */}
      {!sideData.imageUrl && (
        <button
          type="button"
          onClick={() => fileInputRefs.current.get(refKey)?.click()}
          className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
        >
          <FiImage className="w-4 h-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={(el) => {
          if (el) fileInputRefs.current.set(refKey, el);
        }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          if (e.target) e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
