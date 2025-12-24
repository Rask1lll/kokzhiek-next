"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type DragDropViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
};

type UserAnswer = {
  cellAnswers: Record<string, number>; // cellId (position) -> optionId
};

export default function DragDropView({
  widgetId,
  onChange,
}: DragDropViewProps) {
  const { questions } = useQuestions(widgetId);
  const [chosenElement, setChosenElement] = useState<number | null>(null);
  const [usedCardIds, setUsedCardIds] = useState<Set<number>>(new Set());
  const [cellToCardMap, setCellToCardMap] = useState<Map<string, number>>(
    new Map()
  );

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const body = currentQuestion?.body || "";
  const data = currentQuestion?.data as { cells?: string[] } | undefined;

  const cells = useMemo(() => data?.cells || [], [data?.cells]);
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  // Get available answer options (options that are not cells)
  const availableCards = useMemo(() => {
    return options.filter(
      (opt) =>
        opt.id &&
        !cells.includes(opt.position?.toString() || "") &&
        !usedCardIds.has(opt.id)
    );
  }, [options, cells, usedCardIds]);

  const handleCellClick = (cellId: string) => {
    if (!chosenElement) {
      // If no card is chosen, remove existing answer from cell
      const usedCardId = cellToCardMap.get(cellId);
      if (usedCardId) {
        setUsedCardIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(usedCardId);
          return newSet;
        });
        setCellToCardMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cellId);
          return newMap;
        });

        if (onChange) {
          const cellAnswers: Record<string, number> = {};
          cellToCardMap.forEach((cardId, cId) => {
            if (cId !== cellId) {
              cellAnswers[cId] = cardId;
            }
          });
          const answer: UserAnswer = { cellAnswers };
          onChange(JSON.stringify(answer));
        }
      }
      return;
    }

    // Place chosen card in cell
    setUsedCardIds((prev) => new Set(prev).add(chosenElement));
    setCellToCardMap((prev) => new Map(prev).set(cellId, chosenElement));
    setChosenElement(null);

    if (onChange) {
      const cellAnswers: Record<string, number> = {};
      cellToCardMap.forEach((cardId, cId) => {
        cellAnswers[cId] = cardId;
      });
      cellAnswers[cellId] = chosenElement;
      const answer: UserAnswer = { cellAnswers };
      onChange(JSON.stringify(answer));
    }
  };

  // Render text with inline cell placeholders
  const renderContent = () => {
    const parts = body.split(/(\{\{\{[^}]+\}\}\})/g);

    return (
      <div className="flex flex-wrap items-center gap-2">
        {parts.map((part, index) => {
          const match = part.match(/\{\{\{([^}]+)\}\}\}/);
          if (match) {
            const cellId = match[1];
            if (cells.includes(cellId)) {
              const usedCardId = cellToCardMap.get(cellId);
              const cardOption = usedCardId
                ? options.find((opt) => opt.id === usedCardId)
                : null;
              const hasAnswer = !!cardOption;

              return (
                <div
                  key={`placeholder-${index}`}
                  className={`
                    px-4 py-2 min-w-[80px] text-center rounded-lg cursor-pointer
                    transition-all duration-200 font-medium
                    ${
                      hasAnswer
                        ? "bg-green-100 text-green-700 border-2 border-green-400 shadow-sm hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }
                  `}
                  onClick={() => handleCellClick(cellId)}
                >
                  {!cardOption ? "?" : cardOption.body}
                </div>
              );
            }
          }
          return (
            <span className="text-lg text-gray-700" key={`text-${index}`}>
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  if (!currentQuestion || !body) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId} showQuestionBody={false}>
      <div className="w-full p-4 bg-white rounded-xl shadow-sm">
        {/* Карточки ответов */}
        <div className="mb-6">
          <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Выберите ответ
          </h6>
          <div className="flex flex-wrap gap-3">
            {availableCards.length > 0 ? (
              availableCards.map((option) => {
                const isChosen = chosenElement === option.id;
                return (
                  <div
                    key={option.id}
                    className={`
                    px-4 py-2 rounded-lg cursor-pointer font-medium
                    transition-all duration-200 select-none
                    ${
                      isChosen
                        ? "bg-blue-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }
                  `}
                    onClick={() => {
                      setChosenElement(isChosen ? null : option.id!);
                    }}
                  >
                    {option.body}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm italic">
                Все ответы использованы
              </p>
            )}
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Область с текстом и ячейками */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Заполните пропуски
          </h6>
          {renderContent()}
        </div>

        {/* Подсказка */}
        {chosenElement && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              💡 Выбрано:{" "}
              <strong>
                {options.find((opt) => opt.id === chosenElement)?.body}
              </strong>{" "}
              — нажмите на пропуск, чтобы вставить
            </p>
          </div>
        )}
      </div>
    </TaskViewWrapper>
  );
}
