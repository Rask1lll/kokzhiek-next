"use client";

import { useEffect, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";

type OrderViewProps = {
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

export default function OrderView({ widgetId }: OrderViewProps) {
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [shuffleSeed] = useState(() => Math.random());
  const [result, setResult] = useState<{ is_correct: boolean; points_earned: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];

  // Initialize user order with shuffled option IDs
  const [userOrder, setUserOrder] = useState<number[]>(() => {
    const optionIds = options
      .filter((opt) => opt.id !== undefined)
      .map((opt) => opt.id!)
      .sort(
        (a, b) =>
          (options.find((o) => o.id === a)?.order || 0) -
          (options.find((o) => o.id === b)?.order || 0)
      );
    return shuffleArrayWithSeed(optionIds, shuffleSeed);
  });

  // Update userOrder when options change
  useEffect(() => {
    if (options.length > 0 && userOrder.length === 0) {
      const optionIds = options
        .filter((opt) => opt.id !== undefined)
        .map((opt) => opt.id!)
        .sort(
          (a, b) =>
            (options.find((o) => o.id === a)?.order || 0) -
            (options.find((o) => o.id === b)?.order || 0)
        );
      if (optionIds.length > 0) {
        setUserOrder(shuffleArrayWithSeed(optionIds, shuffleSeed));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length, shuffleSeed]);

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
    setResult(null);
  };

  // Get option by id
  const getOptionById = (id: number) => {
    return options.find((opt) => opt.id === id);
  };

  if (!currentQuestion || options.length === 0) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-base md:text-lg lg:text-xl text-slate-600">
            Расположите ответы в правильном порядке:
          </p>
        </div>

        {/* Answers list */}
        <div className="flex flex-col gap-3">
          {userOrder.map((optionId, index) => {
            const option = getOptionById(optionId);
            if (!option) return null;

            return (
              <div
                key={optionId}
                className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-300 w-full"
              >
                {/* Image */}
                {option.image_url && (
                  <div className="relative w-12 h-12 shrink-0">
                    <Image
                      src={option.image_url}
                      alt={option.body || ""}
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <p className="text-base md:text-lg lg:text-xl font-medium text-gray-800">
                    {option.body || "Пусто"}
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
                {result.is_correct ? "✓ Правильно!" : "✗ Неправильно"}
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
              if (userOrder.length === 0 || !currentQuestion?.id) {
                return;
              }

              setSubmitting(true);
              // Преобразуем массив id в массив строк
              const order = userOrder.map((id) => id.toString());
              const answer = { order };
              
              const response = await submit(currentQuestion.id, answer);
              
              if (response) {
                setResult(response);
              }
              
              setSubmitting(false);
            }}
            disabled={userOrder.length === 0 || submitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting || loading ? "Отправка..." : "Отправить ответ"}
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}
