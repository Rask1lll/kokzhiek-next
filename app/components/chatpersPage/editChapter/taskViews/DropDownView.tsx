"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type DropDownViewProps = {
  widgetId: number;
};

export default function DropDownView({ widgetId }: DropDownViewProps) {
  const { questions } = useQuestions(widgetId);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const body = currentQuestion?.body || "";
  const data = currentQuestion?.data as { dropdowns?: string[] } | undefined;
  const dropdowns = useMemo(() => data?.dropdowns || [], [data?.dropdowns]);
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  // Create a map of dropdownId -> options array
  const dropdownOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    dropdowns.forEach((dropdownId) => {
      const dropdownOptions = options
        .filter((opt) => opt.match_id === dropdownId)
        .map((opt) => opt.body)
        .filter(Boolean);
      if (dropdownOptions.length > 0) {
        map[dropdownId] = dropdownOptions;
      }
    });
    return map;
  }, [dropdowns, options]);

  const handleSelect = (dropdownId: string, selectedIndex: number) => {
    const newAnswers = { ...answers, [dropdownId]: selectedIndex };
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) {
      console.log("Ответ не выбран");
      return;
    }
    const answer = { answers };
    console.log("Ответ ученика (dropdown):", answer);
  };

  // Render text with inline dropdowns
  const renderContent = () => {
    const parts = body.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const dropdownId = match[1];
        if (dropdowns.includes(dropdownId)) {
          const dropdownOptions = dropdownOptionsMap[dropdownId] || [];
          return (
            <select
              key={index}
              value={answers[dropdownId] ?? ""}
              onChange={(e) => handleSelect(dropdownId, Number(e.target.value))}
              className="mx-1 px-2 py-1 text-base md:text-lg lg:text-xl bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Выберите...
              </option>
              {dropdownOptions.map((opt, optIndex) => (
                <option key={optIndex} value={optIndex}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!currentQuestion || !body) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId} showQuestionBody={false}>
      <div className="text-lg md:text-xl lg:text-2xl text-gray-800 leading-relaxed">
        {renderContent()}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Отправить ответ
        </button>
      </div>
    </TaskViewWrapper>
  );
}
