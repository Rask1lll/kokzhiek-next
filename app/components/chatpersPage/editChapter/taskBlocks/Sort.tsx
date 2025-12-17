"use client";

import Button from "@/app/components/Button/Button";
import { parseData } from "@/app/libs/parseData";
import { useMemo, useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import style from "./Sort.module.css";

type Props = {
  value: string;
  onChange: (s: string) => void;
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

function parseSortingData(value: string): Sorting | undefined {
  try {
    const parsed = parseData(value);
    if (parsed && Array.isArray(parsed.columns)) {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function Sort({ value, onChange }: Props) {
  const validateData = useMemo(() => parseSortingData(value), [value]);

  const [data, setData] = useState<Sorting>(() => {
    return validateData ?? { columns: [] };
  });

  const updateData = (newData: Sorting) => {
    setData(newData);
    onChange(JSON.stringify(newData));
  };

  const addColumn = () => {
    const newColumn: Column = {
      id: String(data.columns.length),
      question: "",
      answerCards: [],
    };
    updateData({ ...data, columns: [...data.columns, newColumn] });
  };

  const removeColumn = (columnId: string) => {
    if (data.columns.length <= 2) return; // Минимум 2 столбца
    updateData({
      ...data,
      columns: data.columns.filter((col) => col.id !== columnId),
    });
  };

  const updateColumnQuestion = (columnId: string, question: string) => {
    updateData({
      ...data,
      columns: data.columns.map((col) =>
        col.id === columnId ? { ...col, question } : col
      ),
    });
  };

  const addCardToColumn = (columnId: string) => {
    const column = data.columns.find((col) => col.id === columnId);
    if (!column) return;

    const newCard: AnswerCard = {
      id: `${columnId}-${column.answerCards.length}`,
      text: "",
    };

    updateData({
      ...data,
      columns: data.columns.map((col) =>
        col.id === columnId
          ? { ...col, answerCards: [...col.answerCards, newCard] }
          : col
      ),
    });
  };

  const removeCardFromColumn = (columnId: string, cardId: string) => {
    updateData({
      ...data,
      columns: data.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              answerCards: col.answerCards.filter((card) => card.id !== cardId),
            }
          : col
      ),
    });
  };

  const updateCardText = (columnId: string, cardId: string, text: string) => {
    updateData({
      ...data,
      columns: data.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              answerCards: col.answerCards.map((card) =>
                card.id === cardId ? { ...card, text } : card
              ),
            }
          : col
      ),
    });
  };

  const getGridCols = (count: number) => {
    if (count === 0) return "grid-cols-1";
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-4";
    return "grid-cols-4"; // Максимум 4 столбца в ряд
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Столбцы для сортировки:
        </span>
        <Button
          content="+ Добавить столбец"
          color="green"
          size="sm"
          onClick={addColumn}
        />
      </div>

      {data.columns.length === 0 && (
        <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
          Нет столбцов. Нажмите «Добавить столбец» чтобы создать.
        </div>
      )}

      {/* Columns grid */}
      {data.columns.length > 0 && (
        <div className={`grid w-full gap-4 ${style.sortGrid}`}>
          {data.columns.map((column) => (
            <div
              key={column.id}
              className="p-4 w-full bg-white rounded-lg border-2 border-slate-200 space-y-3"
            >
              {/* Column header */}
              <div className="flex items-center w-full justify-between gap-2">
                <input
                  type="text"
                  value={column.question}
                  onChange={(e) =>
                    updateColumnQuestion(column.id, e.target.value)
                  }
                  placeholder="Название "
                  className="flex-1 px-3 py-2 w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(column.id)}
                  disabled={data.columns.length <= 2}
                  className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Удалить столбец"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Cards in column */}
              <div className="space-y-2 min-h-[100px]">
                {column.answerCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200"
                  >
                    <input
                      type="text"
                      value={card.text}
                      onChange={(e) =>
                        updateCardText(column.id, card.id, e.target.value)
                      }
                      placeholder="Текст..."
                      className="flex-1 px-2 py-1 w-full text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeCardFromColumn(column.id, card.id)}
                      className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                      title="Удалить карточку"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add card button */}
                <button
                  type="button"
                  onClick={() => addCardToColumn(column.id)}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-500 border-2 border-dashed border-slate-300 rounded hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Добавить карточку
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
