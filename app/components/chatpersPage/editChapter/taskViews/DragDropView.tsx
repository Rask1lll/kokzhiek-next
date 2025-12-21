import { parseData } from "@/app/libs/parseData";
import { JSX, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type Cell = {
  id: string;
  answer: string | null;
  userAnswer: string | null;
};

type DragDrop = {
  content: string;
  cells: Cell[];
};

export default function DragDropView({ value }: Props) {
  const [data, setData] = useState<DragDrop>(parseData(value));
  const [chosenElement, setChosenElement] = useState<Cell | null>(null);
  const [usedCardIds, setUsedCardIds] = useState<Set<string>>(new Set());

  function getElement(
    content: string,
    elIds: string[],
    cells: Cell[],
    onClick: (c: Cell) => void,
    removeOnClick: (c: Cell) => void
  ): JSX.Element {
    const parts = content.split(/(\{\{\{\d+\}\}\})/g);

    return (
      <div className="flex flex-wrap items-center gap-2">
        {parts.map((part, index) => {
          const match = part.match(/\{\{\{(\d+)\}\}\}/);

          if (match) {
            const idx = Number(match[1]);
            const hasAnswer = !!cells[idx].userAnswer;

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
                data-id={elIds[idx]}
                onClick={() => {
                  hasAnswer ? removeOnClick(cells[idx]) : onClick(cells[idx]);
                }}
              >
                {!cells[idx].userAnswer ? "?" : cells[idx].userAnswer}
              </div>
            );
          }

          return (
            <span className="text-lg text-gray-700" key={`text-${index}`}>
              {part}
            </span>
          );
        })}
      </div>
    );
  }

  // Храним связь: cellId -> cardId (какая карточка использована в какой ячейке)
  const [cellToCardMap, setCellToCardMap] = useState<Map<string, string>>(
    new Map()
  );

  function choseCell(cell: Cell) {
    if (!chosenElement) return;

    const res: Cell[] = data.cells.map((el) => {
      return cell.id !== el.id
        ? el
        : { ...el, userAnswer: chosenElement.answer };
    });
    setData({ ...data, cells: res });

    // Добавляем id карточки в использованные и сохраняем связь
    setUsedCardIds((prev) => new Set(prev).add(chosenElement.id));
    setCellToCardMap((prev) => new Map(prev).set(cell.id, chosenElement.id));
    setChosenElement(null);
  }

  function removeChoseCell(cell: Cell) {
    // Находим id карточки, которая была использована в этой ячейке
    const usedCardId = cellToCardMap.get(cell.id);

    const res: Cell[] = data.cells.map((el) => {
      return cell.id !== el.id ? el : { ...el, userAnswer: null };
    });
    setData({ ...data, cells: res });

    // Убираем карточку из использованных
    if (usedCardId) {
      setUsedCardIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(usedCardId);
        return newSet;
      });
      setCellToCardMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(cell.id);
        return newMap;
      });
    }
  }

  // Фильтруем доступные карточки (убираем использованные по id)
  const availableCards = data.cells.filter(
    (el) => el.answer && !usedCardIds.has(el.id)
  );

  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-sm">
      {/* Карточки ответов */}
      <div className="mb-6">
        <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Выберите ответ
        </h6>
        <div className="flex flex-wrap gap-3">
          {availableCards.length > 0 ? (
            availableCards.map((el) => {
              const isChosen = chosenElement && el.id === chosenElement.id;
              return (
                <div
                  key={el.id}
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
                    isChosen ? setChosenElement(null) : setChosenElement(el);
                  }}
                >
                  {el.answer}
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
        {getElement(
          data.content,
          data.cells.map((el) => el.id),
          data.cells,
          choseCell,
          removeChoseCell
        )}
      </div>

      {/* Подсказка */}
      {chosenElement && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            💡 Выбрано: <strong>{chosenElement.answer}</strong> — нажмите на
            пропуск, чтобы вставить
          </p>
        </div>
      )}
    </div>
  );
}
