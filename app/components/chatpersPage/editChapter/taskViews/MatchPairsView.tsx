"use client";

import { useMemo, useState } from "react";
import { CgArrowRight } from "react-icons/cg";
import { FiX } from "react-icons/fi";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";

type MatchPairsViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
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

type UserAnswer = {
  matches: Record<string, string>; // answer_id (option.id) -> cell_id (option.id)
};

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchPairsView({
  widgetId,
  onChange,
}: MatchPairsViewProps) {
  const t = useTranslations();
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [matches, setMatches] = useState<Record<string, string>>({}); // answer_id -> cell_id
  const [draggedAnswerId, setDraggedAnswerId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  const pairSizeMode = (currentQuestion?.data as { pairSizeMode?: "small" | "medium" | "large" | "custom" })?.pairSizeMode || "medium";
  const customHeight = (currentQuestion?.data as { pairHeight?: number })?.pairHeight;

  // Get height based on mode (width stays full)
  const getPairHeight = () => {
    if (pairSizeMode === "custom" && customHeight) {
      return customHeight;
    }

    switch (pairSizeMode) {
      case "small":
        return 80;
      case "medium":
        return 200;
      case "large":
        return 300;
      default:
        return 200;
    }
  };

  const pairHeight = getPairHeight();

  const data = useMemo((): { pairs: PairItem[] } => {
    if (!options.length) {
      return { pairs: [] };
    }

    const pairsMap = new Map<
      string,
      { left?: (typeof options)[0]; right?: (typeof options)[0] }
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

    return { pairs };
  }, [options]);

  // Shuffle answers once when data changes
  const shuffledAnswers = useMemo(() => {
    const answers = data.pairs.map((pair) => {
      const leftOption = options.find(
        (opt) => opt.match_id === pair.id && opt.group === "left"
      );
      return {
        id: pair.id, // match_id
        optionId: leftOption?.id?.toString() || "", // option.id для ответа
        text: pair.answer.text,
        imageUrl: pair.answer.imageUrl,
      };
    });
    return shuffleArray(answers);
  }, [data.pairs, options]);

  const handleDragStart = (answerId: string) => {
    setDraggedAnswerId(answerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const applyMatch = (answerMatchId: string, cellMatchId: string) => {
    const answerOption = options.find(
      (opt) => opt.match_id === answerMatchId && opt.group === "left"
    );
    const cellOption = options.find(
      (opt) => opt.match_id === cellMatchId && opt.group === "right"
    );

    if (answerOption?.id && cellOption?.id) {
      const answerId = answerOption.id.toString();
      const cellId = cellOption.id.toString();
      const newMatches = { ...matches, [answerId]: cellId };
      setMatches(newMatches);
      setResult(null);

      if (onChange) {
        const answer: UserAnswer = { matches: newMatches };
        onChange(JSON.stringify(answer));
      }
    }
  };

  const handleDrop = (cellMatchId: string) => {
    if (draggedAnswerId) {
      applyMatch(draggedAnswerId, cellMatchId);
    }
    setDraggedAnswerId(null);
  };

  // Tap-to-match: select answer, then tap cell
  const handleAnswerTap = (answerMatchId: string) => {
    if (isAnswerMatched(answerMatchId)) return;
    setSelectedAnswerId(
      selectedAnswerId === answerMatchId ? null : answerMatchId
    );
  };

  const handleCellTap = (cellMatchId: string) => {
    if (!selectedAnswerId) return;
    // Don't place if cell already has a match
    if (getMatchedAnswerForCell(cellMatchId)) return;
    applyMatch(selectedAnswerId, cellMatchId);
    setSelectedAnswerId(null);
  };

  const handleRemoveMatch = (answerMatchId: string) => {
    // Находим option.id для answer
    const answerOption = options.find(
      (opt) => opt.match_id === answerMatchId && opt.group === "left"
    );
    if (answerOption?.id) {
      const answerId = answerOption.id.toString();
      const newMatches = { ...matches };
      delete newMatches[answerId];
      setMatches(newMatches);
      setResult(null);
    }
  };

  // Get which answer is matched to which cell
  const getMatchedAnswerForCell = (cellMatchId: string) => {
    const cellOption = options.find(
      (opt) => opt.match_id === cellMatchId && opt.group === "right"
    );
    if (!cellOption?.id) return null;

    const cellId = cellOption.id.toString();
    const answerId = Object.keys(matches).find(
      (aid) => matches[aid] === cellId
    );
    if (!answerId) return null;

    const answerOption = options.find(
      (opt) => opt.id?.toString() === answerId && opt.group === "left"
    );
    if (!answerOption) return null;

    return shuffledAnswers.find((a) => a.id === answerOption.match_id) || null;
  };

  // Check if answer is already matched
  const isAnswerMatched = (answerMatchId: string) => {
    const answerOption = options.find(
      (opt) => opt.match_id === answerMatchId && opt.group === "left"
    );
    if (!answerOption?.id) return false;
    const answerId = answerOption.id.toString();
    return answerId in matches;
  };

  const handleSubmit = async () => {
    if (Object.keys(matches).length === 0 || !currentQuestion?.id) {
      return;
    }

    setSubmitting(true);
    const answer = { matches };

    const response = await submit(currentQuestion.id, answer);

    if (response) {
      setResult(response);
    }

    setSubmitting(false);
  };

  if (!currentQuestion || data.pairs.length === 0) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full space-y-4">
        {/* Pool of unmatched answers */}
        {shuffledAnswers.some((a) => !isAnswerMatched(a.id)) && (
          <div className="flex flex-wrap gap-2 justify-center">
            {shuffledAnswers.map((answer) => {
              if (isAnswerMatched(answer.id)) return null;
              const isSelected = selectedAnswerId === answer.id;
              return (
                <div
                  key={answer.id}
                  draggable
                  onDragStart={() => handleDragStart(answer.id)}
                  onClick={() => handleAnswerTap(answer.id)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all cursor-pointer select-none flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300 scale-105"
                      : draggedAnswerId === answer.id
                      ? "bg-blue-50 border-blue-400 scale-105"
                      : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md active:bg-blue-50"
                  }`}
                >
                  {answer.imageUrl && (
                    <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                      <Image
                        src={answer.imageUrl}
                        alt=""
                        fill
                        className="object-contain rounded"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="text-sm md:text-base font-medium text-gray-800">
                    {answer.text || "\u00A0"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Cell rows */}
        <div className="space-y-3">
          {data.pairs.map((pair) => {
            const matchedAnswer = getMatchedAnswerForCell(pair.id);

            return (
              <div
                key={pair.id}
                onClick={() => handleCellTap(pair.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(pair.id)}
                style={{ minHeight: `${pairHeight}px` }}
                className={`relative w-full p-2 rounded-lg border-2 transition-all flex items-stretch gap-2 ${
                  matchedAnswer
                    ? "bg-slate-50 border-slate-400"
                    : selectedAnswerId
                    ? "bg-blue-50/50 border-blue-300 border-dashed cursor-pointer hover:border-blue-500"
                    : "bg-slate-50 border-slate-300 border-dashed"
                }`}
              >
                {/* Cell label */}
                <div className="flex items-center justify-center flex-1">
                  <div className="text-center w-full h-full flex flex-col items-center justify-center">
                    {pair.cell.imageUrl && (
                      <div className="relative flex-1 w-full max-w-[80%] min-h-0">
                        <Image
                          src={pair.cell.imageUrl}
                          alt=""
                          fill
                          className="object-contain rounded"
                          unoptimized
                        />
                      </div>
                    )}
                    <p className="text-base md:text-lg lg:text-xl text-slate-500">
                      {pair.cell.text}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center px-1">
                  <CgArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                {/* Matched answer or empty slot */}
                <div className="flex items-center justify-center flex-1">
                  {matchedAnswer ? (
                    <div className="relative flex flex-col gap-2 flex-1 items-center justify-center text-center bg-white w-full rounded-2xl ring ring-gray-300 h-full p-2">
                      <div className="absolute -top-2 -right-2 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMatch(matchedAnswer.id);
                          }}
                          className="p-1.5 md:p-1 rounded-full bg-white shadow border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                          title={t("constructor.removeMatch")}
                        >
                          <FiX className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                      {matchedAnswer.imageUrl && (
                        <div className="relative flex-1 w-full max-w-[80%] min-h-0">
                          <Image
                            src={matchedAnswer.imageUrl}
                            alt=""
                            fill
                            className="object-contain rounded"
                            unoptimized
                          />
                        </div>
                      )}
                      <span className="text-sm md:text-base lg:text-lg font-medium text-gray-800 break-words">
                        {matchedAnswer.text}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-white w-full rounded-2xl ring ring-gray-200 h-full min-h-[48px]">
                      <span className="text-sm text-gray-300">...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg border-2 ${
              result.is_correct
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className=" items-center gap-2">
              <span className="text-lg font-semibold">
                {result.is_correct
                  ? getPositiveFeedback()
                  : getNegativeFeedback()}
              </span>
              <span className="text-sm">(+{result.points_earned} балл)</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={
              Object.keys(matches).length === 0 || submitting || loading
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting || loading ? "Отправка..." : "Отправить ответ"}
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}
