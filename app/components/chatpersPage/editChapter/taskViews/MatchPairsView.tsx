"use client";

import { useMemo, useState } from "react";
import { CgArrowRight } from "react-icons/cg";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

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
  matches: Record<string, string>; // answerId (match_id) -> cellId (match_id)
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
  const { questions } = useQuestions(widgetId);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedAnswerId, setDraggedAnswerId] = useState<string | null>(null);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

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
    const answers = data.pairs.map((pair) => ({
      id: pair.id,
      text: pair.answer.text,
      imageUrl: pair.answer.imageUrl,
    }));
    return shuffleArray(answers);
  }, [data.pairs]);

  const handleDragStart = (answerId: string) => {
    setDraggedAnswerId(answerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (cellId: string) => {
    if (draggedAnswerId) {
      const newMatches = { ...matches, [draggedAnswerId]: cellId };
      setMatches(newMatches);

      if (onChange) {
        const answer: UserAnswer = { matches: newMatches };
        onChange(JSON.stringify(answer));
      }
    }
    setDraggedAnswerId(null);
  };

  const handleRemoveMatch = (answerId: string) => {
    const newMatches = { ...matches };
    delete newMatches[answerId];
    setMatches(newMatches);

    if (onChange) {
      const answer: UserAnswer = { matches: newMatches };
      onChange(JSON.stringify(answer));
    }
  };

  // Get which answer is matched to which cell
  const getMatchedAnswerForCell = (cellId: string) => {
    const answerId = Object.keys(matches).find(
      (aid) => matches[aid] === cellId
    );
    return answerId ? shuffledAnswers.find((a) => a.id === answerId) : null;
  };

  // Check if answer is already matched
  const isAnswerMatched = (answerId: string) => {
    return answerId in matches;
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
          <div className="text-base md:text-lg lg:text-xl font-medium text-slate-700">Ячейки:</div>

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
                <div className="flex items-center">
                  {answerForRow && (
                    <div
                      draggable={!answerIsMatched}
                      onDragStart={() => handleDragStart(answerForRow.id)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        answerIsMatched
                          ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                          : draggedAnswerId === answerForRow.id
                          ? "bg-blue-100 border-blue-400 scale-105 cursor-grabbing"
                          : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md cursor-move"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {answerForRow.imageUrl && (
                          <div className="relative w-8 h-8 shrink-0">
                            <Image
                              src={answerForRow.imageUrl}
                              alt=""
                              fill
                              className="object-cover rounded"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="text-base md:text-lg lg:text-xl font-medium text-gray-800 wrap-break-word">
                          {answerForRow.text || "Пусто"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow column */}
                <div className="flex items-center justify-center px-2">
                  <CgArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                {/* Cell column */}
                <div className="flex items-center">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(pair.id)}
                    className={`w-full min-h-[60px] p-4 rounded-lg border-2 transition-all ${
                      matchedAnswer
                        ? "bg-slate-100 border-slate-400"
                        : "bg-slate-50 border-slate-300 border-dashed hover:border-blue-400"
                    }`}
                  >
                    {matchedAnswer ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveMatch(matchedAnswer.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {matchedAnswer.imageUrl && (
                            <div className="relative w-8 h-8 shrink-0">
                              <Image
                                src={matchedAnswer.imageUrl}
                                alt=""
                                fill
                                className="object-cover rounded"
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
                      <div className="flex items-center justify-center min-h-[60px]">
                        <div className="text-center">
                          {pair.cell.imageUrl && (
                            <div className="relative w-10 h-10 mx-auto mb-2">
                              <Image
                                src={pair.cell.imageUrl}
                                alt=""
                                fill
                                className="object-cover rounded"
                                unoptimized
                              />
                            </div>
                          )}
                          <p className="text-base md:text-lg lg:text-xl text-slate-500">
                            {pair.cell.text || "Перетащите сюда"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TaskViewWrapper>
  );
}
