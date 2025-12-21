"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";

type SingleChoiceViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
};

type UserAnswer = {
  selectedOptionId: number | null;
};

export default function SingleChoiceView({
  widgetId,
  onChange,
}: SingleChoiceViewProps) {
  const { questions, loading, error } = useQuestions(widgetId);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // Ensure questions is an array
  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];

  console.log("SingleChoiceView - widgetId:", widgetId);
  console.log("SingleChoiceView - loading:", loading);
  console.log("SingleChoiceView - error:", error);
  console.log("SingleChoiceView - questions:", questions);
  console.log("SingleChoiceView - questionsArray:", questionsArray);
  console.log("SingleChoiceView - currentQuestion:", currentQuestion);
  console.log("SingleChoiceView - options:", options);

  const handleSelect = (optionId: number | undefined) => {
    if (optionId === undefined) return;

    setSelectedOptionId(optionId);

    if (onChange) {
      const answer: UserAnswer = { selectedOptionId: optionId };
      onChange(JSON.stringify(answer));
    }
  };

  if (loading) {
    return <p className="text-gray-400">Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Ошибка загрузки: {error}</p>
        <p className="text-sm text-red-500 mt-1">Widget ID: {widgetId}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">Вопрос не найден</p>
        <p className="text-sm text-yellow-500 mt-1">
          Widget ID: {widgetId}, Questions count: {questionsArray.length}
        </p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">Нет вариантов ответа</p>
        <p className="text-sm text-yellow-500 mt-1">
          Вопрос: {currentQuestion.body}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-medium pl-2 text-gray-800">
        {currentQuestion.body}
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id || option.order}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              selectedOptionId === option.id
                ? "bg-blue-50 border-blue-300 shadow-sm"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={`single-choice-${widgetId}`}
              checked={selectedOptionId === option.id}
              onChange={() => handleSelect(option.id)}
              className="w-5 h-5 mt-0.5 border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-gray-800">{option.body}</span>
              {option.image_url && (
                <div className="relative w-full max-w-xs h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={option.image_url}
                    alt={option.body || "Изображение опции"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
