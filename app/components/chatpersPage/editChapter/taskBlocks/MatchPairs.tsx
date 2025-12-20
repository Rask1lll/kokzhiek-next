"use client";

import Button from "@/app/components/Button/Button";
import { useMemo } from "react";
import { FiX, FiChevronUp, FiChevronDown, FiImage, FiRefreshCw } from "react-icons/fi";

type MatchPairsProps = {
  value: string;
  onChange: (value: string) => void;
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

function parseData(value: string): MatchPairsData | undefined {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.pairs)) {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function MatchPairs({ value, onChange }: MatchPairsProps) {
  const validateData = useMemo(() => parseData(value), [value]);

  const data: MatchPairsData = validateData ?? {
    pairs: [],
    shuffleInOpiq: true,
  };

  const updateData = (newData: MatchPairsData) => {
    onChange(JSON.stringify(newData));
  };

  const addPair = () => {
    const newPair: PairItem = {
      id: String(data.pairs.length),
      answer: { text: "" },
      cell: { text: "" },
    };
    updateData({ ...data, pairs: [...data.pairs, newPair] });
  };

  const removePair = (id: string) => {
    updateData({ ...data, pairs: data.pairs.filter((p) => p.id !== id) });
  };

  const updatePair = (id: string, updates: Partial<PairItem>) => {
    const newPairs = data.pairs.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateData({ ...data, pairs: newPairs });
  };

  const updateAnswer = (
    id: string,
    field: "text" | "imageUrl",
    value: string
  ) => {
    const pair = data.pairs.find((p) => p.id === id);
    if (pair) {
      updatePair(id, {
        answer: { ...pair.answer, [field]: value },
      });
    }
  };

  const updateCell = (
    id: string,
    field: "text" | "imageUrl",
    value: string
  ) => {
    const pair = data.pairs.find((p) => p.id === id);
    if (pair) {
      updatePair(id, {
        cell: { ...pair.cell, [field]: value },
      });
    }
  };

  const shuffleAnswers = () => {
    const shuffled = [...data.pairs].sort(() => Math.random() - 0.5);
    updateData({ ...data, pairs: shuffled });
  };

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.shuffleInOpiq}
            onChange={(e) =>
              updateData({ ...data, shuffleInOpiq: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600">
            Перемешивать варианты ответа при каждом решении
          </span>
        </label>
      </div>

      {/* Pairs list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Пары (вариант ответа → ячейка):
          </span>
          <div className="flex gap-2">
            <Button
              content="Перемешать"
              icon={<FiRefreshCw className="w-3.5 h-3.5" />}
              color="slate"
              size="sm"
              onClick={shuffleAnswers}
            />
            <Button
              content="+ Добавить пару"
              color="green"
              size="sm"
              onClick={addPair}
            />
          </div>
        </div>

        {data.pairs.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            Нет пар. Нажмите «Добавить пару» чтобы создать.
          </div>
        )}

        {data.pairs.map((pair, index) => (
          <div
            key={pair.id}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">
                Пара #{index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Удалить пару"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Вариант ответа:
                  </span>
                  <input
                    type="text"
                    value={pair.answer.text}
                    onChange={(e) =>
                      updateAnswer(pair.id, "text", e.target.value)
                    }
                    placeholder="Введите вариант ответа..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const hasImage = !!pair.answer.imageUrl;
                    updateAnswer(
                      pair.id,
                      "imageUrl",
                      hasImage ? "" : "placeholder"
                    );
                  }}
                  className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                    pair.answer.imageUrl
                      ? "bg-pink-100 text-pink-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <FiImage className="w-3 h-3" />
                  {pair.answer.imageUrl
                    ? "Удалить изображение"
                    : "Добавить изображение"}
                </button>
              </div>

              {/* Cell (ячейка) */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-slate-500 mb-1 block">
                    Ячейка:
                  </span>
                  <input
                    type="text"
                    value={pair.cell.text}
                    onChange={(e) =>
                      updateCell(pair.id, "text", e.target.value)
                    }
                    placeholder="Введите текст ячейки..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const hasImage = !!pair.cell.imageUrl;
                    updateCell(
                      pair.id,
                      "imageUrl",
                      hasImage ? "" : "placeholder"
                    );
                  }}
                  className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                    pair.cell.imageUrl
                      ? "bg-pink-100 text-pink-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <FiImage className="w-3 h-3" />
                  {pair.cell.imageUrl
                    ? "Удалить изображение"
                    : "Добавить изображение"}
                </button>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center justify-center mt-3 text-slate-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
