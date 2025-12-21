import { parseData } from "@/app/libs/parseData";
import { useState } from "react";

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
  }
};

export default function SearchWordView({ value }: { value: string }) {
  const [data] = useState<GridData>(() => {
    const parse = parseData(value) ?? { size: 3, Cells: [] };
    return parse;
  });
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [answers, setAnswers] = useState<answer[]>([]);

  // Проверка, являются ли две ячейки соседними (горизонтально, вертикально или по диагонали)
  const isAdjacent = (
    index1: number,
    index2: number,
    size: number
  ): boolean => {
    const row1 = Math.floor(index1 / size);
    const col1 = index1 % size;
    const row2 = Math.floor(index2 / size);
    const col2 = index2 % size;

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    // Соседние если разница в строках и столбцах не больше 1
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  // Обработка клика по ячейке
  const handleCellClick = (index: number) => {
    setSelectedIndices((prev) => {
      // Если ячейка уже выбрана, удаляем её и все последующие
      const existingIndex = prev.indexOf(index);
      if (existingIndex !== -1) {
        return prev.slice(0, existingIndex + 1);
      }

      // Если это первая ячейка или ячейка соседняя с последней
      if (
        prev.length === 0 ||
        isAdjacent(prev[prev.length - 1], index, data.size)
      ) {
        return [...prev, index];
      }

      // Если не соседняя, начинаем новую последовательность
      return [index];
    });
  };

  // Получить текущее слово из выбранных букв
  const getCurrentWord = (): string => {
    return selectedIndices
      .map((index) => data.Cells[index]?.symbol || "")
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

  return (
    <>
      <div
        className={`w-full h-full grid ring ring-gray-500 rounded-xl ${gridType(
          data.size
        )}`}
      >
        {data.Cells.map((el, i) => {
          const isSelected = selectedIndices.includes(i);
          const isLastSelected =
            selectedIndices[selectedIndices.length - 1] === i;

          return (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className={`text-2xl h-full min-h-7 text-center uppercase ring ring-gray-300 py-2 cursor-pointer transition-colors select-none ${
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

      {/* Текущее выбранное слово */}
      {selectedIndices.length > 0 && (
        <div className="w-full mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Выбранное слово:</p>
              <p className="text-2xl font-bold text-blue-700 uppercase">
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

      {/* Список найденных слов */}
      <div className="w-full mt-3">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Найденные слова:</p>
          {answers.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока не найдено слов</p>
          ) : (
            answers.map((el, i) => {
              return (
                <div className="flex gap-2 items-center" key={el.id}>
                  <span className="text-xl w-4">{i + 1}.</span>
                  <div className="ring ring-gray-300 p-2 rounded-lg bg-gray-50 font-semibold text-lg uppercase">
                    {el.answer}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
