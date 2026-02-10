"use client";

import { useMemo, useState } from "react";
import { CgArrowRight } from "react-icons/cg";
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
        return 150;
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

  const handleDrop = (cellMatchId: string) => {
    if (draggedAnswerId) {
      // Находим option.id для answer (left) и cell (right)
      const answerOption = options.find(
        (opt) => opt.match_id === draggedAnswerId && opt.group === "left"
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
    }
    setDraggedAnswerId(null);
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
        {/* Header */}
        <div className="text-base md:text-lg lg:text-xl text-slate-600 text-center">
          Перетащите варианты ответа в соответствующие ячейки
        </div>

        {/* Grid layout: each row = answer + arrow + cell */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Header row */}
          <div className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            Варианты ответа:
          </div>
          <div></div>
          <div className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            Ячейки:
          </div>

          {/* Content rows */}
          {data.pairs.map((pair, index) => {
            const matchedAnswer = getMatchedAnswerForCell(pair.id);

            // Find the answer that should be shown in this row (from shuffled answers)
            // We'll show shuffled answers in order, one per row
            const answerForRow = shuffledAnswers[index] || null;
            const answerIsMatched = answerForRow
              ? isAnswerMatched(answerForRow.id)
              : false;

            return (
              <div key={pair.id} className="contents">
                {/* Answer column */}
                <div className="flex h-full">
                  {answerForRow && (
                    <div
                      draggable={!answerIsMatched}
                      onDragStart={() => handleDragStart(answerForRow.id)}
                      style={{
                        minHeight: `${pairHeight}px`,
                        height: `${pairHeight}px`,
                      }}
                      className={`w-full px-2 py-1 rounded-lg border-2 transition-all flex flex-col ${
                        answerIsMatched
                          ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                          : draggedAnswerId === answerForRow.id
                          ? "bg-blue-100 border-blue-400 scale-105 cursor-grabbing"
                          : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md cursor-move"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 flex-1">
                        {answerForRow.imageUrl && (
                          <div className="relative flex-1 w-full max-w-[80%] min-h-0">
                            <Image
                              src={answerForRow.imageUrl}
                              alt=""
                              fill
                              className="object-contain rounded"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="text-base text-center md:text-lg lg:text-xl font-medium text-gray-800 wrap-break-word">
                          {answerForRow.text || "Пусто"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow column */}
                <div className="flex items-center justify-center px-2 h-full self-stretch">
                  <CgArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                {/* Cell column */}
                <div className="flex h-full relative">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(pair.id)}
                    style={{
                      minHeight: `${pairHeight}px`,
                      height: `${pairHeight}px`,
                    }}
                    className={`w-full p-2 rounded-lg border-2 transition-all flex ${
                      matchedAnswer
                        ? "bg-slate-100 border-slate-400"
                        : "bg-slate-50 border-slate-300 border-dashed hover:border-blue-400"
                    }`}
                  >
                    {matchedAnswer ? (
                      <div className="flex flex-col flex-1 pt-2">
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveMatch(matchedAnswer.id)}
                            className="text-sm md:text-base lg:text-lg text-red-500 hover:text-red-700"
                          >
                            {t("constructor.removeMatch")}
                          </button>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 items-center justify-center ring text-center bg-white w-full rounded-2xl ring-gray-300 h-full">
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
                          <span className="text-base md:text-lg lg:text-xl font-medium text-gray-800 wrap-break-word">
                            {matchedAnswer.text}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center flex-1">
                        <div className="text-center bg-white w-full rounded-2xl ring ring-gray-300 h-full flex flex-col items-center justify-center">
                          
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-center flex-1">
                        <div className="text-center w-full h-full flex flex-col items-center justify-center">
                          {pair.cell.imageUrl && (
                            <div className="relative flex-1 w-full max-w-[80%] min-h-0 mb-2">
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
                  </div>
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
