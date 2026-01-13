"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";

type SortViewProps = {
  widgetId: number;
};

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

export default function SortView({ widgetId }: SortViewProps) {
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [shuffleSeed] = useState(() => Math.random());
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];
  const data = currentQuestion?.data as
    | {
        columns?: Array<{ id: string; question: string }>;
      }
    | undefined;
  const columns = data?.columns || [];

  // Group options by column (group)
  const columnsMap = useMemo(() => {
    const map: Record<
      string,
      { id: string; question: string; options: typeof options }
    > = {};
    columns.forEach((col) => {
      map[col.id] = {
        id: col.id,
        question: col.question,
        options: [],
      };
    });
    options.forEach((opt) => {
      if (opt.group && map[opt.group]) {
        map[opt.group].options.push(opt);
      }
    });
    return map;
  }, [columns, options]);

  // Collect all cards (options) from all columns
  const allCards = useMemo(() => {
    const cards = options
      .filter((opt) => opt.id !== undefined)
      .map((opt) => ({
        id: opt.id!,
        text: opt.body,
        imageUrl: opt.image_url,
        originalColumnId: opt.group || "",
      }));
    return shuffleArrayWithSeed(cards, shuffleSeed);
  }, [options, shuffleSeed]);

  // Get cards assigned to each column
  const getCardsInColumn = (columnId: string) => {
    return allCards.filter(
      (card) => assignments[card.id.toString()] === columnId
    );
  };

  const handleCardClick = (cardId: number) => {
    setSelectedCardId(selectedCardId === cardId ? null : cardId);
  };

  const handleColumnSelect = (columnId: string) => {
    if (selectedCardId !== null) {
      const newAssignments = {
        ...assignments,
        [selectedCardId.toString()]: columnId,
      };
      setAssignments(newAssignments);
      setSelectedCardId(null);
      setResult(null);
    }
  };

  const handleRemoveAssignment = (cardId: number) => {
    const newAssignments = { ...assignments };
    delete newAssignments[cardId.toString()];
    setAssignments(newAssignments);
    setResult(null);
  };

  if (!currentQuestion || columns.length === 0) {
    return null;
  }

  const getGridCols = (count: number) => {
    if (count === 0) return "grid-cols-1";
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-4";
    return "grid-cols-4";
  };

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full space-y-6">
        {/* Available cards */}
        <div className="space-y-2">
          <h3 className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {selectedCardId !== null
              ? "Карточка вопроса. Нажмите на ответы ниже:"
              : "Карточки (нажмите на карточку, затем выберите ответ):"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allCards.map((card) => {
              const isAssigned = card.id.toString() in assignments;
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
                  <div className="flex items-center gap-2">
                    {card.imageUrl && (
                      <div className="relative w-8 h-8 shrink-0">
                        <Image
                          src={card.imageUrl}
                          alt=""
                          fill
                          className="object-cover rounded"
                          unoptimized
                        />
                      </div>
                    )}
                    <span className="text-base md:text-lg lg:text-xl font-medium text-gray-800">
                      {card.text || "Пусто"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columns grid */}
        <div className="space-y-2">
          <h3 className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {selectedCardId !== null
              ? "Нажмите на ответ, чтобы переместить карточку:"
              : "Ответы:"}
          </h3>
          <div className={`grid gap-4 ${getGridCols(columns.length)}`}>
            {columns.map((col) => {
              const columnData = columnsMap[col.id];
              const cardsInColumn = getCardsInColumn(col.id);

              return (
                <div
                  key={col.id}
                  onClick={() => {
                    if (selectedCardId !== null) {
                      handleColumnSelect(col.id);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 min-h-[150px] transition-all ${
                    selectedCardId !== null
                      ? "bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100 hover:shadow-md"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {/* Column header */}
                  <h4 className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-3">
                    {columnData?.question || `Столбец ${Number(col.id) + 1}`}
                  </h4>

                  {/* Cards in column */}
                  <div className="space-y-2">
                    {cardsInColumn.length === 0 ? (
                      <p className="text-sm md:text-base lg:text-lg text-slate-400 text-center py-4">
                        Перетащите карточки сюда
                      </p>
                    ) : (
                      cardsInColumn.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between bg-white rounded border border-slate-200 p-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {card.imageUrl && (
                              <div className="relative w-6 h-6 shrink-0">
                                <Image
                                  src={card.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover rounded"
                                  unoptimized
                                />
                              </div>
                            )}
                            <span className="text-base md:text-lg lg:text-xl text-wrap wrap-anywhere text-gray-800">
                              {card.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(card.id)}
                            className="text-xs text-red-500 hover:text-red-700 ml-2"
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

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg border-2 ${
              result.is_correct
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
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
            onClick={async () => {
              if (
                Object.keys(assignments).length === 0 ||
                !currentQuestion?.id
              ) {
                return;
              }

              setSubmitting(true);
              // Преобразуем assignments: card_id (option.id) -> column_id (group)
              const answer = { assignments };

              const response = await submit(currentQuestion.id, answer);

              if (response) {
                setResult(response);
              }

              setSubmitting(false);
            }}
            disabled={
              Object.keys(assignments).length === 0 || submitting || loading
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
