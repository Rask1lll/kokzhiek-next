"use client";

import { useMemo, useState } from "react";
import { CgArrowRight } from "react-icons/cg";

type MatchPairsViewProps = {
  value: string;
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

type MatchPairsData = {
  pairs: PairItem[];
  shuffleInOpiq: boolean;
};

type UserAnswer = {
  matches: Record<string, string>; // answerId -> cellId
};

function parseData(value: string): MatchPairsData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.pairs)) {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { pairs: [], shuffleInOpiq: true };
}

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
  value,
  onChange,
}: MatchPairsViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedAnswerId, setDraggedAnswerId] = useState<string | null>(null);

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

  if (data.pairs.length === 0) {
    return <p className="text-gray-400">Нет пар для соединения</p>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="text-sm text-slate-600 text-center">
        Перетащите варианты ответа в соответствующие ячейки
      </div>

      {/* Grid layout: each row = answer + arrow + cell */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Header row */}
        <div className="text-sm font-medium text-slate-700">
          Варианты ответа:
        </div>
        <div></div>
        <div className="text-sm font-medium text-slate-700">Ячейки:</div>

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
                        <img
                          src={answerForRow.imageUrl}
                          alt=""
                          className="w-8 h-8 object-cover rounded shrink-0"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-800 break-words">
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
                          <img
                            src={matchedAnswer.imageUrl}
                            alt=""
                            className="w-8 h-8 object-cover rounded shrink-0"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-800 break-words">
                          {matchedAnswer.text}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[60px]">
                      <div className="text-center">
                        {pair.cell.imageUrl && (
                          <img
                            src={pair.cell.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded mx-auto mb-2"
                          />
                        )}
                        <p className="text-sm text-slate-500">
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
  );
}
