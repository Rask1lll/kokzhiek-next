"use client";

import { useMemo, useState } from "react";
import { parseData } from "@/app/libs/parseData";

type SortViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type Sorting = {
  columns: Column[];
};

type Column = {
  id: string;
  question: string;
  answerCards: AnswerCard[];
};

type AnswerCard = {
  id: string;
  text: string;
};

type UserAnswer = {
  assignments: Record<string, string>; // cardId -> columnId
};

function parseSortingData(value: string): Sorting {
  try {
    const parsed = parseData(value);
    if (parsed && Array.isArray(parsed.columns)) {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { columns: [] };
}

// Fisher-Yates shuffle with seed
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SortView({ value, onChange }: SortViewProps) {
  const data = useMemo(() => parseSortingData(value), [value]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [shuffleSeed] = useState(() => Math.random());

  // Collect all cards from all columns
  const allCards = useMemo(() => {
    const cards: (AnswerCard & { originalColumnId: string })[] = [];
    data.columns.forEach((column) => {
      column.answerCards.forEach((card) => {
        cards.push({ ...card, originalColumnId: column.id });
      });
    });
    return shuffleArrayWithSeed(cards, shuffleSeed);
  }, [data.columns, shuffleSeed]);

  // Get cards assigned to each column
  const getCardsInColumn = (columnId: string) => {
    return allCards.filter((card) => assignments[card.id] === columnId);
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(selectedCardId === cardId ? null : cardId);
  };

  const handleColumnSelect = (columnId: string) => {
    if (selectedCardId) {
      const newAssignments = { ...assignments, [selectedCardId]: columnId };
      setAssignments(newAssignments);
      setSelectedCardId(null);

      if (onChange) {
        const answer: UserAnswer = { assignments: newAssignments };
        onChange(JSON.stringify(answer));
      }
    }
  };

  const handleRemoveAssignment = (cardId: string) => {
    const newAssignments = { ...assignments };
    delete newAssignments[cardId];
    setAssignments(newAssignments);

    if (onChange) {
      const answer: UserAnswer = { assignments: newAssignments };
      onChange(JSON.stringify(answer));
    }
  };

  if (data.columns.length === 0) {
    return <p className="text-gray-400">Нет столбцов для сортировки</p>;
  }

  const getGridCols = (count: number) => {
    if (count === 0) return "grid-cols-1";
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-4";
    return "grid-cols-4"; // Максимум 4 столбца в ряд
  };

  return (
    <div className="w-full space-y-6">
      {/* Available cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-700">
          {selectedCardId
            ? "Карточка вопроса. Нажмите на ответы ниже:"
            : "Карточки (нажмите на карточку, затем выберите ответ):"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {allCards.map((card) => {
            const isAssigned = card.id in assignments;
            const isSelected = selectedCardId === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={isAssigned}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "bg-blue-100 border-blue-400 scale-105"
                    : isAssigned
                    ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                    : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md cursor-pointer"
                }`}
              >
                <span className="text-sm font-medium text-gray-800">
                  {card.text || "Пусто"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns grid */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-700">
          {selectedCardId
            ? "Нажмите на ответ, чтобы переместить карточку:"
            : "Ответы:"}
        </h3>
        <div className={`grid gap-4 ${getGridCols(data.columns.length)}`}>
          {data.columns.map((column) => {
            const cardsInColumn = getCardsInColumn(column.id);

            return (
              <div
                key={column.id}
                onClick={() => {
                  if (selectedCardId) {
                    handleColumnSelect(column.id);
                  }
                }}
                className={`p-4 rounded-lg border-2 min-h-[150px] transition-all ${
                  selectedCardId
                    ? "bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100 hover:shadow-md"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {/* Column header */}
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  {column.question || `Столбец ${Number(column.id) + 1}`}
                </h4>

                {/* Cards in column */}
                <div className="space-y-2">
                  {cardsInColumn.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Перетащите карточки сюда
                    </p>
                  ) : (
                    cardsInColumn.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between bg-white rounded border border-slate-200"
                      >
                        <span className="text-sm text-wrap wrap-anywhere text-gray-800">
                          {card.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(card.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
