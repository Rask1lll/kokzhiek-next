"use client";

import Button from "@/app/components/Button/Button";
import { parseData } from "@/app/libs/parseData";
import { useMemo } from "react";
import { FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";

type OrderProps = {
  value: string;
  onChange: (value: string) => void;
};

type OrderItem = {
  id: string;
  text: string;
  imageUrl?: string;
};

type OrderData = {
  answers: OrderItem[];
  layout: "horizontal" | "vertical";
  imagePosition: "above" | "below";
};

function parseOrderData(value: string): OrderData | undefined {
  try {
    const parsed = parseData(value);
    if (parsed && Array.isArray(parsed.answers)) {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function Order({ value, onChange }: OrderProps) {
  const validateData = useMemo(() => parseOrderData(value), [value]);

  const data: OrderData = validateData ?? {
    answers: [],
    layout: "vertical",
    imagePosition: "below",
  };

  const updateData = (newData: OrderData) => {
    onChange(JSON.stringify(newData));
  };

  const addAnswer = () => {
    const newAnswer: OrderItem = {
      id: String(data.answers.length),
      text: "",
    };
    updateData({ ...data, answers: [...data.answers, newAnswer] });
  };

  const removeAnswer = (id: string) => {
    if (data.answers.length <= 2) return; // Минимум 2 ответа
    updateData({
      ...data,
      answers: data.answers.filter((ans) => ans.id !== id),
    });
  };

  const moveAnswer = (id: string, direction: "up" | "down") => {
    const index = data.answers.findIndex((ans) => ans.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === data.answers.length - 1)
    ) {
      return;
    }

    const newAnswers = [...data.answers];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newAnswers[index], newAnswers[swapIndex]] = [
      newAnswers[swapIndex],
      newAnswers[index],
    ];
    updateData({ ...data, answers: newAnswers });
  };

  const updateAnswer = (id: string, updates: Partial<OrderItem>) => {
    updateData({
      ...data,
      answers: data.answers.map((ans) =>
        ans.id === id ? { ...ans, ...updates } : ans
      ),
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Settings bar */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        {/* Layout */}
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Макет:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => updateData({ ...data, layout: "horizontal" })}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                data.layout === "horizontal"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Рядом
            </button>
            <button
              type="button"
              onClick={() => updateData({ ...data, layout: "vertical" })}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                data.layout === "vertical"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Друг под другом
            </button>
          </div>
        </div> */}

        {/* Image position */}
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Изображение:</span>
          <select
            value={data.imagePosition}
            onChange={(e) =>
              updateData({
                ...data,
                imagePosition: e.target.value as "above" | "below",
              })
            }
            className="px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="above">Над текстом</option>
            <option value="below">Под текстом</option>
          </select>
        </div> */}
      </div>

      {/* Answers list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Ответы в правильной последовательности:
          </span>
          <Button
            content="+ Добавить ответ"
            color="green"
            size="sm"
            onClick={addAnswer}
          />
        </div>

        {data.answers.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            Нет ответов. Нажмите «Добавить ответ» чтобы создать.
          </div>
        )}

        {data.answers.map((answer, index) => (
          <div
            key={answer.id}
            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {/* Order number */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded">
              {index + 1}
            </div>

            {/* Text input */}
            <input
              type="text"
              value={answer.text}
              onChange={(e) =>
                updateAnswer(answer.id, { text: e.target.value })
              }
              placeholder={`Ответ ${index + 1}`}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Image button */}
            {/* <button
              type="button"
              onClick={() => {
                const hasImage = !!answer.imageUrl;
                updateAnswer(answer.id, {
                  imageUrl: hasImage ? undefined : "placeholder",
                });
              }}
              className={`p-2 rounded transition-colors ${
                answer.imageUrl
                  ? "bg-pink-100 text-pink-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title="Добавить изображение"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button> */}

            {/* Move up */}
            <button
              type="button"
              onClick={() => moveAnswer(answer.id, "up")}
              disabled={index === 0}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Переместить вверх"
            >
              <FiChevronUp className="w-4 h-4" />
            </button>

            {/* Move down */}
            <button
              type="button"
              onClick={() => moveAnswer(answer.id, "down")}
              disabled={index === data.answers.length - 1}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Переместить вниз"
            >
              <FiChevronDown className="w-4 h-4" />
            </button>

            {/* Remove answer */}
            <button
              type="button"
              onClick={() => removeAnswer(answer.id)}
              disabled={data.answers.length <= 2}
              className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Удалить ответ"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
