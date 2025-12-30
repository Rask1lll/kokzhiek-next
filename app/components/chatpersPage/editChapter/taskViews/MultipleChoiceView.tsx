"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type MultipleChoiceViewProps = {
  widgetId: number;
};

export default function MultipleChoiceView({
  widgetId,
}: MultipleChoiceViewProps) {
  const { questions } = useQuestions(widgetId);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];

  const handleToggle = (optionId: number | undefined) => {
    if (optionId === undefined) return;

    const newSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    setSelectedIds(newSelected);
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      console.log("Ответ не выбран");
      return;
    }
    const answer = { selected_ids: selectedIds };
    console.log("Ответ ученика (multiple_choice):", answer);
  };

  if (!currentQuestion || options.length === 0) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id || option.order}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              selectedIds.includes(option.id!)
                ? "bg-blue-50 border-blue-300 shadow-sm"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(option.id!)}
              onChange={() => handleToggle(option.id)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-lg md:text-xl lg:text-2xl text-gray-800">
                {option.body}
              </span>
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
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Отправить ответ
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}
