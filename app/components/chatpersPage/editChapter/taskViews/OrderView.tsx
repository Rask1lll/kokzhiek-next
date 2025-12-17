"use client";

import { useMemo, useState } from "react";
import { parseData } from "@/app/libs/parseData";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

type OrderViewProps = {
  value: string;
  onChange?: (value: string) => void;
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

type UserAnswer = {
  order: string[]; // массив id в порядке, который выбрал пользователь
};

function parseOrderData(value: string): OrderData {
  try {
    const parsed = parseData(value);
    if (parsed && Array.isArray(parsed.answers)) {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { answers: [], layout: "vertical", imagePosition: "below" };
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

export default function OrderView({ value, onChange }: OrderViewProps) {
  const data = useMemo(() => parseOrderData(value), [value]);
  const [shuffleSeed] = useState(() => Math.random());
  const [userOrder, setUserOrder] = useState<string[]>(() => {
    // Инициализация: перемешанный порядок
    const shuffled = shuffleArrayWithSeed(
      data.answers.map((a) => a.id),
      shuffleSeed
    );
    return shuffled;
  });

  // Перемешать заново
  const reshuffle = () => {
    const shuffled = shuffleArrayWithSeed(
      data.answers.map((a) => a.id),
      Math.random()
    );
    setUserOrder(shuffled);
    if (onChange) {
      const answer: UserAnswer = { order: shuffled };
      onChange(JSON.stringify(answer));
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === userOrder.length - 1)
    ) {
      return;
    }

    const newOrder = [...userOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [
      newOrder[swapIndex],
      newOrder[index],
    ];
    setUserOrder(newOrder);

    if (onChange) {
      const answer: UserAnswer = { order: newOrder };
      onChange(JSON.stringify(answer));
    }
  };

  // Get answer by id
  const getAnswerById = (id: string) => {
    return data.answers.find((a) => a.id === id);
  };

  if (data.answers.length === 0) {
    return <p className="text-gray-400">Нет ответов для упорядочивания</p>;
  }

  const isHorizontal = data.layout === "horizontal";

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Расположите ответы в правильном порядке:
        </p>
        <button
          type="button"
          onClick={reshuffle}
          className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          🔄 Перемешать
        </button>
      </div>

      {/* Answers list */}
      <div
        className={`flex gap-3 ${
          isHorizontal ? "flex-row flex-wrap" : "flex-col"
        }`}
      >
        {userOrder.map((answerId, index) => {
          const answer = getAnswerById(answerId);
          if (!answer) return null;

          return (
            <div
              key={answerId}
              className={`flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-300 ${
                isHorizontal ? "flex-1 min-w-[200px]" : "w-full"
              }`}
            >
              {/* Image above */}
              {data.imagePosition === "above" && answer.imageUrl && (
                <img
                  src={answer.imageUrl}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
              )}

              {/* Content */}
              <div className="flex-1">
                {data.imagePosition === "below" && answer.imageUrl && (
                  <img
                    src={answer.imageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {answer.text || "Пусто"}
                </p>
              </div>

              {/* Move buttons */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="p-1.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Переместить вверх"
                >
                  <FiChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === userOrder.length - 1}
                  className="p-1.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Переместить вниз"
                >
                  <FiChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

