"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";
import { BiTrash } from "react-icons/bi";

type SearchWordViewProps = {
  widgetId: number;
};

type GridData = {
  size: number;
  Cells: Cell[];
};

type Cell = {
  id: string;
  symbol: string;
};

type answer = {
  id: string;
  answer: string;
};

const gridType = (size: number) => {
  switch (size) {
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    case 7:
      return "grid-cols-7";
    case 8:
      return "grid-cols-8";
    case 9:
      return "grid-cols-9";
    case 10:
      return "grid-cols-10";
    default:
      return "grid-cols-3";
  }
};

export default function SearchWordView({ widgetId }: SearchWordViewProps) {
  const { questions } = useQuestions(widgetId);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [answers, setAnswers] = useState<answer[]>([]);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const data = currentQuestion?.data as GridData | undefined;

  const gridData = useMemo<GridData>(() => {
    if (!data) {
      return { size: 3, Cells: [] };
    }

    if (typeof data.size === "number" && Array.isArray(data.Cells)) {
      return {
        size: data.size,
        Cells: data.Cells,
      };
    }

    return { size: 3, Cells: [] };
  }, [data]);

  // Определить направление между двумя ячейками
  const getDirection = (
    index1: number,
    index2: number,
    size: number
  ): "horizontal" | "vertical" | "diagonal" | null => {
    const row1 = Math.floor(index1 / size);
    const col1 = index1 % size;
    const row2 = Math.floor(index2 / size);
    const col2 = index2 % size;

    const rowDiff = row2 - row1;
    const colDiff = col2 - col1;

    // Горизонтальное направление (только по столбцам)
    if (rowDiff === 0 && Math.abs(colDiff) === 1) {
      return "horizontal";
    }
    // Вертикальное направление (только по строкам)
    if (colDiff === 0 && Math.abs(rowDiff) === 1) {
      return "vertical";
    }
    // Диагональное направление
    if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
      return "diagonal";
    }

    return null;
  };

  // Проверка, соответствует ли новая ячейка текущему направлению
  const isValidNextCell = (
    selectedIndices: number[],
    newIndex: number,
    size: number
  ): boolean => {
    if (selectedIndices.length === 0) {
      return true; // Первая ячейка - всегда валидна
    }

    if (selectedIndices.length === 1) {
      // Вторая ячейка - определяем направление
      const direction = getDirection(selectedIndices[0], newIndex, size);
      return direction !== null;
    }

    // Для третьей и последующих ячеек - проверяем, что направление сохраняется
    const lastIndex = selectedIndices[selectedIndices.length - 1];
    const newDirection = getDirection(lastIndex, newIndex, size);

    if (!newDirection) return false;

    // Определяем направление между первой и второй ячейкой
    const initialDirection = getDirection(
      selectedIndices[0],
      selectedIndices[1],
      size
    );

    // Новое направление должно совпадать с начальным
    return newDirection === initialDirection;
  };

  // Обработка клика по ячейке
  const handleCellClick = (index: number) => {
    setSelectedIndices((prev) => {
      // Если ячейка уже выбрана, удаляем её и все последующие
      const existingIndex = prev.indexOf(index);
      if (existingIndex !== -1) {
        return prev.slice(0, existingIndex + 1);
      }

      // Проверяем, валидна ли новая ячейка для текущего направления
      if (isValidNextCell(prev, index, gridData.size)) {
        return [...prev, index];
      }

      // Если не валидна, начинаем новую последовательность
      return [index];
    });
  };

  // Получить текущее слово из выбранных букв
  const getCurrentWord = (): string => {
    return selectedIndices
      .map((index) => gridData.Cells[index]?.symbol || "")
      .join("")
      .toUpperCase();
  };

  // Добавить найденное слово в ответы
  const addFoundWord = () => {
    const word = getCurrentWord();
    if (word.length > 0) {
      setAnswers((prev) => [
        ...prev,
        { id: String(prev.length), answer: word },
      ]);
      setSelectedIndices([]);
    }
  };

  // Очистить выбранные ячейки
  const clearSelection = () => {
    setSelectedIndices([]);
  };

  if (!currentQuestion || gridData.Cells.length === 0) {
    return null;
  }

  function deleteAnswer(id: string) {
    setAnswers((prev) => prev.filter((el) => el.id !== id));
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <>
        <div
          className={`w-full h-full grid ring ring-gray-500 rounded-xl ${gridType(
            gridData.size
          )}`}
        >
          {gridData.Cells.map((el, i) => {
            const isSelected = selectedIndices.includes(i);
            const isLastSelected =
              selectedIndices[selectedIndices.length - 1] === i;

            return (
              <div
                key={i}
                onClick={() => handleCellClick(i)}
                className={`text-xl md:text-2xl lg:text-3xl h-full min-h-7 text-center uppercase ring ring-gray-300 py-2 cursor-pointer transition-colors select-none ${
                  isSelected
                    ? isLastSelected
                      ? "bg-blue-400 ring-blue-500 ring-2"
                      : "bg-blue-200 ring-blue-300"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {el.symbol}
              </div>
            );
          })}
        </div>

        {selectedIndices.length > 0 && (
          <div className="w-full mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-1">Выбранное слово:</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-700 uppercase">
                  {getCurrentWord()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addFoundWord}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Добавить
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Очистить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full mt-3">
          <div className="flex flex-col gap-2">
            <p className="text-base md:text-lg lg:text-xl font-semibold">Найденные слова:</p>
            {answers.length === 0 ? (
              <p className="text-gray-400 text-base md:text-lg lg:text-xl">Пока не найдено слов</p>
            ) : (
              answers.map((el, i) => {
                return (
                  <div className="flex gap-2 items-center" key={el.id}>
                    <span className="text-lg md:text-xl lg:text-2xl w-4">{i + 1}.</span>
                    <div className="ring ring-gray-300 p-2 rounded-lg bg-gray-50 font-semibold text-lg md:text-xl lg:text-2xl uppercase">
                      {el.answer}
                    </div>
                    <div onClick={() => deleteAnswer(el.id)}>
                      <BiTrash className="bg-red-200/50 rounded-full cursor-pointer text-red-400 w-7 h-7 p-1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              if (answers.length === 0) {
                console.log("Ответ не заполнен");
                return;
              }
              // Извлекаем массив найденных слов
              const found = answers.map((a) => a.answer);
              const answer = { found };
              console.log("Ответ ученика (word_search):", answer);
            }}
            disabled={answers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Отправить ответ
          </button>
        </div>
      </>
    </TaskViewWrapper>
  );
}
